/** Options et types partagés du formulaire de devis + panel admin. */

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

export const FEATURES = [
  "Connexion",
  "Paiement",
  "Blog",
  "Galerie",
  "Contact",
  "Agenda",
  "Réservation",
  "Espace Client",
  "Dashboard",
  "Newsletter",
  "Chat",
  "Multilingue",
  "Animations",
  "SEO",
  "Autre",
] as const;

export const BUDGETS = [
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

/** Style visuel recherché. */
export const STYLES_VISUELS = [
  "Moderne & épuré",
  "Luxe & premium",
  "Coloré & créatif",
  "Corporate & sérieux",
  "Chaleureux & convivial",
  "Minimaliste",
] as const;

/** D'où vient le contenu (textes/images). */
export const CONTENU_TYPES = [
  "Je fournis tout (textes + images)",
  "J'ai une partie du contenu",
  "Je veux que vous rédigiez tout",
] as const;

/** Options payantes supplémentaires proposées à l'étape dédiée. */
export const OPTIONS_SUP = [
  { key: "Page supplémentaire", price: "À partir de 50 €", counter: true },
  { key: "Livraison prioritaire (72 h)", price: "+100 €" },
  { key: "Maintenance mensuelle", price: "À partir de 19 €/mois" },
  { key: "Création de logo", price: "Sur devis" },
  { key: "Rédaction de contenu", price: "Sur devis" },
] as const;

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
  type_site?: string | null;
  nombre_pages?: string | null;
  site_existant?: string | null;
  lien_actuel?: string | null;
  nom_domaine?: string | null;
  hebergement?: string | null;
  logo?: string | null;
  charte_graphique?: string | null;
  fonctionnalites?: string[] | null;
  budget?: string | null;
  date_souhaitee?: string | null;
  description?: string | null;
  note_interne?: string | null;
  rgpd: boolean;
  viewed?: boolean;
  // Questionnaire "Style & contenu"
  objectif?: string | null;
  style_visuel?: string | null;
  ambiance?: string | null;
  couleurs_souhaitees?: string | null;
  inspirations?: string | null;
  concurrents?: string | null;
  public_cible?: string | null;
  contenu_type?: string | null;
  langues?: string | null;
  a_des_photos?: string | null;
  // Options payantes supplémentaires
  options?: string[] | null;
  pages_supplementaires?: number | null;
};
