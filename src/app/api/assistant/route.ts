import { getSiteSettings } from "@/lib/data";
import { resolveCatalog } from "@/lib/catalog";
import { buildKnowledge, PAGES } from "@/lib/ai/knowledge";
import { buildIndex, type SearchIndex } from "@/lib/ai/retrieval";
import { analyze } from "@/lib/ai/nlu";
import { respond, initialState, type DialogueState, type FieldAnswer } from "@/lib/ai/dialogue";
import { rateLimit, clientIp } from "@/lib/rateLimit";

/**
 * Assistant Vanyo — moteur intégral, hébergé chez vous.
 *
 * Aucun service extérieur, aucune clé d'API, aucun coût à l'usage et aucune
 * limite : la compréhension (`lib/ai/nlu.ts`) et le dialogue
 * (`lib/ai/dialogue.ts`) tournent dans ce processus, et les réponses sont
 * composées à partir du catalogue réel. Un prix affiché ici est, par
 * construction, le prix du site.
 *
 * La réponse part en flux mot à mot : c'est instantané côté serveur, mais le
 * rendu progressif rend la lecture plus naturelle qu'un bloc qui apparaît
 * d'un coup.
 *
 * L'état de la conversation voyage avec la requête et revient avec la
 * réponse : le serveur reste sans mémoire, ce qui le rend insensible au
 * nombre d'instances déployées.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MESSAGE_CHARS = 800;

/* ------------------------------------------------------------------ */
/*  Index de recherche (repli documentaire)                            */
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
/*  Validation                                                         */
/* ------------------------------------------------------------------ */

const KNOWN_PATHS = new Set(PAGES.map((p) => p.url));

/** N'autorise que les chemins internes réellement présents sur le site. */
function safePath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  if (!v.startsWith("/") || v.startsWith("//")) return null;
  if (KNOWN_PATHS.has(v)) return v;
  if (/^\/(blog|villes|realisations)\/[a-z0-9-]{2,60}$/.test(v)) return v;
  return null;
}

/**
 * L'état revient du navigateur : il est donc à considérer comme non fiable.
 * On le reconstruit champ par champ, en bornant tout.
 */
function safeState(raw: unknown): DialogueState {
  const base = initialState();
  if (!raw || typeof raw !== "object") return base;
  const s = raw as Partial<DialogueState>;
  const slots = (s.slots ?? {}) as Record<string, unknown>;

  const str = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.slice(0, max) : undefined);
  const num = (v: unknown, min: number, max: number) =>
    typeof v === "number" && Number.isFinite(v) && v >= min && v <= max ? Math.round(v) : undefined;

  return {
    mode: s.mode === "entretien" || s.mode === "conseil_donne" ? s.mode : "libre",
    tour: num(s.tour, 0, 200) ?? 0,
    posees: Array.isArray(s.posees)
      ? s.posees.filter((p): p is string => typeof p === "string").slice(0, 10)
      : [],
    repondues: Array.isArray(s.repondues)
      ? s.repondues.filter((p): p is string => typeof p === "string").slice(0, 10)
      : [],
    slots: {
      metier: str(slots.metier, 60),
      ville: str(slots.ville, 40),
      prenom: str(slots.prenom, 40),
      pages: num(slots.pages, 1, 200),
      budget: num(slots.budget, 50, 200000),
      siteExistant: typeof slots.siteExistant === "boolean" ? slots.siteExistant : undefined,
      besoins: Array.isArray(slots.besoins)
        ? slots.besoins.filter((b): b is string => typeof b === "string").slice(0, 12).map((b) => b.slice(0, 40))
        : undefined,
    },
  };
}

/** Clés de créneau que le formulaire intégré a le droit de renseigner. */
const CLES_FORMULAIRE = new Set(["metier", "siteExistant", "besoins", "pages"]);

function safeAnswer(raw: unknown): FieldAnswer | null {
  if (!raw || typeof raw !== "object") return null;
  const a = raw as { key?: unknown; values?: unknown };
  if (typeof a.key !== "string" || !CLES_FORMULAIRE.has(a.key)) return null;
  if (!Array.isArray(a.values)) return null;
  const values = a.values
    .filter((v): v is string => typeof v === "string")
    .slice(0, 12)
    .map((v) => v.slice(0, 60));
  return { key: a.key, values };
}

const sse = (payload: unknown) => `data: ${JSON.stringify(payload)}\n\n`;

/* ------------------------------------------------------------------ */
/*  Route                                                              */
/* ------------------------------------------------------------------ */

export async function POST(req: Request) {
  const ip = clientIp(req);
  // Généreux : le moteur est gratuit, la limite ne sert qu'à écarter les robots.
  if (!rateLimit(`assistant:${ip}`, 60, 60_000).ok) {
    return new Response(JSON.stringify({ error: "Trop de messages d'affilée. Réessayez dans une minute." }), {
      status: 429,
      headers: { "content-type": "application/json" },
    });
  }

  let body: { message?: unknown; state?: unknown; page?: { path?: unknown }; answer?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Requête invalide." }), { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.slice(0, MAX_MESSAGE_CHARS).trim() : "";
  if (!message) {
    return new Response(JSON.stringify({ error: "Aucun message." }), { status: 400 });
  }

  // Réponse cliquée dans le formulaire intégré. Elle vient du navigateur,
  // donc elle est bornée comme le reste : une clé connue, des valeurs courtes.
  const answer = safeAnswer(body.answer);

  const settings = await getSiteSettings();
  const overrides = settings.catalog ?? null;

  const reply = respond({
    analysis: analyze(message),
    state: safeState(body.state),
    catalog: resolveCatalog(overrides),
    index: getIndex(overrides),
    path: safePath(body.page?.path) ?? undefined,
    answer,
  });

  const navigate = safePath(reply.navigate);

  /* ── Diffusion progressive ─────────────────────────────────── */
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const send = (o: unknown) => controller.enqueue(encoder.encode(sse(o)));

      // Le texte part d'un bloc : c'est le navigateur qui le déroule, calé
      // sur son horloge d'affichage. Rythmer l'envoi ici produisait un texte
      // saccadé, au gré de la latence réseau.
      send({ type: "text", v: reply.text });

      send({
        type: "actions",
        navigate,
        suggestions: reply.suggestions,
        field: reply.field ?? null,
        state: reply.state,
      });
      send({ type: "done" });
      controller.close();
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
