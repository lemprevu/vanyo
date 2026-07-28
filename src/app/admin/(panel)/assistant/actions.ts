"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { invalidateLessons } from "@/lib/ai/learning";
import { normalize } from "@/lib/ai/retrieval";

/**
 * Actions du panel « Assistant IA ».
 *
 * Une correction enregistrée ici prend effet en moins d'une minute côté
 * visiteur : le moteur relit la table à intervalle court, et le cache est
 * vidé immédiatement après chaque écriture.
 */

/** Ajoute — ou remplace — une correction. */
export async function saveLesson(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return;

  const phraseBrute = String(formData.get("phrase") ?? "").trim();
  const intent = String(formData.get("intent") ?? "").trim();
  if (!phraseBrute || !intent) return;

  // On stocke la forme normalisée : c'est celle que le moteur compare.
  // Sans ça, « Combien ça coûte ? » et « combien ca coute » seraient deux
  // corrections distinctes, dont une seule fonctionnerait.
  const phrase = normalize(phraseBrute);
  if (phrase.length < 3) return;

  await supabase
    .from("assistant_lessons")
    .upsert({ phrase, intent, active: true }, { onConflict: "phrase" });

  invalidateLessons();
  revalidatePath("/admin/assistant");
}

/** Active ou désactive une correction, sans la perdre. */
export async function toggleLesson(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return;

  const id = String(formData.get("id") ?? "");
  const active = String(formData.get("active") ?? "") === "true";
  if (!id) return;

  await supabase.from("assistant_lessons").update({ active: !active }).eq("id", id);

  invalidateLessons();
  revalidatePath("/admin/assistant");
}

/** Supprime définitivement une correction. */
export async function deleteLesson(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await supabase.from("assistant_lessons").delete().eq("id", id);

  invalidateLessons();
  revalidatePath("/admin/assistant");
}
