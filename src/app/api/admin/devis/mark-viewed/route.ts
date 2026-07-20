import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Marque une ou plusieurs demandes de devis comme consultées.
 * Appelée avec `keepalive: true` côté client pour survivre à un
 * rafraîchissement de page déclenché juste après le clic (sinon le
 * navigateur annule la requête avant qu'elle n'ait pu aboutir, et la
 * notification réapparaît au chargement suivant).
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ ok: true, persisted: false });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  let body: { ids?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const ids = Array.isArray(body.ids) ? body.ids.filter((id) => typeof id === "string") : [];
  if (ids.length === 0) return NextResponse.json({ error: "Aucun identifiant fourni." }, { status: 400 });

  const { error } = await supabase.from("devis").update({ viewed: true }).in("id", ids);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
