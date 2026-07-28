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

/** Contrôle envoyé par le moteur pour la question en cours. */
type FieldOption = { label: string; value: string; message?: string };
type Field =
  | { kind: "choix"; key: string; options: FieldOption[]; autre?: string }
  | { kind: "multi"; key: string; options: FieldOption[]; valider: string; aucun?: string }
  | { kind: "nombre"; key: string; min: number; max: number; defaut: number; unite: string; passer?: string };
type FieldAnswer = { key: string; values: string[] };
/** Etat de conversation du moteur serveur : opaque cote client, simplement renvoye tel quel. */
type ConvState = { mode?: string; slots?: Record<string, unknown>; posees?: string[]; tour?: number };

const STORAGE_KEY = "vanyo-assistant-v2";
const MAX_KEPT = 24;

const OPENERS = [
  "Je veux un site",
  "Combien coûte un site ?",
  "Que sais-tu faire ?",
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
    if (typeof window === "undefined") return { messages: [] as Msg[], memory: {} as ConvState };
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return { messages: [] as Msg[], memory: {} as ConvState };
      const saved = JSON.parse(raw) as { messages?: Msg[]; memory?: ConvState };
      return {
        messages: Array.isArray(saved.messages) ? saved.messages.slice(-MAX_KEPT) : [],
        memory: saved.memory ?? {},
      };
    } catch {
      // Stockage indisponible (navigation privée, quota) : on démarre à vide.
      return { messages: [] as Msg[], memory: {} as ConvState };
    }
  })[0];

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(restored.messages);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(OPENERS);
  const [unread, setUnread] = useState(false);
  const [field, setField] = useState<Field | null>(null);
  const [memory, setMemory] = useState<ConvState>(restored.memory);

  const previousPath = useRef<string | undefined>(undefined);
  const scroller = useRef<HTMLDivElement>(null);
  /** La dernière bulle de l'assistant, pour l'amener en haut de la fenêtre. */
  const derniereBulle = useRef<HTMLDivElement>(null);
  const animation = useRef<number | null>(null);
  /** Vide reserve sous le dernier message, pour quil puisse atteindre le haut. */
  const espaceur = useRef<HTMLDivElement>(null);
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

  /**
   * Défilement.
   *
   * Le réflexe habituel — coller au bas de la conversation — est le mauvais
   * ici : une réponse longue, ou suivie d'une liste de choix, arrive alors
   * déjà à moitié sortie par le haut, et le visiteur en rate le début.
   *
   * On amène donc le HAUT de la dernière bulle en haut de la zone visible et
   * on l'y laisse : la réponse se lit de la première ligne à la dernière.
   * Sauf si tout tient à l'écran, auquel cas il n'y a rien à faire.
   */
  const calerEnHaut = useCallback(() => {
    const zone = scroller.current;
    const bulle = derniereBulle.current;
    if (!zone || !bulle) return;

    // Sans espace après le dernier message, celui-ci ne peut pas remonter
    // plus haut que ce que le contenu autorise : sur une réponse courte, il
    // reste collé en bas. On réserve donc juste ce qu'il faut de vide en
    // dessous pour qu'il puisse toujours atteindre le haut.
    const espace = espaceur.current;
    if (espace) {
      const requis = Math.max(0, zone.clientHeight - bulle.offsetHeight - 24);
      if (espace.offsetHeight !== requis) espace.style.height = `${requis}px`;
    }

    const debordement = zone.scrollHeight - zone.clientHeight;
    if (debordement <= 0) return;

    // Position mesurée à l'écran plutôt que via `offsetTop` : ce dernier se
    // compte depuis le premier ancêtre positionné, qui est le panneau et non
    // la zone de défilement — la hauteur de l'en-tête venait donc fausser le
    // calcul d'exactement autant de pixels.
    const haut = bulle.getBoundingClientRect().top - zone.getBoundingClientRect().top + zone.scrollTop;
    const cible = Math.min(Math.max(0, haut - 12), debordement);
    if (Math.abs(zone.scrollTop - cible) < 2) return;

    const doux = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    try {
      zone.scrollTo({ top: cible, behavior: doux ? "smooth" : "auto" });
    } catch {
      zone.scrollTop = cible;
    }

    // Garde-fou : le défilement animé est piloté par le compositeur, qui ne
    // tourne pas dans un onglet en arrière-plan ni dans certains aperçus
    // intégrés. Si rien n'a bougé, on repositionne sèchement — mieux vaut un
    // saut qu'une réponse dont le début reste hors champ.
    window.setTimeout(() => {
      if (Math.abs(zone.scrollTop - cible) > 8) zone.scrollTop = cible;
    }, 420);
  }, []);

  useEffect(() => {
    if (!open) return;

    // Après la peinture, mais sans dépendre de la composition d'une image.
    const t = window.setTimeout(calerEnHaut, 30);

    // La bulle continue de grandir après ce premier calage : le texte se
    // déroule, puis les boutons du formulaire apparaissent. Un calcul fait à
    // un instant fixe serait donc toujours périmé pour les réponses longues.
    // On suit la taille réelle et on recale à chaque changement.
    const bulle = derniereBulle.current;
    if (!bulle || typeof ResizeObserver === "undefined") return () => clearTimeout(t);

    let attente: number | null = null;
    const observateur = new ResizeObserver(() => {
      if (attente) clearTimeout(attente);
      attente = window.setTimeout(calerEnHaut, 60);
    });
    observateur.observe(bulle);

    return () => {
      clearTimeout(t);
      if (attente) clearTimeout(attente);
      observateur.disconnect();
    };
  }, [messages.length, field, open, calerEnHaut]);

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

  /**
   * Retient le prénom que le visiteur donne de lui-même — jamais deviné.
   * Le reste (métier, pages, besoins) est extrait côté serveur par le moteur.
   */
  const remember = useCallback((text: string) => {
    const prenom = text.match(/\b(?:je m['’]appelle|moi c['’]est|je suis)\s+([A-ZÀ-Ý][\p{L}-]{1,20})/u)?.[1];
    if (!prenom) return;
    setMemory((m) => (m.slots?.prenom ? m : { ...m, slots: { ...m.slots, prenom } }));
  }, []);

  /**
   * Écrit la réponse progressivement.
   *
   * Le moteur répond en une milliseconde ; afficher le pavé d'un coup fait
   * brutal, et rythmer l'envoi côté serveur donnait un texte saccadé, au
   * rythme du réseau. On reçoit donc tout d'un bloc et on le déroule ici,
   * calé sur l'horloge d'affichage : c'est régulier quoi qu'il arrive.
   */
  const derouler = useCallback((texte: string) => {
    return new Promise<void>((resolve) => {
      const CARACTERES_PAR_SECONDE = 1100;
      const rapide = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (rapide || texte.length < 40) {
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: texte };
          return copy;
        });
        resolve();
        return;
      }

      // Minuterie plutôt que `requestAnimationFrame` : celui-ci ne se
      // déclenche pas tant que l'onglet ne compose pas d'image — onglet en
      // arrière-plan, fenêtre réduite, aperçu intégré. La réponse restait
      // alors figée jusqu'au retour du visiteur.
      //
      // L'avancement est calculé sur l'horloge, pas sur le nombre de tours :
      // même si les tics sont ralentis, le texte reste à la bonne cadence et
      // se termine toujours.
      const debut = performance.now();
      const etape = () => {
        const n = Math.min(
          texte.length,
          Math.ceil(((performance.now() - debut) / 1000) * CARACTERES_PAR_SECONDE),
        );
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: texte.slice(0, n) };
          return copy;
        });
        if (n < texte.length) animation.current = window.setTimeout(etape, 16);
        else resolve();
      };
      animation.current = window.setTimeout(etape, 16);
    });
  }, []);

  const send = useCallback(
    async (raw: string, answer?: FieldAnswer) => {
      const text = raw.trim();
      if (!text || busy) return;

      abort.current?.abort();
      if (animation.current) clearTimeout(animation.current);
      const controller = new AbortController();
      abort.current = controller;

      remember(text);
      setInput("");
      setSuggestions([]);
      setField(null);
      setBusy(true);

      const next: Msg[] = [...messages, { role: "user", content: text }];
      setMessages([...next, { role: "assistant", content: "" }]);

      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "content-type": "application/json" },
          signal: controller.signal,
          // Le serveur est sans mémoire : l'état de la conversation fait
          // l'aller-retour avec chaque message.
          body: JSON.stringify({ message: text, answer, state: memory, page: { path: pathname } }),
        });

        if (!res.ok || !res.body) throw new Error(String(res.status));

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let texteRecu = "";
        // Conteneur plutôt que variable simple : l'affectation a lieu dans une
        // fonction imbriquée, que l'analyse de flux de TypeScript ne suit pas.
        const aSuivre: {
          valeur: { navigate?: string | null; suggestions?: string[]; field?: Field | null; state?: ConvState } | null;
        } = { valeur: null };

        const apply = (payload: {
          type: string;
          v?: string;
          navigate?: string | null;
          suggestions?: string[];
          field?: Field | null;
          state?: ConvState;
        }) => {
          if (payload.type === "text" && payload.v) {
            texteRecu += payload.v;
          } else if (payload.type === "error" && payload.v) {
            texteRecu = payload.v;
          } else if (payload.type === "actions") {
            // Mémorisées ici, appliquées après le déroulé du texte : les
            // boutons ne doivent pas apparaître avant la fin de la phrase.
            aSuivre.valeur = payload;
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

        // Le texte est reçu en entier : on le déroule maintenant, à cadence
        // régulière, puis seulement on affiche boutons et formulaire.
        await derouler(
          texteRecu || "Je n'ai pas réussi à répondre. Réessayez, ou passez par le formulaire de contact.",
        );

        const suite = aSuivre.valeur;
        if (suite) {
          if (suite.state) setMemory(suite.state);
          if (suite.field) setField(suite.field);
          if (suite.suggestions?.length) setSuggestions(suite.suggestions);
          // Le texte est complet et les boutons sont posés : on remonte au
          // début de la réponse pour que rien ne soit passé sous le bord.
          window.setTimeout(calerEnHaut, 40);
          if (suite.navigate && suite.navigate !== pathname) {
            // Un temps de lecture avant que la page change sous les yeux.
            const cible = suite.navigate;
            setTimeout(() => router.push(cible), 900);
          }
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
    [busy, calerEnHaut, derouler, messages, memory, open, pathname, remember, router],
  );

  const reset = () => {
    abort.current?.abort();
    if (animation.current) clearTimeout(animation.current);
    setMessages([]);
    setMemory({});
    setSuggestions(OPENERS);
    setField(null);
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
        className="fixed bottom-5 right-5 z-[9995] grid h-14 w-14 place-items-center rounded-full border border-vanyo-500/40 bg-vanyo-500/15 text-white shadow-lg backdrop-blur-xl transition hover:scale-105 hover:bg-vanyo-500/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vanyo-500 sm:bottom-6 sm:right-6"
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
          className="fixed inset-x-3 bottom-24 z-[9992] flex max-h-[min(70vh,560px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[rgb(var(--card-rgb,17_17_24))]/95 shadow-2xl backdrop-blur-2xl sm:inset-x-auto sm:right-6 sm:w-[400px]"
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

          <div
            ref={scroller}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            aria-live="polite"
          >
            {shown.map((m, i) => (
              <div
                key={i}
                ref={i === shown.length - 1 ? derniereBulle : undefined}
                className={`assistant-bulle ${m.role === "user" ? "flex justify-end" : "flex justify-start"}`}
              >
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-vanyo-500/25 px-3.5 py-2.5 text-sm leading-relaxed text-white"
                      : "max-w-[92%] whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-white/8 px-3.5 py-2.5 text-sm leading-relaxed text-white/85"
                  }
                >
                  {m.content || (busy && i === shown.length - 1 ? <TypingDots /> : null)}

                  {/* Le formulaire s'affiche dans la bulle de la question,
                      juste sous le texte : le visiteur n'a pas à chercher où
                      répondre. */}
                  {field && !busy && m.role === "assistant" && i === shown.length - 1 && (
                    <InlineField
                      key={`${field.key}-${shown.length}`}
                      field={field}
                      onAnswer={(label, answer) => send(label, answer)}
                    />
                  )}
                </div>
              </div>
            ))}
            <div ref={espaceur} aria-hidden className="shrink-0" />
          </div>

          {/* Les suggestions libres sont masquées tant qu'un formulaire est
              ouvert : deux jeux de boutons côte à côte brouilleraient
              l'action attendue. */}
          {suggestions.length > 0 && !busy && !field && (
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

/**
 * Le formulaire intégré à la bulle.
 *
 * Chaque question de l'entretien s'accompagne du contrôle qui va bien :
 * une liste de choix, une sélection multiple ou un compteur. Le visiteur
 * répond d'un clic — plus rien à taper, donc plus de faute de frappe, plus
 * d'hésitation sur la formulation, et beaucoup moins d'abandons.
 *
 * Le champ de saisie reste disponible : celui qui préfère écrire le peut.
 */
function InlineField({
  field,
  onAnswer,
}: {
  field: Field;
  onAnswer: (label: string, answer: FieldAnswer) => void;
}) {
  const [selection, setSelection] = useState<string[]>([]);
  const [nombre, setNombre] = useState(field.kind === "nombre" ? field.defaut : 0);

  if (field.kind === "choix") {
    return (
      <div className="mt-2 flex flex-col gap-1.5">
        {field.options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onAnswer(o.message ?? o.label, { key: field.key, values: [o.value] })}
            className="rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-left text-[13px] text-white/80 transition hover:border-vanyo-500/50 hover:bg-vanyo-500/12 hover:text-white"
          >
            {o.label}
          </button>
        ))}
        {field.autre && (
          <p className="px-1 pt-0.5 text-[11px] text-white/35">
            {field.autre} — écrivez-le simplement ci-dessous.
          </p>
        )}
      </div>
    );
  }

  if (field.kind === "multi") {
    const bascule = (v: string) =>
      setSelection((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]));

    return (
      <div className="mt-2">
        <div className="flex flex-wrap gap-1.5">
          {field.options.map((o) => {
            const actif = selection.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                aria-pressed={actif}
                onClick={() => bascule(o.value)}
                className={`rounded-full border px-2.5 py-1 text-[12px] transition ${
                  actif
                    ? "border-vanyo-500/60 bg-vanyo-500/25 text-white"
                    : "border-white/12 bg-white/5 text-white/70 hover:border-white/30"
                }`}
              >
                {actif ? "✓ " : ""}
                {o.label}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            disabled={selection.length === 0}
            onClick={() =>
              onAnswer(
                field.options
                  .filter((o) => selection.includes(o.value))
                  .map((o) => o.label)
                  .join(", "),
                { key: field.key, values: selection },
              )
            }
            className="rounded-xl border border-vanyo-500/40 bg-vanyo-500/20 px-3 py-1.5 text-[12px] text-white transition hover:bg-vanyo-500/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {field.valider}
            {selection.length > 0 ? ` (${selection.length})` : ""}
          </button>
          {field.aucun && (
            <button
              type="button"
              onClick={() => onAnswer(field.aucun as string, { key: field.key, values: [] })}
              className="text-[12px] text-white/45 underline-offset-2 transition hover:text-white/80 hover:underline"
            >
              {field.aucun}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Compteur
  const borne = (n: number) => Math.min(field.max, Math.max(field.min, n));
  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="flex items-center gap-1 rounded-xl border border-white/12 bg-white/5 p-1">
        <button
          type="button"
          aria-label="Moins"
          onClick={() => setNombre((n) => borne(n - 1))}
          className="grid h-7 w-7 place-items-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          −
        </button>
        <span className="min-w-[4.5rem] text-center text-[13px] text-white">
          {nombre} {field.unite}
          {nombre > 1 ? "s" : ""}
        </span>
        <button
          type="button"
          aria-label="Plus"
          onClick={() => setNombre((n) => borne(n + 1))}
          className="grid h-7 w-7 place-items-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={() =>
          onAnswer(`${nombre} ${field.unite}${nombre > 1 ? "s" : ""}`, {
            key: field.key,
            values: [String(nombre)],
          })
        }
        className="rounded-xl border border-vanyo-500/40 bg-vanyo-500/20 px-3 py-1.5 text-[12px] text-white transition hover:bg-vanyo-500/30"
      >
        Valider
      </button>
      {field.passer && (
        <button
          type="button"
          onClick={() => onAnswer(field.passer as string, { key: field.key, values: [] })}
          className="text-[12px] text-white/45 underline-offset-2 transition hover:text-white/80 hover:underline"
        >
          {field.passer}
        </button>
      )}
    </div>
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
