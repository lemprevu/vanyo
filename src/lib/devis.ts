/** Options et types partagés du formulaire de devis + panel admin. */

// Le catalogue commercial (formules, modules, mise en ligne, maintenance) vit
// dans `catalog.ts` : c'est la source unique de vérité des prix. On le
// ré-exporte ici pour que les composants n'aient qu'un seul import à faire.
export * from "@/lib/catalog";

export const SITE_TYPES = [
  "Site vitrine",
  "E-commerce",
  "Restaurant",
  "Immobilier",
  "Association",
  "Portfolio",
  "Blog",
  "Application Web",
  "Autre",
] as const;

export const BUDGETS = [
  "Je ne sais pas encore",
  "< 500€",
  "500 - 1000€",
  "1000 - 2000€",
  "2000 - 5000€",
  "5000€ +",
] as const;

/** Objectif principal du site. */
export const OBJECTIFS = [
  "Obtenir des contacts / demandes",
  "Vendre en ligne",
  "Présenter mon activité",
  "Prendre des rendez-vous",
  "Me faire connaître (notoriété)",
  "Autre",
] as const;

/** Style visuel recherché — les valeurs pilotent aussi l'aperçu généré. */
export const STYLES_VISUELS = [
  "Moderne & épuré",
  "Luxe & premium",
  "Coloré & créatif",
  "Corporate & sérieux",
  "Chaleureux & convivial",
  "Minimaliste",
] as const;

/** Palette proposée en un clic à l'étape « Style ». */
export const COULEURS_PRESETS = [
  { label: "Violet", value: "#6D4AFF" },
  { label: "Bleu nuit", value: "#1E3A8A" },
  { label: "Bleu ciel", value: "#38BDF8" },
  { label: "Émeraude", value: "#059669" },
  { label: "Doré", value: "#C9A227" },
  { label: "Bordeaux", value: "#7F1D1D" },
  { label: "Orange", value: "#EA580C" },
  { label: "Rose", value: "#EC4899" },
  { label: "Turquoise", value: "#14B8A6" },
  { label: "Anthracite", value: "#1F2937" },
] as const;

/** D'où vient le contenu (textes/images). */
export const CONTENU_TYPES = [
  "Je fournis tout (textes + images)",
  "J'ai une partie du contenu",
  "Je veux que vous rédigiez tout",
] as const;

export const PHOTOS_STATES = ["Oui, de qualité", "Quelques-unes", "Non, aucune"] as const;

export const TRISTATE = ["Oui", "Non", "Je veux que vous vous en occupiez"] as const;
export const LOGO_STATE = ["Oui", "Non", "À créer"] as const;

export const DEVIS_STATUSES = [
  "Nouveau",
  "En attente",
  "Contacté",
  "En cours",
  "Accepté",
  "Refusé",
  "Terminé",
  "Archivé",
] as const;

export type DevisStatus = (typeof DEVIS_STATUSES)[number];

export const STATUS_STYLES: Record<DevisStatus, string> = {
  Nouveau: "bg-vanyo-500/15 text-vanyo-200 border-vanyo-500/40",
  "En attente": "bg-amber-500/15 text-amber-300 border-amber-500/40",
  Contacté: "bg-sky-500/15 text-sky-300 border-sky-500/40",
  "En cours": "bg-blue-500/15 text-blue-300 border-blue-500/40",
  Accepté: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  Refusé: "bg-rose-500/15 text-rose-300 border-rose-500/40",
  Terminé: "bg-teal-500/15 text-teal-300 border-teal-500/40",
  Archivé: "bg-white/8 text-white/50 border-white/15",
};

/** Représentation d'un devis (aligné sur la table `devis` Supabase). */
export type Devis = {
  id: string;
  created_at: string;
  status: DevisStatus;
  nom: string;
  prenom: string;
  entreprise?: string | null;
  email: string;
  telephone?: string | null;
  adresse?: string | null;
  ville?: string | null;
  code_postal?: string | null;
  pays?: string | null;
  /** Types de site retenus (multi-sélection). */
  types_site?: string[] | null;
  /** Objectifs retenus (multi-sélection). */
  objectifs?: string[] | null;
  site_existant?: string | null;
  lien_actuel?: string | null;
  logo?: string | null;
  charte_graphique?: string | null;
  budget?: string | null;
  date_souhaitee?: string | null;
  description?: string | null;
  note_interne?: string | null;
  rgpd: boolean;
  viewed?: boolean;

  // ── Questionnaire « Style & contenu » ──────────────────────────
  style_visuel?: string | null;
  ambiance?: string | null;
  couleurs_souhaitees?: string | null;
  inspirations?: string | null;
  concurrents?: string | null;
  public_cible?: string | null;
  contenu_type?: string | null;
  langues?: string | null;
  a_des_photos?: string | null;

  // ── Configuration chiffrée (formulaire v2) ─────────────────────
  /** Clé de formule choisie : starter | business | premium | surmesure. */
  formule?: string | null;
  /** Nombre total de pages souhaité. */
  pages_total?: number | null;
  /** Clés de modules retenus (voir catalog.MODULES). */
  modules?: string[] | null;
  /** Clé d'option de mise en ligne (voir catalog.DEPLOIEMENTS). */
  deploiement?: string | null;
  /** Clé de formule de maintenance (voir catalog.MAINTENANCE_PLANS). */
  maintenance?: string | null;
  /** Suppléments mensuels retenus. */
  maintenance_options?: string[] | null;
  /** Clé de délai (standard | prioritaire). */
  delai?: string | null;
  /** Estimation ponctuelle affichée au client au moment de l'envoi. */
  estimation?: number | null;
  /** Estimation mensuelle affichée au client au moment de l'envoi. */
  estimation_mensuelle?: number | null;
  /** Remise appliquée au moment de l'envoi (%) et son libellé. */
  remise_percent?: number | null;
  remise_label?: string | null;

  // ── Champs hérités de la v1 (anciennes demandes) ───────────────
  /** Ancien champ mono-valeur ; remplacé par `types_site`. */
  type_site?: string | null;
  /** Ancien champ mono-valeur ; remplacé par `objectifs`. */
  objectif?: string | null;
  nombre_pages?: string | null;
  nom_domaine?: string | null;
  hebergement?: string | null;
  fonctionnalites?: string[] | null;
  options?: string[] | null;
  pages_supplementaires?: number | null;
};
