import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import type { PromoCode } from "@/lib/types";

/**
 * Valide un code promo saisi par un visiteur (page Tarifs).
 * Passe par le serveur (clé service) pour que les codes ne soient
 * pas énumérables publiquement.
 */
export async function POST(request: Request) {
  const { ok } = rateLimit(`promo:${clientIp(request)}`, 10, 60_000);
  if (!ok) return NextResponse.json({ error: "Trop d'essais. Patientez une minute." }, { status: 429 });

  let body: { code?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  if (!code) return NextResponse.json({ valid: false, error: "Code manquant." }, { status: 400 });

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json({ valid: false, error: "Codes promo indisponibles." }, { status: 503 });
  }

  const { data } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("code", code)
    .eq("active", true)
    .maybeSingle();

  const promo = data as PromoCode | null;

  if (!promo) {
    return NextResponse.json({ valid: false, error: "Code invalide ou expiré." });
  }
  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, error: "Ce code a expiré." });
  }

  return NextResponse.json({
    valid: true,
    code: promo.code,
    description: promo.description,
    discount_type: promo.discount_type,
    discount_value: promo.discount_value,
  });
}
