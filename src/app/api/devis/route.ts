import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { isEmail, req, str, clean, strArray } from "@/lib/validate";
import { sendNotification, emailTemplate } from "@/lib/mailer";
import { verifyTurnstile } from "@/lib/turnstile";

/**
 * Réception d'une demande de devis publique.
 * - rate limiting par IP
 * - validation + assainissement
 * - persistance dans Supabase (table `devis`) si configuré
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  const { ok } = rateLimit(`devis:${ip}`, 5, 60_000);
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

  const nom = req(body.nom, 120);
  const prenom = req(body.prenom, 120);
  const email = body.email;

  if (!nom || !prenom) {
    return NextResponse.json({ error: "Nom et prénom requis." }, { status: 400 });
  }
  if (!isEmail(email)) {
    return NextResponse.json({ error: "Email invalide." }, { status: 400 });
  }
  if (body.rgpd !== true) {
    return NextResponse.json({ error: "Consentement RGPD requis." }, { status: 400 });
  }
  if (!(await verifyTurnstile(body.turnstileToken))) {
    return NextResponse.json({ error: "Vérification anti-spam échouée. Réessayez." }, { status: 400 });
  }

  const record = {
    status: "Nouveau",
    nom: clean(nom),
    prenom: clean(prenom),
    entreprise: str(body.entreprise, 160),
    email: (email as string).toLowerCase(),
    telephone: str(body.telephone, 40),
    adresse: str(body.adresse, 200),
    ville: str(body.ville, 120),
    code_postal: str(body.code_postal, 20),
    pays: str(body.pays, 80),
    type_site: str(body.type_site, 80),
    nombre_pages: str(body.nombre_pages, 60),
    site_existant: str(body.site_existant, 40),
    lien_actuel: str(body.lien_actuel, 300),
    nom_domaine: str(body.nom_domaine, 80),
    hebergement: str(body.hebergement, 80),
    logo: str(body.logo, 40),
    charte_graphique: str(body.charte_graphique, 40),
    fonctionnalites: strArray(body.fonctionnalites),
    budget: str(body.budget, 40),
    // Style & contenu
    objectif: str(body.objectif, 80),
    style_visuel: str(body.style_visuel, 80),
    ambiance: str(body.ambiance, 300),
    couleurs_souhaitees: str(body.couleurs_souhaitees, 300),
    inspirations: str(body.inspirations, 1000),
    concurrents: str(body.concurrents, 1000),
    public_cible: str(body.public_cible, 300),
    contenu_type: str(body.contenu_type, 80),
    langues: str(body.langues, 120),
    a_des_photos: str(body.a_des_photos, 60),
    // Options payantes
    options: strArray(body.options),
    pages_supplementaires: Number.isFinite(Number(body.pages_supplementaires))
      ? Math.max(0, Math.min(200, Math.floor(Number(body.pages_supplementaires))))
      : 0,
    date_souhaitee: str(body.date_souhaitee, 40) || null,
    description: body.description ? clean(str(body.description, 5000)!) : null,
    rgpd: true,
    ip,
  };

  const supabase = createServiceClient();

  // Si Supabase n'est pas encore configuré : on accepte quand même la demande
  // (le site reste fonctionnel en démo) mais on le signale dans les logs.
  if (!supabase) {
    console.warn("[devis] Supabase non configuré — demande reçue mais non persistée:", record.email);
    return NextResponse.json({ ok: true, persisted: false });
  }

  const { error } = await supabase.from("devis").insert(record);
  if (error) {
    console.error("[devis] Erreur Supabase:", error.message);
    return NextResponse.json(
      { error: "Impossible d'enregistrer la demande pour le moment." },
      { status: 500 }
    );
  }

  // Notification email (silencieuse si SMTP non configuré).
  await sendNotification(
    `Nouvelle demande de devis — ${record.prenom} ${record.nom}`,
    emailTemplate(
      "Nouvelle demande de devis",
      [
        ["Nom", `${record.prenom} ${record.nom}`],
        ["Entreprise", record.entreprise ?? ""],
        ["Email", record.email],
        ["Téléphone", record.telephone ?? ""],
        ["Type de site", record.type_site ?? ""],
        ["Objectif", record.objectif ?? ""],
        ["Budget", record.budget ?? ""],
        ["Style visuel", record.style_visuel ?? ""],
        ["Couleurs", record.couleurs_souhaitees ?? ""],
        ["Fonctionnalités", (record.fonctionnalites ?? []).join(", ")],
        ["Options", [...(record.options ?? []), record.pages_supplementaires ? `${record.pages_supplementaires} page(s) sup.` : ""].filter(Boolean).join(", ")],
      ],
      record.description ?? ""
    ),
    { eventType: "devis" }
  );

  return NextResponse.json({ ok: true, persisted: true });
}
