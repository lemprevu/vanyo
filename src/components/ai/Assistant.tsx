"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MessageCircle, X, Send, Sparkles, RotateCcw, ArrowUpRight } from "lucide-react";

/**
 * Assistant Vanyo — widget conversationnel.
 *
 * Il connaît le site (voir `src/lib/ai/knowledge.ts`), sait sur quelle page
 * se trouve le visiteur, retient ce qu'il lui a dit, et peut ouvrir une page
 * quand on le lui demande. Tout est rendu côté client après hydratation :
 * aucun impact sur le HTML indexé par Google.
 */

type Msg = { role: "user" | "assistant"; content: string };
type Memory = { prenom?: string; projet?: string; besoins?: string[] };

const STORAGE_KEY = "vanyo-assistant-v1";
const MAX_KEPT = 24;

const OPENERS = [
  "Combien coûte un site ?",
  "Montrez-moi vos réalisations",
  "Quels sont vos délais ?",
];

/** Message d'accueil, adapté à la page consultée. */
function greeting(path: string): string {
  if (path.startsWith("/tarifs")) return "Bonjour ! Vous regardez nos formules — je peux vous aider à trouver celle qui correspond à votre projet. Quel est votre secteur d'activité ?";
  if (path.startsWith("/devis")) return "Bonjour ! Je peux vous accompagner pendant le formulaire : si un champ n'est pas clair, demandez-moi.";
  if (path.startsWith("/realisations")) return "Bonjour ! Vous parcourez nos réalisations. Un type de projet en particulier vous intéresse ?";
  if (path.startsWith("/contact")) return "Bonjour ! Une question avant d'envoyer votre message ? Je peux y répondre tout de suite.";
  if (path.startsWith("/blog")) return "Bonjour ! Si un point de l'article mérite d'être creusé pour votre projet, je suis là.";
  return "Bonjour ! Je suis l'assistant Vanyo. Posez-moi vos questions sur nos sites, nos tarifs ou nos délais — je réponds tout de suite.";
}

export function Assistant() {
  const pathname = usePathname() || "/";
  const router = useRouter();

  // La conversation est relue au premier rendu client, pas dans un effet :
  // cela évite un rendu supplémentaire et le clignotement associé. Le panneau
  // étant fermé au départ, rien de ce qui est relu n'est affiché tout de
  // suite — l'hydratation reste identique au HTML rendu côté serveur.
  const restored = useState(() => {
    if (typeof window === "undefined") return { messages: [] as Msg[], memory: {} as Memory };
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return { messages: [] as Msg[], memory: {} as Memory };
      const saved = JSON.parse(raw) as { messages?: Msg[]; memory?: Memory };
      return {
        messages: Array.isArray(saved.messages) ? saved.messages.slice(-MAX_KEPT) : [],
        memory: saved.memory ?? {},
      };
    } catch {
      // Stockage indisponible (navigation privée, quota) : on démarre à vide.
      return { messages: [] as Msg[], memory: {} as Memory };
    }
  })[0];

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(restored.messages);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(OPENERS);
  const [unread, setUnread] = useState(false);
  const [memory, setMemory] = useState<Memory>(restored.memory);

  const previousPath = useRef<string | undefined>(undefined);
  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abort = useRef<AbortController | null>(null);

  /* ── Persistance ─────────────────────────────────────────── */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages: messages.slice(-MAX_KEPT), memory }));
    } catch {
      /* quota dépassé : sans conséquence */
    }
  }, [messages, memory]);

  /* ── Suivi de la page précédente ─────────────────────────── */
  useEffect(() => {
    return () => {
      previousPath.current = pathname;
    };
  }, [pathname]);

  /* ── Défilement automatique ──────────────────────────────── */
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy, open]);

  /* ── Fermeture au clavier ────────────────────────────────── */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  /** Ouvre/ferme le panneau ; l'ouverture acquitte la pastille « non lu ». */
  const toggle = () =>
    setOpen((wasOpen) => {
      if (!wasOpen) setUnread(false);
      return !wasOpen;
    });

  /** Retient ce que le visiteur donne de lui-même, sans jamais le deviner. */
  const remember = useCallback((text: string) => {
    const prenom = text.match(/\b(?:je m['’]appelle|moi c['’]est|je suis)\s+([A-ZÀ-Ý][\p{L}-]{1,20})/u)?.[1];
    if (prenom) setMemory((m) => (m.prenom ? m : { ...m, prenom }));
  }, []);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || busy) return;

      abort.current?.abort();
      const controller = new AbortController();
      abort.current = controller;

      remember(text);
      setInput("");
      setSuggestions([]);
      setBusy(true);

      const next: Msg[] = [...messages, { role: "user", content: text }];
      setMessages([...next, { role: "assistant", content: "" }]);

      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "content-type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            messages: next.slice(-12),
            page: {
              path: pathname,
              title: typeof document !== "undefined" ? document.title : undefined,
              previousPath: previousPath.current,
            },
            memory,
          }),
        });

        if (!res.ok || !res.body) throw new Error(String(res.status));

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let answer = "";

        const apply = (payload: { type: string; v?: string; navigate?: string | null; suggestions?: string[] }) => {
          if (payload.type === "text" && payload.v) {
            answer += payload.v;
            setMessages((prev) => {
              const copy = [...prev];
              copy[copy.length - 1] = { role: "assistant", content: answer };
              return copy;
            });
          } else if (payload.type === "error" && payload.v) {
            answer = payload.v;
            setMessages((prev) => {
              const copy = [...prev];
              copy[copy.length - 1] = { role: "assistant", content: answer };
              return copy;
            });
          } else if (payload.type === "actions") {
            if (payload.suggestions?.length) setSuggestions(payload.suggestions);
            if (payload.navigate && payload.navigate !== pathname) {
              // Petit délai : le visiteur voit la réponse avant que la page change.
              const target = payload.navigate;
              setTimeout(() => router.push(target), 700);
            }
          }
        };

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";
          for (const part of parts) {
            const line = part.trim();
            if (!line.startsWith("data:")) continue;
            try {
              apply(JSON.parse(line.slice(5).trim()));
            } catch {
              /* trame incomplète : ignorée */
            }
          }
        }

        if (!answer) {
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = {
              role: "assistant",
              content: "Je n'ai pas réussi à répondre. Réessayez, ou passez par le formulaire de contact.",
            };
            return copy;
          });
        }
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: "assistant",
            content: "La connexion a échoué. Réessayez dans un instant, ou écrivez-nous via /contact.",
          };
          return copy;
        });
      } finally {
        setBusy(false);
        if (!open) setUnread(true);
      }
    },
    [busy, messages, memory, open, pathname, remember, router],
  );

  const reset = () => {
    abort.current?.abort();
    setMessages([]);
    setMemory({});
    setSuggestions(OPENERS);
    setBusy(false);
  };

  const shown: Msg[] = messages.length
    ? messages
    : [{ role: "assistant", content: greeting(pathname) }];

  return (
    <>
      {/* Bouton flottant */}
      <button
        type="button"
        onClick={toggle}
        aria-label={open ? "Fermer l'assistant Vanyo" : "Ouvrir l'assistant Vanyo"}
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-[70] grid h-14 w-14 place-items-center rounded-full border border-vanyo-500/40 bg-vanyo-500/15 text-white shadow-lg backdrop-blur-xl transition hover:scale-105 hover:bg-vanyo-500/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vanyo-500 sm:bottom-6 sm:right-6"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        {unread && !open && (
          <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-emerald-400" aria-hidden />
        )}
      </button>

      {/* Panneau */}
      {open && (
        <div
          role="dialog"
          aria-label="Assistant Vanyo"
          className="fixed inset-x-3 bottom-24 z-[69] flex max-h-[min(70vh,560px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[rgb(var(--card-rgb,17_17_24))]/95 shadow-2xl backdrop-blur-2xl sm:inset-x-auto sm:right-6 sm:w-[400px]"
        >
          <header className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-vanyo-500/20 text-vanyo-200">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">Assistant Vanyo</p>
              <p className="truncate text-[11px] text-white/45">Répond à partir du contenu du site</p>
            </div>
            <button
              type="button"
              onClick={reset}
              title="Nouvelle conversation"
              aria-label="Nouvelle conversation"
              className="rounded-lg p-1.5 text-white/45 transition hover:bg-white/10 hover:text-white"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              className="rounded-lg p-1.5 text-white/45 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
            {shown.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-vanyo-500/25 px-3.5 py-2.5 text-sm leading-relaxed text-white"
                      : "max-w-[90%] whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-white/8 px-3.5 py-2.5 text-sm leading-relaxed text-white/85"
                  }
                >
                  {m.content || (busy && i === shown.length - 1 ? <TypingDots /> : null)}
                </div>
              </div>
            ))}
          </div>

          {suggestions.length > 0 && !busy && (
            <div className="flex flex-wrap gap-1.5 px-4 pb-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="inline-flex items-center gap-1 rounded-full border border-white/12 bg-white/5 px-2.5 py-1 text-[11px] text-white/70 transition hover:border-vanyo-500/40 hover:bg-vanyo-500/12 hover:text-white"
                >
                  {s}
                  <ArrowUpRight className="h-3 w-3 opacity-60" />
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-end gap-2 border-t border-white/10 px-3 py-3"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              maxLength={2000}
              placeholder="Votre question…"
              aria-label="Votre question"
              className="max-h-28 min-h-[2.5rem] flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-vanyo-500/50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Envoyer"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-vanyo-500/40 bg-vanyo-500/20 text-white transition hover:bg-vanyo-500/30 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1" aria-label="L'assistant rédige sa réponse">
      {[0, 150, 300].map((d) => (
        <span
          key={d}
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/50"
          style={{ animationDelay: `${d}ms` }}
        />
      ))}
    </span>
  );
}
