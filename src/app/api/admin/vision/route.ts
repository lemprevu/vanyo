import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getSiteSettingsFull } from "@/lib/settings-server";
import { resolveCatalog } from "@/lib/catalog";
import { buildVisionPrompt } from "@/lib/vision-prompt";
import type { Devis } from "@/lib/devis";

/**
 * Génération d'un aperçu visuel par IA pour une demande de devis.
 *
 * OUTIL INTERNE : l'image ne sert qu'à nous, pour visualiser ce que le client
 * décrit avant l'échange. Elle n'est jamais montrée sur le site public.
 *
 * Route réservée aux administrateurs connectés — la clé d'API ne quitte
 * jamais le serveur, et la génération est facturée par le fournisseur.
 */

export const maxDuration = 120; // la génération d'image dépasse le délai par défaut

type ImageResponse = { data?: { b64_json?: string; url?: string }[]; error?: { message?: string } };

export async function POST(request: Request) {
  // ── Authentification : administrateur connecté uniquement ─────────
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase n'est pas configuré : la génération d'image n'est pas disponible en mode démonstration." },
      { status: 503 }
    );
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  let body: { devisId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  if (!body.devisId) return NextResponse.json({ error: "Demande introuvable." }, { status: 400 });

  const settings = await getSiteSettingsFull();
  const apiKey = settings.ai_image_key?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Aucune clé d'API image n'est configurée. Ajoutez-la dans Paramètres → Intégrations pour activer la génération.",
      },
      { status: 400 }
    );
  }

  // ── La demande, lue côté serveur (on ne fait pas confiance au client) ──
  const service = createServiceClient() ?? supabase;
  const { data: row, error: readError } = await service
    .from("devis")
    .select("*")
    .eq("id", body.devisId)
    .maybeSingle();

  if (readError || !row) {
    return NextResponse.json({ error: "Demande introuvable." }, { status: 404 });
  }

  const devis = row as Devis;
  const prompt = buildVisionPrompt(devis, resolveCatalog(settings.catalog));

  // ── Appel au modèle d'image ───────────────────────────────────────
  let res: Response;
  try {
    res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: settings.ai_image_model?.trim() || "gpt-image-1",
        prompt,
        n: 1,
        size: "1536x1024", // format paysage, comme un écran
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "Le service de génération d'image est injoignable." },
      { status: 502 }
    );
  }

  const payload = (await res.json().catch(() => ({}))) as ImageResponse;

  if (!res.ok) {
    const message = payload.error?.message ?? "La génération a échoué.";
    console.error("[vision] Génération refusée:", message);
    return NextResponse.json({ error: message }, { status: res.status === 401 ? 400 : 502 });
  }

  const first = payload.data?.[0];
  let dataUrl: string | null = null;

  if (first?.b64_json) {
    dataUrl = `data:image/png;base64,${first.b64_json}`;
  } else if (first?.url) {
    // Certains modèles renvoient une URL temporaire : on la rapatrie tout de
    // suite, sinon le lien expire et l'aperçu disparaît du panel.
    try {
      const img = await fetch(first.url);
      const buf = Buffer.from(await img.arrayBuffer());
      dataUrl = `data:image/png;base64,${buf.toString("base64")}`;
    } catch {
      dataUrl = null;
    }
  }

  if (!dataUrl) {
    return NextResponse.json({ error: "Aucune image n'a été renvoyée." }, { status: 502 });
  }

  // ── Mémorisation pour ne pas régénérer (et repayer) à chaque ouverture ──
  const { error: saveError } = await service
    .from("devis")
    .update({ vision_image: dataUrl, vision_prompt: prompt })
    .eq("id", devis.id);

  if (saveError) {
    // L'image est valable même si l'enregistrement échoue : on la renvoie
    // quand même, en signalant qu'elle ne sera pas conservée.
    console.error("[vision] Enregistrement impossible:", saveError.message);
    return NextResponse.json({ ok: true, image: dataUrl, prompt, persisted: false });
  }

  return NextResponse.json({ ok: true, image: dataUrl, prompt, persisted: true });
}
