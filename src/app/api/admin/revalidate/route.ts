import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Force la régénération immédiate des pages publiques après une
 * modification dans l'admin (couleur, contenu, tarifs, SEO…),
 * pour que les changements soient visibles sans attendre le cache.
 */
export async function POST() {
  const supabase = await createClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  // Revalide tout le site public (le layout porte la couleur/le SEO).
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
