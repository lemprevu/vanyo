/**
 * VANYO — Catalogue commercial (source unique de vérité).
 *
 * Tout ce qui est chiffré sur le site vient d'ici : les formules affichées sur
 * /tarifs, le tableau comparatif, les modules proposés dans le formulaire de
 * devis, les options de mise en ligne, la maintenance mensuelle et l'estimation
 * automatique du panel admin.
 *
 * Conséquence voulue : il est impossible que le comparatif et le formulaire de
 * devis se contredisent, puisqu'ils lisent les mêmes objets.
 *
 * Les prix sont en euros, hors taxes, et s'entendent « à partir de ».
 */

/* ------------------------------------------------------------------ */
/*  Modules — ce qu'on peut mettre dans un site                        */
/* ------------------------------------------------------------------ */

export type ModuleGroup = "Contenu" | "Conversion" | "Vente" | "Gestion" | "Visibilité";

export type SiteModule = {
  key: string;
  label: string;
  description: string;
  /** Prix ponctuel si le module n'est pas déjà compris dans la formule. */
  price: number;
  group: ModuleGroup;
  /** Nom d'icône lucide (voir components/ui/Icon.tsx et le formulaire). */
  icon: string;
};

export const MODULES: SiteModule[] = [
  // ── Contenu ──────────────────────────────────────────────────────
  { key: "galerie", label: "Galerie photos", description: "Vos visuels mis en valeur, avec vue plein écran.", price: 120, group: "Contenu", icon: "Image" },
  { key: "blog", label: "Blog / actualités", description: "Publiez articles et actualités depuis votre panel.", price: 250, group: "Contenu", icon: "Newspaper" },
  { key: "multilingue", label: "Site multilingue", description: "Une seconde langue complète, avec bascule automatique.", price: 350, group: "Contenu", icon: "Languages" },
  { key: "redaction", label: "Rédaction des textes", description: "On écrit le contenu de vos pages (jusqu'à 5 pages).", price: 290, group: "Contenu", icon: "PenTool" },
  { key: "logo", label: "Création de logo", description: "3 pistes créatives, fichiers vectoriels livrés.", price: 250, group: "Contenu", icon: "Sparkles" },
  { key: "charte", label: "Charte graphique complète", description: "Couleurs, typographies, déclinaisons et guide d'usage.", price: 450, group: "Contenu", icon: "Palette" },

  // ── Conversion ───────────────────────────────────────────────────
  { key: "contact", label: "Formulaire de contact", description: "Réception directe par e-mail, protégé anti-spam.", price: 0, group: "Conversion", icon: "Mail" },
  { key: "formulaire_avance", label: "Formulaire avancé multi-étapes", description: "Parcours guidé, champs conditionnels, pièces jointes.", price: 180, group: "Conversion", icon: "ClipboardList" },
  { key: "rdv", label: "Prise de rendez-vous en ligne", description: "Vos créneaux disponibles, réservables 24 h/24.", price: 350, group: "Conversion", icon: "CalendarCheck" },
  { key: "reservation", label: "Réservation (couverts, créneaux…)", description: "Gestion des disponibilités et confirmations automatiques.", price: 390, group: "Conversion", icon: "CalendarClock" },
  { key: "newsletter", label: "Inscription newsletter", description: "Collecte des e-mails et export de votre liste.", price: 150, group: "Conversion", icon: "Send" },
  { key: "chat", label: "Chat en direct", description: "Discutez avec vos visiteurs depuis votre téléphone.", price: 150, group: "Conversion", icon: "MessageCircle" },
  { key: "avis", label: "Avis clients", description: "Collecte, modération et affichage de vos avis.", price: 180, group: "Conversion", icon: "Star" },

  // ── Vente ────────────────────────────────────────────────────────
  { key: "paiement", label: "Paiement en ligne", description: "Encaissement sécurisé par carte (Stripe).", price: 400, group: "Vente", icon: "CreditCard" },
  { key: "boutique", label: "Boutique e-commerce", description: "Catalogue, panier, commandes et stocks.", price: 800, group: "Vente", icon: "ShoppingCart" },
  { key: "espace_client", label: "Espace client / connexion", description: "Comptes sécurisés et contenu réservé à vos clients.", price: 450, group: "Vente", icon: "LogIn" },
  { key: "devis_ligne", label: "Demande de devis en ligne", description: "Un formulaire de devis détaillé, comme celui-ci.", price: 200, group: "Vente", icon: "FileText" },

  // ── Gestion ──────────────────────────────────────────────────────
  { key: "admin", label: "Panel administrateur", description: "Modifiez vos textes, photos et contenus vous-même.", price: 400, group: "Gestion", icon: "LayoutDashboard" },
  { key: "dashboard", label: "Tableau de bord & statistiques", description: "Vos chiffres clés en un coup d'œil.", price: 350, group: "Gestion", icon: "BarChart3" },
  { key: "planning", label: "Planning / agenda", description: "Vue calendrier de vos rendez-vous et réservations.", price: 300, group: "Gestion", icon: "CalendarDays" },
  { key: "utilisateurs", label: "Comptes & rôles", description: "Plusieurs accès, avec des permissions par personne.", price: 250, group: "Gestion", icon: "Users" },
  { key: "journal", label: "Journal d'activité", description: "L'historique de toutes les actions faites sur le site.", price: 150, group: "Gestion", icon: "ScrollText" },

  // ── Visibilité ───────────────────────────────────────────────────
  { key: "seo_base", label: "SEO de base", description: "Structure, balises, sitemap et vitesse optimisés.", price: 0, group: "Visibilité", icon: "Search" },
  { key: "seo_avance", label: "SEO avancé", description: "Audit, mots-clés, données structurées et contenu optimisé.", price: 300, group: "Visibilité", icon: "TrendingUp" },
  { key: "seo_local", label: "Référencement local", description: "Fiche Google Business et pages par zone d'intervention.", price: 190, group: "Visibilité", icon: "MapPin" },
  { key: "analytics", label: "Analytics & Search Console", description: "Mesure du trafic et suivi de votre référencement.", price: 90, group: "Visibilité", icon: "Gauge" },
  { key: "animations", label: "Animations avancées", description: "Transitions et effets soignés, sans nuire à la vitesse.", price: 250, group: "Visibilité", icon: "Zap" },
  { key: "perf", label: "Optimisation performances poussée", description: "Objectif 95+ sur Lighthouse, images et code au régime.", price: 200, group: "Visibilité", icon: "Rocket" },
];

export const MODULES_BY_KEY: Record<string, SiteModule> = Object.fromEntries(
  MODULES.map((m) => [m.key, m])
);

export const MODULE_GROUPS: ModuleGroup[] = ["Contenu", "Conversion", "Vente", "Gestion", "Visibilité"];

/** Prix d'une page au-delà de ce que la formule comprend. */
export const EXTRA_PAGE_PRICE = 90;

/* ------------------------------------------------------------------ */
/*  Formules                                                           */
/* ------------------------------------------------------------------ */

/** Valeur de `pagesIncluded` signifiant « autant de pages que nécessaire ». */
export const PAGES_UNLIMITED = 999;

export type Pack = {
  key: string;
  name: string;
  tagline: string;
  /** Prix de base, ou null pour « Sur devis ». */
  base: number | null;
  /** Prix conseillé barré, pour afficher la remise. */
  originalPrice?: number;
  pagesIncluded: number;
  /** Libellé affiché pour le nombre de pages (comparatif). */
  pagesLabel: string;
  highlight?: boolean;
  /** Modules compris sans supplément. */
  includes: string[];
  support: string;
  delai: string;
  /** Maintenance offerte les premiers mois, en nombre de mois. */
  maintenanceOfferte: number;
};

const STARTER_MODULES = ["contact", "seo_base", "galerie"];
const BUSINESS_MODULES = [
  ...STARTER_MODULES,
  "blog", "admin", "avis", "seo_avance", "analytics", "animations", "newsletter",
];
const PREMIUM_MODULES = [
  ...BUSINESS_MODULES,
  "espace_client", "dashboard", "planning", "utilisateurs", "journal",
  "formulaire_avance", "rdv", "seo_local", "perf",
];

export const PACKS: Pack[] = [
  {
    key: "starter",
    name: "Starter",
    tagline: "Idéal pour lancer une présence en ligne soignée.",
    base: 500,
    originalPrice: 720,
    pagesIncluded: 3,
    pagesLabel: "1 à 3",
    includes: STARTER_MODULES,
    support: "30 jours",
    delai: "5 à 8 jours",
    maintenanceOfferte: 0,
  },
  {
    key: "business",
    name: "Business",
    tagline: "Le choix des entreprises qui veulent convertir.",
    base: 1200,
    originalPrice: 1750,
    pagesIncluded: 8,
    pagesLabel: "jusqu'à 8",
    highlight: true,
    includes: BUSINESS_MODULES,
    support: "3 mois",
    delai: "10 à 15 jours",
    maintenanceOfferte: 1,
  },
  {
    key: "premium",
    name: "Premium",
    tagline: "Pour un projet ambitieux et évolutif.",
    base: 2500,
    originalPrice: 3600,
    pagesIncluded: PAGES_UNLIMITED,
    pagesLabel: "Illimité",
    includes: PREMIUM_MODULES,
    support: "12 mois",
    delai: "3 à 5 semaines",
    maintenanceOfferte: 3,
  },
  {
    key: "surmesure",
    name: "Sur Mesure",
    tagline: "Application web, plateforme ou besoin spécifique.",
    base: null,
    pagesIncluded: PAGES_UNLIMITED,
    pagesLabel: "Illimité",
    includes: [...PREMIUM_MODULES, "boutique", "paiement", "multilingue", "devis_ligne"],
    support: "Dédié",
    delai: "Sur mesure",
    maintenanceOfferte: 3,
  },
];

export const PACKS_BY_KEY: Record<string, Pack> = Object.fromEntries(PACKS.map((p) => [p.key, p]));

/** Choix « je ne sais pas encore » proposé dans le formulaire. */
export const PACK_UNDECIDED = "conseillez_moi";

export function packIncludes(packKey: string | null | undefined, moduleKey: string): boolean {
  const pack = packKey ? PACKS_BY_KEY[packKey] : undefined;
  return !!pack && pack.includes.includes(moduleKey);
}

/* ------------------------------------------------------------------ */
/*  Mise en ligne (déploiement / installation)                         */
/* ------------------------------------------------------------------ */

export type DeploymentOption = {
  key: string;
  label: string;
  description: string;
  price: number;
  /** Détail affiché en liste dans le formulaire et sur /tarifs. */
  includes: string[];
};

export const DEPLOIEMENTS: DeploymentOption[] = [
  {
    key: "aucun",
    label: "Je m'en occupe moi-même",
    description: "On vous livre le site et sa documentation, vous gérez la mise en ligne.",
    price: 0,
    includes: ["Code source et fichiers livrés", "Documentation de déploiement"],
  },
  {
    key: "installation",
    label: "Installation & mise en ligne",
    description: "On déploie le site sur un hébergement performant, prêt à l'emploi. Sans nom de domaine.",
    price: 149,
    includes: [
      "Déploiement sur hébergement rapide",
      "Certificat HTTPS / SSL configuré",
      "Sauvegarde initiale",
      "Mise en service et vérifications",
    ],
  },
  {
    key: "installation_domaine",
    label: "Installation + nom de domaine",
    description: "Tout ce qui précède, plus la réservation et la configuration complète de votre nom de domaine.",
    price: 249,
    includes: [
      "Tout de « Installation & mise en ligne »",
      "Réservation du nom de domaine (.fr ou .com)",
      "Configuration DNS complète",
      "1ʳᵉ année de nom de domaine incluse",
    ],
  },
  {
    key: "installation_domaine_emails",
    label: "Installation + domaine + e-mails pro",
    description: "La formule complète : votre site en ligne, votre domaine et vos adresses e-mail professionnelles.",
    price: 349,
    includes: [
      "Tout de « Installation + nom de domaine »",
      "3 adresses @votredomaine créées",
      "Configuration sur vos téléphones et ordinateurs",
      "Signature e-mail professionnelle offerte",
    ],
  },
];

export const DEPLOIEMENTS_BY_KEY: Record<string, DeploymentOption> = Object.fromEntries(
  DEPLOIEMENTS.map((d) => [d.key, d])
);

/* ------------------------------------------------------------------ */
/*  Maintenance mensuelle                                              */
/* ------------------------------------------------------------------ */

export type MaintenancePlan = {
  key: string;
  label: string;
  description: string;
  /** Prix mensuel en euros. */
  price: number;
  features: string[];
  recommended?: boolean;
};

export const MAINTENANCE_PLANS: MaintenancePlan[] = [
  {
    key: "aucune",
    label: "Aucune",
    description: "Votre site vous appartient, vous n'êtes engagé à rien.",
    price: 0,
    features: ["Aucun abonnement", "Interventions ponctuelles facturées à l'heure"],
  },
  {
    key: "essentiel",
    label: "Essentiel",
    description: "Le socle : votre site reste en ligne, à jour et sécurisé.",
    price: 19,
    features: [
      "Hébergement et nom de domaine maintenus",
      "Certificat HTTPS renouvelé automatiquement",
      "Sauvegardes hebdomadaires",
      "Mises à jour de sécurité",
      "Surveillance de disponibilité 24 h/24",
    ],
  },
  {
    key: "confort",
    label: "Confort",
    description: "Le plus choisi : on s'occupe aussi de faire vivre votre site.",
    price: 39,
    recommended: true,
    features: [
      "Tout l'Essentiel",
      "1 h de modifications par mois (textes, photos)",
      "Rapport mensuel de fréquentation",
      "Support prioritaire sous 48 h ouvrées",
      "Restauration en cas de problème",
    ],
  },
  {
    key: "serenite",
    label: "Sérénité",
    description: "Vous ne touchez à rien : on pilote le site et sa visibilité.",
    price: 79,
    features: [
      "Tout le Confort",
      "3 h de modifications par mois",
      "Suivi de positionnement Google",
      "Optimisation continue des performances",
      "Support sous 24 h ouvrées",
    ],
  },
];

export const MAINTENANCE_PLANS_BY_KEY: Record<string, MaintenancePlan> = Object.fromEntries(
  MAINTENANCE_PLANS.map((p) => [p.key, p])
);

export type MaintenanceOption = {
  key: string;
  label: string;
  description: string;
  /** Supplément mensuel en euros. */
  price: number;
  /** Nécessite une formule de maintenance active. */
  requiresPlan?: boolean;
};

/**
 * Suppléments mensuels cumulables. Volontairement limités à des prestations
 * simples et récurrentes, dont le prix reflète le temps réel qu'elles coûtent.
 */
export const MAINTENANCE_OPTIONS: MaintenanceOption[] = [
  { key: "backup_quotidien", label: "Sauvegardes quotidiennes", description: "Au lieu d'hebdomadaires, conservées 30 jours.", price: 5, requiresPlan: true },
  { key: "domaine_sup", label: "Nom de domaine supplémentaire", description: "Réservation et redirection vers votre site.", price: 3, requiresPlan: true },
  { key: "emails_sup", label: "3 adresses e-mail supplémentaires", description: "Créées et configurées sur vos appareils.", price: 6, requiresPlan: true },
  { key: "avis_suivi", label: "Surveillance des avis clients", description: "On vous alerte à chaque nouvel avis et on publie vos réponses.", price: 10, requiresPlan: true },
  { key: "suivi_seo", label: "Suivi de positionnement Google", description: "Rapport mensuel de vos mots-clés et de votre trafic.", price: 15, requiresPlan: true },
  { key: "articles_publies", label: "Publication de 2 articles / mois", description: "Vous fournissez le texte, on met en forme, on illustre et on publie.", price: 15, requiresPlan: true },
  { key: "fiches", label: "Mise à jour de fiches", description: "Jusqu'à 20 produits, biens ou annonces mis à jour par mois.", price: 20, requiresPlan: true },
  { key: "contenu_illimite", label: "Modifications de contenu illimitées", description: "Textes et photos, sans compter les heures, sous 48 h ouvrées.", price: 25, requiresPlan: true },
  { key: "astreinte", label: "Support prioritaire 7 j/7", description: "Réponse garantie sous 4 h, week-ends et jours fériés compris.", price: 29, requiresPlan: true },
  { key: "articles_rediges", label: "Rédaction + publication de 2 articles / mois", description: "Choix des sujets, rédaction optimisée SEO et publication.", price: 59, requiresPlan: true },
];

export const MAINTENANCE_OPTIONS_BY_KEY: Record<string, MaintenanceOption> = Object.fromEntries(
  MAINTENANCE_OPTIONS.map((o) => [o.key, o])
);

/* ------------------------------------------------------------------ */
/*  Délai de livraison                                                 */
/* ------------------------------------------------------------------ */

export type DelaiOption = { key: string; label: string; description: string; price: number };

export const DELAIS: DelaiOption[] = [
  { key: "standard", label: "Délai standard", description: "Le rythme normal de production, indiqué par votre formule.", price: 0 },
  { key: "prioritaire", label: "Livraison prioritaire", description: "Votre projet passe en tête de file : délai réduit d'environ moitié.", price: 200 },
];

export const DELAIS_BY_KEY: Record<string, DelaiOption> = Object.fromEntries(DELAIS.map((d) => [d.key, d]));

/* ------------------------------------------------------------------ */
/*  Comparatif /tarifs — dérivé des formules ci-dessus                 */
/* ------------------------------------------------------------------ */

export type CompareRow = { feature: string; values: (boolean | string)[] };

/** Les modules mis en avant dans le tableau comparatif de la page Tarifs. */
const COMPARE_MODULES = [
  "galerie", "admin", "blog", "avis", "seo_avance", "analytics",
  "animations", "espace_client", "boutique", "rdv", "planning",
  "dashboard", "utilisateurs", "multilingue",
];

/**
 * Construit le tableau comparatif directement à partir des formules, pour
 * qu'il ne puisse jamais diverger de ce que le formulaire de devis facture.
 */
export function buildCompareRows(): CompareRow[] {
  const rows: CompareRow[] = [
    { feature: "Design 100 % sur mesure", values: PACKS.map(() => true) },
    { feature: "Compatible mobile et ordinateur", values: PACKS.map(() => true) },
    { feature: "Certificat SSL sécurisé", values: PACKS.map(() => true) },
    { feature: "Nombre de pages comprises", values: PACKS.map((p) => p.pagesLabel) },
    { feature: "Formulaire de contact", values: PACKS.map(() => true) },
    { feature: "SEO de base", values: PACKS.map(() => true) },
  ];

  for (const key of COMPARE_MODULES) {
    const mod = MODULES_BY_KEY[key];
    if (!mod) continue;
    rows.push({
      feature: mod.label,
      values: PACKS.map((p) => (p.includes.includes(key) ? true : mod.price ? `+${mod.price} €` : false)),
    });
  }

  rows.push(
    { feature: "Page supplémentaire", values: PACKS.map((p) => (p.pagesIncluded >= PAGES_UNLIMITED ? "Incluse" : `+${EXTRA_PAGE_PRICE} €`)) },
    { feature: "Mise en ligne (installation)", values: PACKS.map(() => `À partir de ${DEPLOIEMENTS[1].price} €`) },
    { feature: "Nom de domaine + configuration", values: PACKS.map(() => `+${DEPLOIEMENTS[2].price - DEPLOIEMENTS[1].price} €`) },
    { feature: "Maintenance offerte", values: PACKS.map((p) => (p.maintenanceOfferte ? `${p.maintenanceOfferte} mois` : "—")) },
    { feature: "Maintenance ensuite", values: PACKS.map(() => `À partir de ${MAINTENANCE_PLANS[1].price} €/mois`) },
    { feature: "Support après livraison", values: PACKS.map((p) => p.support) },
    { feature: "Délai indicatif", values: PACKS.map((p) => p.delai) }
  );

  return rows;
}

/**
 * Les 7 points forts affichés sur la carte d'une formule (page Tarifs).
 * Dérivés des modules compris, pour rester cohérents avec le comparatif.
 */
export function packHighlights(pack: Pack): string[] {
  const base: string[] = [
    pack.pagesIncluded >= PAGES_UNLIMITED
      ? "Nombre de pages illimité"
      : `Site de ${pack.pagesLabel} page${pack.pagesIncluded > 1 ? "s" : ""}`,
    "Design 100 % sur mesure",
    "Compatible mobile et ordinateur",
  ];

  // Les modules qui différencient réellement la formule (hors socle commun).
  const socle = new Set(["contact", "seo_base", "galerie"]);
  const distinctifs = pack.includes
    .filter((k) => !socle.has(k))
    .map((k) => MODULES_BY_KEY[k]?.label)
    .filter((l): l is string => !!l);

  const queue: string[] = [];
  if (pack.maintenanceOfferte > 0) queue.push(`${pack.maintenanceOfferte} mois de maintenance offerts`);
  queue.push(pack.support === "Dédié" ? "Accompagnement dédié" : `Support ${pack.support} après livraison`);

  return [...base, ...distinctifs.slice(0, 6), ...queue];
}
