/**
 * Maîtrise du coût de l'assistant.
 *
 * Deux mécanismes, dans cet ordre :
 *
 *  1. Un cache de réponses. Les visiteurs posent massivement les mêmes
 *     questions (« combien ça coûte », « quels délais », « vos réalisations »).
 *     Une question déjà posée est resservie sans appeler le modèle : coût nul,
 *     réponse instantanée. C'est de loin l'économie la plus importante.
 *
 *  2. Un plafond de dépense. Au-delà, l'assistant ne s'arrête PAS : il
 *     retombe sur la recherche locale, qui est gratuite et illimitée. Le site
 *     continue donc de répondre en toutes circonstances — c'est ce qui rend
 *     le service « sans limite » du point de vue du visiteur, sans jamais
 *     laisser filer la facture.
 *
 * Limite assumée : les compteurs vivent en mémoire du processus. Sur Vercel,
 * chaque instance a les siens, donc le plafond réel est un ordre de grandeur,
 * pas une comptabilité exacte. Il sert de garde-fou contre l'emballement
 * (robot, pic de trafic), pas de facturation. Le vrai plafond dur se règle
 * dans la console Anthropic : Billing → Usage limits.
 */

/* ------------------------------------------------------------------ */
/*  Cache de réponses                                                  */
/* ------------------------------------------------------------------ */

export type CachedAnswer = {
  text: string;
  navigate: string | null;
  suggestions: string[];
};

type Entry = { value: CachedAnswer; expires: number };

const TTL_MS = 6 * 60 * 60 * 1000; // 6 h : assez pour absorber une journée de trafic
const MAX_ENTRIES = 500;

const answers = new Map<string, Entry>();

/** Clé de cache : la question normalisée + la page, sans historique. */
export function cacheKey(question: string, path: string | undefined): string {
  return `${path ?? "/"}::${question}`;
}

export function readCache(key: string): CachedAnswer | null {
  const hit = answers.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expires) {
    answers.delete(key);
    return null;
  }
  // Remise en tête : les questions populaires survivent à l'éviction.
  answers.delete(key);
  answers.set(key, hit);
  return hit.value;
}

export function writeCache(key: string, value: CachedAnswer): void {
  if (!value.text.trim()) return;
  if (answers.size >= MAX_ENTRIES) {
    // Map conserve l'ordre d'insertion : la première clé est la moins utilisée.
    const oldest = answers.keys().next().value;
    if (oldest !== undefined) answers.delete(oldest);
  }
  answers.set(key, { value, expires: Date.now() + TTL_MS });
}

/** Vide le cache — à appeler quand les tarifs changent. */
export function clearAnswerCache(): void {
  answers.clear();
}

/* ------------------------------------------------------------------ */
/*  Plafond de dépense                                                 */
/* ------------------------------------------------------------------ */

/**
 * Plafond mensuel en tokens de sortie (les plus chers).
 * 0 ou absent = pas de plafond applicatif.
 */
const MONTHLY_LIMIT = Number(process.env.ASSISTANT_MONTHLY_TOKEN_BUDGET ?? 0) || 0;

let spent = 0;
let periodEnd = nextMonth();

function nextMonth(): number {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
}

function roll(): void {
  if (Date.now() >= periodEnd) {
    spent = 0;
    periodEnd = nextMonth();
  }
}

/** Le modèle peut-il encore être appelé ce mois-ci ? */
export function withinBudget(): boolean {
  if (MONTHLY_LIMIT <= 0) return true;
  roll();
  return spent < MONTHLY_LIMIT;
}

/** À appeler après chaque réponse générée. */
export function recordSpend(outputTokens: number): void {
  if (MONTHLY_LIMIT <= 0) return;
  roll();
  spent += Math.max(0, outputTokens);
}

/** État courant, pour diagnostic. */
export function budgetState() {
  roll();
  return {
    limit: MONTHLY_LIMIT,
    spent,
    cachedAnswers: answers.size,
    resetsAt: new Date(periodEnd).toISOString(),
  };
}
