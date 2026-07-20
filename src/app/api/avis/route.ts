import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { req, str, clean } from "@/lib/validate";
import { verifyTurnstile } from "@/lib/turnstile";

/**
 * Réception d'un avis client public.
 * Enregistré non publié (`featured: false`) : un administrateur doit
 * l'approuver depuis /admin/avis avant qu'il apparaisse sur le site.
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  const { ok } = rateLimit(`avis:${ip}`, 3, 60_000);
  if (!ok) {
    return NextResponse.json(
      { error: "Trop de demandes. Réessayez dans une minute." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const name = req(body.name, 120);
  const quote = req(body.quote, 1000);
  const ratingNum = Number(body.rating);

  if (!name || !quote) {
    return NextResponse.json({ error: "Nom et avis requis." }, { status: 400 });
  }
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return NextResponse.json({ error: "Note invalide." }, { status: 400 });
  }
  if (!(await verifyTurnstile(body.turnstileToken))) {
    return NextResponse.json({ error: "Vérification anti-spam échouée. Réessayez." }, { status: 400 });
  }

  const record = {
    name: clean(name),
    company: str(body.company, 160),
    rating: ratingNum,
    quote: clean(quote),
    initials: name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase(),
    featured: false,
    position: 999,
  };

  const supabase = createServiceClient();
  if (!supabase) {
    console.warn("[avis] Supabase non configuré — avis reçu mais non persisté:", record.name);
    return NextResponse.json({ ok: true, persisted: false });
  }

  const { error } = await supabase.from("avis").insert(record);
  if (error) {
    console.error("[avis] Erreur Supabase:", error.message);
    return NextResponse.json({ error: "Impossible d'enregistrer votre avis pour le moment." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, persisted: true });
}
