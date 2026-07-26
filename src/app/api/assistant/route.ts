import Anthropic from "@anthropic-ai/sdk";
import { getSiteSettings } from "@/lib/data";
import { resolveCatalog } from "@/lib/catalog";
import { buildKnowledge, PAGES } from "@/lib/ai/knowledge";
import { buildIndex, search, type SearchIndex } from "@/lib/ai/retrieval";
import { ACTION_MARKER, buildSystemPrompt, fallbackAnswer, type Memory, type PageContext } from "@/lib/ai/prompt";
import { rateLimit, clientIp } from "@/lib/rateLimit";

/**
 * Point d'entrée de l'assistant.
 *
 * Le flux est du Server-Sent Events : le texte arrive mot à mot, puis un
 * dernier événement porte les actions (navigation, suggestions). La ligne
 * technique `⟦ACTIONS⟧{…}` que le modèle écrit en fin de réponse est retenue
 * côté serveur et n'atteint jamais l'écran du visiteur.
 *
 * Sans clé d'API, la route ne tombe pas en panne : elle répond avec le
 * meilleur extrait trouvé par la recherche locale.
 */

export const runtime = "nodejs";
// Chaque réponse dépend du message : rien à mettre en cache.
export const dynamic = "force-dynamic";

const MODEL = "claude-opus-5";
const MAX_MESSAGE_CHARS = 2000;
const MAX_HISTORY = 12;

/* ------------------------------------------------------------------ */
/*  Index de recherche (mis en cache par version du catalogue)         */
/* ------------------------------------------------------------------ */

let cached: { key: string; index: SearchIndex } | null = null;

function getIndex(overrides: unknown): SearchIndex {
  const key = JSON.stringify(overrides ?? null);
  if (cached?.key === key) return cached.index;
  const index = buildIndex(buildKnowledge(overrides as never));
  cached = { key, index };
  return index;
}

/* ------------------------------------------------------------------ */
/*  Validation des entrées                                             */
/* ------------------------------------------------------------------ */

type InMessage = { role: "user" | "assistant"; content: string };

const KNOWN_PATHS = new Set(PAGES.map((p) => p.url));

/** N'autorise que les chemins internes réellement présents sur le site. */
function safePath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  if (!v.startsWith("/") || v.startsWith("//")) return null;
  if (KNOWN_PATHS.has(v)) return v;
  // Les sous-pages dynamiques connues (article, ville) restent acceptables.
  if (/^\/(blog|villes|realisations)\/[a-z0-9-]{2,60}$/.test(v)) return v;
  return null;
}

function sse(payload: unknown): string {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

/* ------------------------------------------------------------------ */
/*  Route                                                              */
/* ------------------------------------------------------------------ */

export async function POST(req: Request) {
  const ip = clientIp(req);
  // 20 messages par minute : large pour une conversation, court pour un script.
  if (!rateLimit(`assistant:${ip}`, 20, 60_000).ok) {
    return new Response(JSON.stringify({ error: "Trop de messages d'affilée. Réessayez dans une minute." }), {
      status: 429,
      headers: { "content-type": "application/json" },
    });
  }

  let body: {
    messages?: InMessage[];
    page?: PageContext;
    memory?: Memory;
  };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Requête invalide." }), { status: 400 });
  }

  const history = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }))
    .filter((m) => m.content.trim().length > 0)
    .slice(-MAX_HISTORY);

  const lastUser = [...history].reverse().find((m) => m.role === "user");
  if (!lastUser) {
    return new Response(JSON.stringify({ error: "Aucun message." }), { status: 400 });
  }

  const settings = await getSiteSettings();
  const overrides = settings.catalog ?? null;
  const catalog = resolveCatalog(overrides);
  const index = getIndex(overrides);

  const page: PageContext = {
    path: safePath(body.page?.path) ?? undefined,
    title: typeof body.page?.title === "string" ? body.page.title.slice(0, 120) : undefined,
    previousPath: safePath(body.page?.previousPath) ?? undefined,
    formName: typeof body.page?.formName === "string" ? body.page.formName.slice(0, 60) : undefined,
    formStep: typeof body.page?.formStep === "string" ? body.page.formStep.slice(0, 60) : undefined,
  };

  const memory: Memory = {
    prenom: typeof body.memory?.prenom === "string" ? body.memory.prenom.slice(0, 40) : undefined,
    projet: typeof body.memory?.projet === "string" ? body.memory.projet.slice(0, 200) : undefined,
    besoins: Array.isArray(body.memory?.besoins)
      ? body.memory.besoins.filter((b): b is string => typeof b === "string").slice(0, 8).map((b) => b.slice(0, 60))
      : undefined,
  };

  // La recherche porte sur la dernière question, élargie par les questions
  // précédentes et la page consultée : c'est ce qui permet de comprendre
  // « et le prix ? » posé juste après une question sur la maintenance.
  //
  // On n'y met QUE les messages du visiteur, tronqués. Les réponses de
  // l'assistant sont longues et bourrées de termes du catalogue : les inclure
  // faisait gagner le sujet du tour précédent sur la question réellement posée.
  const contextText = [
    ...history
      .slice(0, -1)
      .filter((m) => m.role === "user")
      .slice(-2)
      .map((m) => m.content.slice(0, 160)),
    page.path ?? "",
  ].join(" ");
  const hits = search(index, lastUser.content, { limit: 8, context: contextText }).map((h) => h.chunk);

  const apiKey = process.env.ANTHROPIC_API_KEY;

  /* ── Sans clé : recherche locale seule ─────────────────────── */
  if (!apiKey) {
    const fb = fallbackAnswer(hits);
    const stream = new ReadableStream({
      start(controller) {
        const enc = new TextEncoder();
        controller.enqueue(enc.encode(sse({ type: "text", v: fb.text })));
        controller.enqueue(enc.encode(sse({ type: "actions", navigate: fb.navigate, suggestions: fb.suggestions })));
        controller.enqueue(enc.encode(sse({ type: "done" })));
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { "content-type": "text/event-stream; charset=utf-8", "cache-control": "no-store" },
    });
  }

  /* ── Avec clé : réponse générée, en flux ───────────────────── */
  const client = new Anthropic({ apiKey });
  const system = buildSystemPrompt({ catalog, hits, page, memory });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (o: unknown) => controller.enqueue(encoder.encode(sse(o)));

      // Tampon de fin de flux : on ne diffuse pas un morceau de texte qui
      // pourrait être le début du marqueur d'actions, sinon il apparaîtrait
      // une fraction de seconde à l'écran avant d'être retiré.
      let tail = "";
      let full = "";
      let inActions = false;

      const flush = (chunk: string) => {
        if (inActions) {
          full += chunk;
          return;
        }
        tail += chunk;
        full += chunk;

        const at = tail.indexOf(ACTION_MARKER);
        if (at !== -1) {
          const visible = tail.slice(0, at);
          if (visible) send({ type: "text", v: visible });
          inActions = true;
          tail = "";
          return;
        }
        // On retient les derniers caractères susceptibles d'amorcer le marqueur.
        const keep = Math.min(tail.length, ACTION_MARKER.length - 1);
        const emit = tail.slice(0, tail.length - keep);
        tail = tail.slice(tail.length - keep);
        if (emit) send({ type: "text", v: emit });
      };

      try {
        const s = client.messages.stream({
          model: MODEL,
          max_tokens: 1500,
          // Réponse conversationnelle courte : une réflexion légère suffit et
          // garde la latence acceptable pour un chat.
          thinking: { type: "adaptive" },
          output_config: { effort: "low" },
          system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
          messages: history,
        });

        for await (const event of s) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            flush(event.delta.text);
          }
        }

        const final = await s.finalMessage();
        if (final.stop_reason === "refusal") {
          send({ type: "text", v: "Je préfère ne pas répondre à cette demande. Je peux en revanche vous aider sur votre projet de site." });
          send({ type: "actions", navigate: null, suggestions: ["Combien coûte un site ?", "Je veux un devis"] });
          send({ type: "done" });
          controller.close();
          return;
        }

        // Ce qui restait dans le tampon sans marqueur est du vrai texte.
        if (!inActions && tail) send({ type: "text", v: tail });

        // Extraction des actions.
        let navigate: string | null = null;
        let suggestions: string[] = [];
        const at = full.indexOf(ACTION_MARKER);
        if (at !== -1) {
          const raw = full.slice(at + ACTION_MARKER.length).trim();
          try {
            const parsed = JSON.parse(raw) as { navigate?: unknown; suggestions?: unknown };
            navigate = safePath(parsed.navigate);
            suggestions = Array.isArray(parsed.suggestions)
              ? parsed.suggestions.filter((x): x is string => typeof x === "string").slice(0, 3).map((x) => x.slice(0, 60))
              : [];
          } catch {
            // Marqueur mal formé : on ignore, la réponse texte reste valable.
          }
        }

        send({ type: "actions", navigate, suggestions });
        send({ type: "done" });
      } catch (err) {
        console.error("[assistant]", err);
        send({
          type: "error",
          v: "Je n'arrive pas à répondre pour le moment. Vous pouvez nous écrire via le formulaire de contact.",
        });
      } finally {
        try {
          controller.close();
        } catch {
          /* déjà fermé */
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-store, no-transform",
      connection: "keep-alive",
    },
  });
}
