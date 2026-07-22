import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { str } from "@/lib/validate";

/** Ramène un referrer complet à son domaine simplifié, ou "direct" s'il n'y en a pas. */
function simplifySource(referrer: string | null): string {
  if (!referrer) return "direct";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    return host || "direct";
  } catch {
    return "direct";
  }
}

/**
 * Enregistrement anonyme d'une vue de page (analyse de trafic maison).
 * Aucune donnée personnelle : ni IP stockée, ni identifiant visiteur.
 * Rate-limité par IP pour éviter qu'un script ne pollue les statistiques.
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  const { ok } = rateLimit(`track:${ip}`, 60, 60_000);
  if (!ok) return NextResponse.json({ ok: false }, { status: 429 });

  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ ok: true }); // démo locale sans Supabase : no-op silencieux

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const path = str(body.path, 300);
  if (!path || !path.startsWith("/")) {
    return NextResponse.json({ error: "Chemin invalide." }, { status: 400 });
  }
  const referrer = str(body.referrer, 500);
  const device = body.device === "mobile" ? "mobile" : "desktop";

  await supabase.from("page_views").insert({
    path,
    referrer,
    source: simplifySource(referrer),
    device,
  });

  return NextResponse.json({ ok: true });
}
