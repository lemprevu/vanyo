import { createServiceClient } from "@/lib/supabase/server";
import type { Intent } from "./nlu";

/**
 * Boucle d'apprentissage de l'assistant.
 *
 * Le principe : personne ne peut surveiller à la main ce qu'un assistant
 * comprend de travers. Il doit donc le noter lui-même.
 *
 * 1. Chaque question est journalisée avec ce que le moteur en a compris et
 *    la manière dont il a répondu. Les échecs remontent d'eux-mêmes.
 * 2. Une correction saisie dans le panel devient une « leçon » : une
 *    formulation rattachée à une intention. Elle prend effet à la question
 *    suivante, sans redéploiement.
 *
 * Rien de tout cela ne doit jamais faire échouer une réponse : l'écriture est
 * en arrière-plan et toutes les erreurs sont avalées. Un assistant qui plante
 * parce que sa base de journalisation est indisponible serait absurde.
 */

/** Comment la réponse a été trouvée. */
export type Source = "intention" | "entretien" | "recherche" | "echec";

export type Lesson = { phrase: string; intent: Intent };

/* ------------------------------------------------------------------ */
/*  Lecture des corrections                                            */
/* ------------------------------------------------------------------ */

const DUREE_CACHE_MS = 60_000;

let cache: { lessons: Lesson[]; expire: number } | null = null;

/**
 * Les corrections actives, mises en cache une minute.
 *
 * Sans ce cache, chaque message déclencherait une requête : le moteur répond
 * en une milliseconde, il serait dommage d'attendre la base à chaque fois.
 * Une minute suffit pour qu'une correction saisie dans le panel se voie tout
 * de suite à l'échelle humaine.
 */
export async function getLessons(): Promise<Lesson[]> {
  if (cache && Date.now() < cache.expire) return cache.lessons;

  try {
    const supabase = createServiceClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("assistant_lessons")
      .select("phrase, intent")
      .eq("active", true)
      .limit(500);

    if (error || !data) return cache?.lessons ?? [];

    const lessons = data
      .filter((l): l is { phrase: string; intent: string } => typeof l.phrase === "string" && typeof l.intent === "string")
      .map((l) => ({ phrase: l.phrase, intent: l.intent as Intent }));

    cache = { lessons, expire: Date.now() + DUREE_CACHE_MS };
    return lessons;
  } catch {
    // Base indisponible : on continue avec ce qu'on avait, ou sans rien.
    return cache?.lessons ?? [];
  }
}

/** Force la relecture — appelée après une modification dans le panel. */
export function invalidateLessons(): void {
  cache = null;
}

/* ------------------------------------------------------------------ */
/*  Journalisation                                                     */
/* ------------------------------------------------------------------ */

export type LogEntry = {
  question: string;
  normalized: string;
  intent: Intent;
  confidence: number;
  source: Source;
  page?: string;
};

/**
 * Enregistre une question. Volontairement sans `await` du côté appelant :
 * la réponse au visiteur ne doit pas attendre l'écriture.
 */
export async function logQuestion(entry: LogEntry): Promise<void> {
  try {
    const supabase = createServiceClient();
    if (!supabase) return;

    await supabase.from("assistant_questions").insert({
      question: entry.question.slice(0, 500),
      normalized: entry.normalized.slice(0, 500),
      intent: entry.intent,
      confidence: Number.isFinite(entry.confidence) ? entry.confidence : 0,
      source: entry.source,
      page: entry.page?.slice(0, 120) ?? null,
    });
  } catch {
    // Journaliser est un confort, pas une obligation.
  }
}

/** Incrémente le compteur d'usage d'une correction qui vient de servir. */
export async function markLessonUsed(phrase: string): Promise<void> {
  try {
    const supabase = createServiceClient();
    if (!supabase) return;
    await supabase.rpc("increment_lesson_hit", { p_phrase: phrase });
  } catch {
    // La fonction peut ne pas exister : le compteur n'est qu'indicatif.
  }
}
