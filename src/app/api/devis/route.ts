import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { isEmail, req, str, clean, strArray } from "@/lib/validate";
import { sendNotification, emailTemplate } from "@/lib/mailer";
import { verifyTurnstile } from "@/lib/turnstile";
import { PACK_UNDECIDED, resolveCatalog } from "@/lib/catalog";
import { estimate } from "@/lib/quote";
import { getSiteSettings, activeDiscount } from "@/lib/data";
import { SITE_TYPES, OBJECTIFS } from "@/lib/devis";

/**
 * Réception d'une demande de devis publique.
 * - rate limiting par IP
 * - validation + assainissement
 * - les clés de configuration (formule, modules, maintenance…) sont vérifiées
 *   contre le catalogue : rien d'inventé côté client n'entre en base
 * - l'estimation est recalculée côté serveur, jamais reprise du navigateur
 * - persistance dans Supabase (table `devis`) si configuré
 */

/** Ne garde que les clés réellement présentes dans un dictionnaire du catalogue. */
function pickKeys(value: unknown, dict: Record<string, unknown>, max = 40): string[] {
  return strArray(value).filter((k) => k in dict).slice(0, max);
}

function pickKey(value: unknown, dict: Record<string, unknown>): string | null {
  const k = str(value, 40);
  return k && k in dict ? k : null;
}

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

  // ── Catalogue effectif (vos tarifs personnalisés) + remise en cours ──
  const settings = await getSiteSettings();
  const catalog = resolveCatalog(settings.catalog);
  const discount = activeDiscount(settings);

  // ── Configuration chiffrée, filtrée sur le catalogue ──────────────
  const formuleRaw = str(body.formule, 40);
  const formule =
    formuleRaw === PACK_UNDECIDED || (formuleRaw && formuleRaw in catalog.packsByKey) ? formuleRaw : null;

  const modules = pickKeys(body.modules, catalog.modulesByKey);
  const deploiement = pickKey(body.deploiement, catalog.deploiementsByKey);
  const maintenance = pickKey(body.maintenance, catalog.maintenancePlansByKey);
  const maintenanceOptions =
    maintenance && maintenance !== "aucune" ? pickKeys(body.maintenance_options, catalog.maintenanceOptionsByKey) : [];
  const delai = pickKey(body.delai, catalog.delaisByKey) ?? "standard";

  const pagesTotal = Number.isFinite(Number(body.pages_total))
    ? Math.max(1, Math.min(200, Math.floor(Number(body.pages_total))))
    : null;

  const budget = str(body.budget, 40);

  // Multi-sélection : on ne garde que des valeurs connues du catalogue.
  const allowed = <T extends readonly string[]>(value: unknown, list: T) =>
    strArray(value).filter((s) => (list as readonly string[]).includes(s)).slice(0, 12);
  const typesSite = allowed(body.types_site, SITE_TYPES);
  const objectifs = allowed(body.objectifs, OBJECTIFS);

  // Recalcul serveur : l'estimation stockée ne dépend pas du navigateur,
  // remise du moment comprise.
  const quote = estimate(
    {
      pack: formule,
      typesSite,
      pages: pagesTotal,
      modules,
      deploiement,
      maintenance,
      maintenanceOptions,
      delai,
      budget,
      discountPercent: discount?.percent ?? 0,
      discountLabel: discount?.label ?? null,
    },
    catalog
  );

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

    // Projet (multi-sélection ; les colonnes mono-valeur restent renseignées
    // avec le premier choix pour que les anciens écrans continuent d'afficher
    // quelque chose de sensé).
    types_site: typesSite,
    objectifs,
    type_site: typesSite[0] ?? null,
    objectif: objectifs[0] ?? null,
    site_existant: str(body.site_existant, 40),
    lien_actuel: str(body.lien_actuel, 300),
    budget,

    // Configuration
    formule,
    pages_total: pagesTotal,
    modules,
    deploiement,
    maintenance,
    maintenance_options: maintenanceOptions,
    delai,
    // On enregistre toujours le montant, y compris pour un projet sur mesure :
    // le client a vu « Sur devis », mais le panel a besoin d'un chiffre.
    estimation: quote.total,
    estimation_mensuelle: quote.monthly,
    remise_percent: quote.discountPercent,
    remise_label: quote.discountLabel,

    // Contenu
    contenu_type: str(body.contenu_type, 80),
    a_des_photos: str(body.a_des_photos, 60),
    langues: str(body.langues, 120),
    logo: str(body.logo, 40),
    charte_graphique: str(body.charte_graphique, 40),

    // Style
    style_visuel: str(body.style_visuel, 80),
    couleurs_souhaitees: str(body.couleurs_souhaitees, 300),
    ambiance: str(body.ambiance, 300),
    inspirations: str(body.inspirations, 1000),
    concurrents: str(body.concurrents, 1000),
    public_cible: str(body.public_cible, 300),

    // Finalisation
    date_souhaitee: str(body.date_souhaitee, 40) || null,
    description: body.description ? clean(str(body.description, 5000)!) : null,
    promo: str(body.promo, 40),
    rgpd: true,
    ip,
  };

  const supabase = createServiceClient();

  // Si Supabase n'est pas encore configuré : on accepte quand même la demande
  // (le site reste fonctionnel en démo) mais on le signale dans les logs.
  if (!supabase) {
    console.warn("[devis] Supabase non configuré — demande reçue mais non persistée:", record.email);
    return NextResponse.json({ ok: true, persisted: false, estimation: record.estimation });
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
  const moduleLabels = modules.map((k) => catalog.modulesByKey[k]?.label).filter(Boolean).join(", ");
  const maintenanceLabel = maintenance ? catalog.maintenancePlansByKey[maintenance]?.label : "";
  const maintenanceExtras = maintenanceOptions
    .map((k) => catalog.maintenanceOptionsByKey[k]?.label)
    .filter(Boolean)
    .join(", ");

  await sendNotification(
    `Nouvelle demande de devis — ${record.prenom} ${record.nom}`,
    emailTemplate(
      "Nouvelle demande de devis",
      [
        ["Nom", `${record.prenom} ${record.nom}`],
        ["Entreprise", record.entreprise ?? ""],
        ["Email", record.email],
        ["Téléphone", record.telephone ?? ""],
        ["Type de site", typesSite.join(", ")],
        ["Objectif", objectifs.join(", ")],
        ["Formule", formule ? (catalog.packsByKey[formule]?.name ?? "À conseiller") : ""],
        ["Pages", pagesTotal ? String(pagesTotal) : ""],
        ["Modules", moduleLabels],
        ["Mise en ligne", deploiement ? (catalog.deploiementsByKey[deploiement]?.label ?? "") : ""],
        ["Délai", catalog.delaisByKey[delai]?.label ?? ""],
        ["Maintenance", [maintenanceLabel, maintenanceExtras].filter(Boolean).join(" + ")],
        ["Budget annoncé", record.budget ?? ""],
        [
          "Estimation automatique",
          quote.surDevis
            ? "Sur devis"
            : `${quote.total.toLocaleString("fr-FR")} €${quote.monthly ? ` + ${quote.monthly} €/mois` : ""}` +
              (quote.discountPercent ? ` (après −${quote.discountPercent} % « ${quote.discountLabel} »)` : ""),
        ],
        ["Style visuel", record.style_visuel ?? ""],
        ["Couleurs", record.couleurs_souhaitees ?? ""],
        ["Code promo", record.promo ?? ""],
      ],
      record.description ?? ""
    ),
    { eventType: "devis" }
  );

  return NextResponse.json({ ok: true, persisted: true, estimation: record.estimation });
}
