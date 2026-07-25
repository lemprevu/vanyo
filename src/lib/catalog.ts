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
 * Les valeurs ci-dessous sont les valeurs PAR DÉFAUT. Elles peuvent toutes être
 * modifiées depuis le panel admin (Paramètres → Tarifs) : les modifications
 * sont stockées dans `site_settings.catalog` et appliquées par `resolveCatalog`.
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
  /** Nom d'icône lucide (voir le formulaire de devis). */
  icon: string;
};

const DEFAULT_MODULES: SiteModule[] = [
  // ── Contenu ──────────────────────────────────────────────────────
  { key: "galerie", label: "Galerie photos", description: "Vos visuels mis en valeur, avec vue plein écran.", price: 80, group: "Contenu", icon: "Image" },
  { key: "blog", label: "Blog / actualités", description: "Publiez articles et actualités depuis votre panel.", price: 170, group: "Contenu", icon: "Newspaper" },
  { key: "multilingue", label: "Site multilingue", description: "Une seconde langue complète, avec bascule automatique.", price: 240, group: "Contenu", icon: "Languages" },
  { key: "redaction", label: "Rédaction des textes", description: "On écrit le contenu de vos pages (jusqu'à 5 pages).", price: 190, group: "Contenu", icon: "PenTool" },
  { key: "logo", label: "Création de logo", description: "3 pistes créatives, fichiers vectoriels livrés.", price: 170, group: "Contenu", icon: "Sparkles" },
  { key: "charte", label: "Charte graphique complète", description: "Couleurs, typographies, déclinaisons et guide d'usage.", price: 290, group: "Contenu", icon: "Palette" },

  // ── Conversion ───────────────────────────────────────────────────
  { key: "contact", label: "Formulaire de contact", description: "Réception directe par e-mail, protégé anti-spam.", price: 0, group: "Conversion", icon: "Mail" },
  { key: "formulaire_avance", label: "Formulaire avancé multi-étapes", description: "Parcours guidé, champs conditionnels, pièces jointes.", price: 120, group: "Conversion", icon: "ClipboardList" },
  { key: "rdv", label: "Prise de rendez-vous en ligne", description: "Vos créneaux disponibles, réservables 24 h/24.", price: 240, group: "Conversion", icon: "CalendarCheck" },
  { key: "reservation", label: "Réservation (couverts, créneaux…)", description: "Gestion des disponibilités et confirmations automatiques.", price: 270, group: "Conversion", icon: "CalendarClock" },
  { key: "newsletter", label: "Inscription newsletter", description: "Collecte des e-mails et export de votre liste.", price: 90, group: "Conversion", icon: "Send" },
  { key: "chat", label: "Chat en direct", description: "Discutez avec vos visiteurs depuis votre téléphone.", price: 90, group: "Conversion", icon: "MessageCircle" },
  { key: "avis", label: "Avis clients", description: "Collecte, modération et affichage de vos avis.", price: 120, group: "Conversion", icon: "Star" },

  // ── Vente ────────────────────────────────────────────────────────
  { key: "paiement", label: "Paiement en ligne", description: "Encaissement sécurisé par carte (Stripe).", price: 280, group: "Vente", icon: "CreditCard" },
  { key: "boutique", label: "Boutique e-commerce", description: "Catalogue, panier, commandes et stocks.", price: 550, group: "Vente", icon: "ShoppingCart" },
  { key: "espace_client", label: "Espace client / connexion", description: "Comptes sécurisés et contenu réservé à vos clients.", price: 310, group: "Vente", icon: "LogIn" },
  { key: "devis_ligne", label: "Demande de devis en ligne", description: "Un formulaire de devis détaillé, comme celui-ci.", price: 140, group: "Vente", icon: "FileText" },

  // ── Gestion ──────────────────────────────────────────────────────
  { key: "admin", label: "Panel administrateur", description: "Modifiez vos textes, photos et contenus vous-même.", price: 270, group: "Gestion", icon: "LayoutDashboard" },
  { key: "dashboard", label: "Tableau de bord & statistiques", description: "Vos chiffres clés en un coup d'œil.", price: 240, group: "Gestion", icon: "BarChart3" },
  { key: "planning", label: "Planning / agenda", description: "Vue calendrier de vos rendez-vous et réservations.", price: 200, group: "Gestion", icon: "CalendarDays" },
  { key: "utilisateurs", label: "Comptes & rôles", description: "Plusieurs accès, avec des permissions par personne.", price: 170, group: "Gestion", icon: "Users" },
  { key: "journal", label: "Journal d'activité", description: "L'historique de toutes les actions faites sur le site.", price: 90, group: "Gestion", icon: "ScrollText" },

  // ── Visibilité ───────────────────────────────────────────────────
  { key: "seo_base", label: "SEO de base", description: "Structure, balises, sitemap et vitesse optimisés.", price: 0, group: "Visibilité", icon: "Search" },
  { key: "seo_avance", label: "SEO avancé", description: "Audit, mots-clés, données structurées et contenu optimisé.", price: 200, group: "Visibilité", icon: "TrendingUp" },
  { key: "seo_local", label: "Référencement local", description: "Fiche Google Business et pages par zone d'intervention.", price: 130, group: "Visibilité", icon: "MapPin" },
  { key: "analytics", label: "Analytics & Search Console", description: "Mesure du trafic et suivi de votre référencement.", price: 60, group: "Visibilité", icon: "Gauge" },
  { key: "animations", label: "Animations avancées", description: "Transitions et effets soignés, sans nuire à la vitesse.", price: 170, group: "Visibilité", icon: "Zap" },
  { key: "perf", label: "Optimisation performances poussée", description: "Objectif 95+ sur Lighthouse, images et code au régime.", price: 140, group: "Visibilité", icon: "Rocket" },
];

export const MODULE_GROUPS: ModuleGroup[] = ["Contenu", "Conversion", "Vente", "Gestion", "Visibilité"];

/** Prix par défaut d'une page au-delà de ce que la formule comprend. */
const DEFAULT_EXTRA_PAGE_PRICE = 60;

/* ------------------------------------------------------------------ */
/*  Formules                                                           */
/* ------------------------------------------------------------------ */

/** Valeur de `pagesIncluded` signifiant « autant de pages que nécessaire ». */
export const PAGES_UNLIMITED = 999;

export type Pack = {
  key: string;
  name: string;
  tagline: string;
  /** Prix de base affiché, ou null pour « Sur devis ». */
  base: number | null;
  /**
   * Base retenue pour l'estimation interne quand `base` est null.
   * Le client voit « Sur devis », mais le panel doit quand même proposer un
   * montant de départ : sans lui, une demande sur mesure arrivait sans aucun
   * chiffre et il n'y avait rien sur quoi s'appuyer.
   */
  internalBase?: number;
  /** Prix conseillé barré, pour afficher la remise. */
  originalPrice?: number | null;
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

const DEFAULT_PACKS: Pack[] = [
  {
    key: "starter",
    name: "Starter",
    tagline: "Idéal pour lancer une présence en ligne soignée.",
    base: 390,
    originalPrice: 590,
    pagesIncluded: 3,
    pagesLabel: "1 à 3",
    includes: STARTER_MODULES,
    support: "30 jours",
    delai: "5 à 8 jours",
    maintenanceOfferte: 1,
  },
  {
    key: "business",
    name: "Business",
    tagline: "Le choix des entreprises qui veulent convertir.",
    base: 890,
    originalPrice: 1290,
    pagesIncluded: 8,
    pagesLabel: "jusqu'à 8",
    highlight: true,
    includes: BUSINESS_MODULES,
    support: "3 mois",
    delai: "10 à 15 jours",
    maintenanceOfferte: 3,
  },
  {
    key: "premium",
    name: "Premium",
    tagline: "Pour un projet ambitieux et évolutif.",
    base: 1790,
    originalPrice: 2590,
    pagesIncluded: PAGES_UNLIMITED,
    pagesLabel: "Illimité",
    includes: PREMIUM_MODULES,
    support: "12 mois",
    delai: "3 à 5 semaines",
    maintenanceOfferte: 6,
  },
  {
    key: "surmesure",
    name: "Sur Mesure",
    tagline: "Application web, plateforme ou besoin spécifique.",
    base: null,
    internalBase: 2400,
    originalPrice: null,
    pagesIncluded: PAGES_UNLIMITED,
    pagesLabel: "Illimité",
    includes: [...PREMIUM_MODULES, "boutique", "paiement", "multilingue", "devis_ligne"],
    support: "Dédié",
    delai: "Sur mesure",
    maintenanceOfferte: 6,
  },
];

/** Choix « je ne sais pas encore » proposé dans le formulaire. */
export const PACK_UNDECIDED = "conseillez_moi";

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

const DEFAULT_DEPLOIEMENTS: DeploymentOption[] = [
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
    price: 89,
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
    price: 149,
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
    price: 199,
    includes: [
      "Tout de « Installation + nom de domaine »",
      "3 adresses @votredomaine créées",
      "Configuration sur vos téléphones et ordinateurs",
      "Signature e-mail professionnelle offerte",
    ],
  },
];

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

/**
 * Les formules ne contiennent QUE des prestations légères ou automatisées :
 * surveillance, sauvegardes, mises à jour, rapports générés. Les quelques
 * interventions manuelles sont bornées en nombre, jamais « illimitées ».
 */
const DEFAULT_MAINTENANCE_PLANS: MaintenancePlan[] = [
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
    price: 12,
    features: [
      "Hébergement et nom de domaine maintenus",
      "Certificat HTTPS renouvelé automatiquement",
      "Sauvegardes automatiques hebdomadaires",
      "Mises à jour de sécurité",
      "Surveillance de disponibilité 24 h/24",
    ],
  },
  {
    key: "confort",
    label: "Confort",
    description: "Le plus choisi : on s'occupe aussi des petites retouches.",
    price: 29,
    recommended: true,
    features: [
      "Tout l'Essentiel",
      "3 modifications de contenu par mois",
      "Rapport mensuel de fréquentation",
      "Support par email sous 48 h ouvrées",
      "Restauration en cas de problème",
    ],
  },
  {
    key: "serenite",
    label: "Sérénité",
    description: "Le confort, avec plus de retouches et le suivi Google.",
    price: 59,
    features: [
      "Tout le Confort",
      "8 modifications de contenu par mois",
      "Rapport de positionnement Google",
      "Sauvegardes quotidiennes",
      "Support par email sous 24 h ouvrées",
    ],
  },
];

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
 * simples : soit automatisées (sauvegardes, alertes, rapports), soit bornées
 * à un petit nombre d'actions par mois. Rien d'ouvert ni de rédactionnel.
 */
const DEFAULT_MAINTENANCE_OPTIONS: MaintenanceOption[] = [
  { key: "domaine_sup", label: "Nom de domaine supplémentaire", description: "Réservation et redirection vers votre site. Configuré une fois.", price: 3, requiresPlan: true },
  { key: "backup_quotidien", label: "Sauvegardes quotidiennes", description: "Au lieu d'hebdomadaires, conservées 30 jours. Automatique.", price: 4, requiresPlan: true },
  { key: "emails_sup", label: "3 adresses e-mail supplémentaires", description: "Créées une fois, puis rien à gérer.", price: 5, requiresPlan: true },
  { key: "monitoring", label: "Alerte immédiate en cas de panne", description: "Surveillance renforcée et notification automatique.", price: 5, requiresPlan: true },
  { key: "staging", label: "Copie de test avant modification", description: "Un double du site pour valider avant publication. Automatique.", price: 6, requiresPlan: true },
  { key: "avis_alertes", label: "Alertes sur les nouveaux avis", description: "Notification à chaque avis, et publication de votre réponse.", price: 7, requiresPlan: true },
  { key: "photos", label: "Ajout de 5 photos par mois", description: "Vous envoyez les photos, on les intègre et on les optimise.", price: 9, requiresPlan: true },
  { key: "rapport_seo", label: "Rapport de positionnement Google", description: "Vos mots-clés et votre trafic, rapport généré chaque mois.", price: 9, requiresPlan: true },
  { key: "publication_articles", label: "Publication de 2 articles par mois", description: "Vous fournissez le texte, on le met en forme et on publie.", price: 12, requiresPlan: true },
  { key: "modifs_sup", label: "5 modifications de contenu en plus", description: "Textes et photos, en complément de votre formule.", price: 15, requiresPlan: true },
];

/* ------------------------------------------------------------------ */
/*  Délai de livraison                                                 */
/* ------------------------------------------------------------------ */

export type DelaiOption = { key: string; label: string; description: string; price: number };

const DEFAULT_DELAIS: DelaiOption[] = [
  { key: "standard", label: "Délai standard", description: "Le rythme normal de production, indiqué par votre formule.", price: 0 },
  { key: "prioritaire", label: "Livraison prioritaire", description: "Votre projet passe en tête de file : délai réduit d'environ moitié.", price: 140 },
];

/* ------------------------------------------------------------------ */
/*  Personnalisation depuis le panel admin                             */
/* ------------------------------------------------------------------ */

type Override<T> = Partial<T>;

/**
 * Modifications apportées au catalogue depuis Paramètres → Tarifs.
 * Stockées telles quelles dans `site_settings.catalog` (JSONB).
 * Tout champ absent garde sa valeur par défaut : une mise à jour du catalogue
 * par défaut profite donc automatiquement aux champs non personnalisés.
 */
export type CatalogOverrides = {
  extraPagePrice?: number;
  packs?: Record<string, Override<Pack>>;
  modules?: Record<string, Override<SiteModule>>;
  deploiements?: Record<string, Override<DeploymentOption>>;
  maintenancePlans?: Record<string, Override<MaintenancePlan>>;
  maintenanceOptions?: Record<string, Override<MaintenanceOption>>;
  delais?: Record<string, Override<DelaiOption>>;
};

export type Catalog = {
  packs: Pack[];
  packsByKey: Record<string, Pack>;
  modules: SiteModule[];
  modulesByKey: Record<string, SiteModule>;
  deploiements: DeploymentOption[];
  deploiementsByKey: Record<string, DeploymentOption>;
  maintenancePlans: MaintenancePlan[];
  maintenancePlansByKey: Record<string, MaintenancePlan>;
  maintenanceOptions: MaintenanceOption[];
  maintenanceOptionsByKey: Record<string, MaintenanceOption>;
  delais: DelaiOption[];
  delaisByKey: Record<string, DelaiOption>;
  extraPagePrice: number;
};

/** Applique les personnalisations sur une liste d'éléments identifiés par `key`. */
function merge<T extends { key: string }>(base: T[], over?: Record<string, Override<T>>): T[] {
  if (!over) return base;
  return base.map((item) => {
    const patch = over[item.key];
    if (!patch) return item;
    // On ignore les valeurs `undefined` du patch pour ne jamais écraser
    // une valeur par défaut par du vide.
    const clean = Object.fromEntries(
      Object.entries(patch).filter(([, v]) => v !== undefined)
    ) as Override<T>;
    return { ...item, ...clean };
  });
}

const byKey = <T extends { key: string }>(list: T[]): Record<string, T> =>
  Object.fromEntries(list.map((i) => [i.key, i]));

/** Construit le catalogue effectif : valeurs par défaut + personnalisations. */
export function resolveCatalog(overrides?: CatalogOverrides | null): Catalog {
  const packs = merge(DEFAULT_PACKS, overrides?.packs);
  const modules = merge(DEFAULT_MODULES, overrides?.modules);
  const deploiements = merge(DEFAULT_DEPLOIEMENTS, overrides?.deploiements);
  const maintenancePlans = merge(DEFAULT_MAINTENANCE_PLANS, overrides?.maintenancePlans);
  const maintenanceOptions = merge(DEFAULT_MAINTENANCE_OPTIONS, overrides?.maintenanceOptions);
  const delais = merge(DEFAULT_DELAIS, overrides?.delais);

  return {
    packs, packsByKey: byKey(packs),
    modules, modulesByKey: byKey(modules),
    deploiements, deploiementsByKey: byKey(deploiements),
    maintenancePlans, maintenancePlansByKey: byKey(maintenancePlans),
    maintenanceOptions, maintenanceOptionsByKey: byKey(maintenanceOptions),
    delais, delaisByKey: byKey(delais),
    extraPagePrice: overrides?.extraPagePrice ?? DEFAULT_EXTRA_PAGE_PRICE,
  };
}

/** Catalogue par défaut, sans aucune personnalisation. */
export const DEFAULT_CATALOG: Catalog = resolveCatalog(null);

// Raccourcis pratiques pour le code qui n'a pas besoin des personnalisations
// (valeurs de repli, seeds de démonstration, tests).
export const PACKS = DEFAULT_CATALOG.packs;
export const MODULES = DEFAULT_CATALOG.modules;
export const DEPLOIEMENTS = DEFAULT_CATALOG.deploiements;
export const MAINTENANCE_PLANS = DEFAULT_CATALOG.maintenancePlans;
export const MAINTENANCE_OPTIONS = DEFAULT_CATALOG.maintenanceOptions;
export const DELAIS = DEFAULT_CATALOG.delais;
export const EXTRA_PAGE_PRICE = DEFAULT_CATALOG.extraPagePrice;

/* ------------------------------------------------------------------ */
/*  Remises                                                            */
/* ------------------------------------------------------------------ */

export type Discount = { label: string; percent: number };

/** Remise « catalogue » d'une formule (prix conseillé barré → prix affiché). */
export function packDiscountPercent(pack: Pack): number {
  if (pack.base === null || !pack.originalPrice || pack.originalPrice <= pack.base) return 0;
  return Math.round((1 - pack.base / pack.originalPrice) * 100);
}

/** Applique une remise en pourcentage à un montant, arrondi à l'euro. */
export function applyDiscount(amount: number, percent: number): number {
  if (!percent) return amount;
  return Math.max(0, Math.round(amount * (1 - percent / 100)));
}

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
export function buildCompareRows(catalog: Catalog = DEFAULT_CATALOG): CompareRow[] {
  const { packs, modulesByKey, deploiements, maintenancePlans, extraPagePrice } = catalog;

  const rows: CompareRow[] = [
    { feature: "Design 100 % sur mesure", values: packs.map(() => true) },
    { feature: "Compatible mobile et ordinateur", values: packs.map(() => true) },
    { feature: "Certificat SSL sécurisé", values: packs.map(() => true) },
    { feature: "Nombre de pages comprises", values: packs.map((p) => p.pagesLabel) },
    { feature: "Formulaire de contact", values: packs.map(() => true) },
    { feature: "SEO de base", values: packs.map(() => true) },
  ];

  for (const key of COMPARE_MODULES) {
    const mod = modulesByKey[key];
    if (!mod) continue;
    rows.push({
      feature: mod.label,
      values: packs.map((p) => (p.includes.includes(key) ? true : mod.price ? `+${mod.price} €` : false)),
    });
  }

  const install = deploiements.find((d) => d.key === "installation");
  const domaine = deploiements.find((d) => d.key === "installation_domaine");
  const essentiel = maintenancePlans.find((p) => p.key === "essentiel");

  rows.push(
    { feature: "Page supplémentaire", values: packs.map((p) => (p.pagesIncluded >= PAGES_UNLIMITED ? "Incluse" : `+${extraPagePrice} €`)) },
    { feature: "Mise en ligne (installation)", values: packs.map(() => (install ? `À partir de ${install.price} €` : "—")) },
    {
      feature: "Nom de domaine + configuration",
      values: packs.map(() => (install && domaine ? `+${Math.max(0, domaine.price - install.price)} €` : "—")),
    },
    { feature: "Maintenance offerte", values: packs.map((p) => (p.maintenanceOfferte ? `${p.maintenanceOfferte} mois` : "—")) },
    { feature: "Maintenance ensuite", values: packs.map(() => (essentiel ? `À partir de ${essentiel.price} €/mois` : "—")) },
    { feature: "Support après livraison", values: packs.map((p) => p.support) },
    { feature: "Délai indicatif", values: packs.map((p) => p.delai) }
  );

  return rows;
}

/**
 * Les points forts affichés sur la carte d'une formule (page Tarifs).
 * Dérivés des modules compris, pour rester cohérents avec le comparatif.
 */
export function packHighlights(pack: Pack, catalog: Catalog = DEFAULT_CATALOG): string[] {
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
    .map((k) => catalog.modulesByKey[k]?.label)
    .filter((l): l is string => !!l);

  const queue: string[] = [];
  if (pack.maintenanceOfferte > 0) queue.push(`${pack.maintenanceOfferte} mois de maintenance offerts`);
  queue.push(pack.support === "Dédié" ? "Accompagnement dédié" : `Support ${pack.support} après livraison`);

  return [...base, ...distinctifs.slice(0, 6), ...queue];
}
