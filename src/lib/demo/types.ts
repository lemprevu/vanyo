/**
 * Types du système de démonstration « par métier ».
 * Un métier (restaurant, immobilier…) est décrit par une config : marque,
 * couleur, et une liste de sections. Chaque section s'appuie sur un manager
 * générique piloté par ce schéma, ce qui permet d'ajouter un métier sans
 * écrire de nouveau composant.
 */
import type { LucideIcon } from "lucide-react";
import type { SiteSettingsFull } from "@/lib/types";

/** Un champ éditable d'une fiche ou d'une demande. */
export type FieldType =
  | "text" | "textarea" | "number" | "price"
  | "select" | "tags" | "boolean" | "date" | "color" | "rating" | "image";

export type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  options?: readonly string[]; // pour select
  placeholder?: string;
  required?: boolean;
  suffix?: string;             // ex. " €", " pers."
  /** Affiché en pastille dans la liste. */
  badge?: boolean;
  /** Masqué de la liste (visible seulement dans le formulaire/détail). */
  hideInList?: boolean;
};

/** Une ligne de données (fiche/demande) — forme libre selon le schéma. */
export type Row = { id: string; created_at?: string; [key: string]: unknown };

/** Section « collection » : CRUD de fiches (plats, biens, produits, prestations…). */
export type CollectionSection = {
  type: "collection";
  id: string;
  label: string;
  icon: LucideIcon;
  itemLabel: string;          // « un plat », « un bien »
  titleField: string;         // champ servant de titre de carte
  layout?: "grid" | "list";
  fields: FieldDef[];
  colorField?: string;        // champ couleur/dégradé pour le visuel
  imageField?: string;        // champ photo (prioritaire sur colorField si renseigné)
  seed: Row[];
};

/** Section « demandes » : flux entrant avec statuts (réservations, commandes, RDV…). */
export type RequestsSection = {
  type: "requests";
  id: string;
  label: string;
  icon: LucideIcon;
  nameField: string;          // champ nom du client
  statuses: readonly string[];
  columns: string[];          // clés affichées en colonnes
  fields: FieldDef[];         // champs affichés dans le détail
  /** Cette section alimente-t-elle le badge « à traiter » (statut = statuses[0]). */
  countsAsPending?: boolean;
  seed: Row[];
};

/** Section « avis clients » (réutilise le manager d'avis existant). */
export type ReviewsSection = {
  type: "reviews";
  id: string;
  label: string;
  icon: LucideIcon;
  seed: Row[];
};

/** Section « messages » (formulaire de contact). */
export type MessagesSection = {
  type: "messages";
  id: string;
  label: string;
  icon: LucideIcon;
  seed: Row[];
};

/** Section « paramètres » (branding, coordonnées, apparence…). */
export type SettingsSection = {
  type: "settings";
  id: string;
  label: string;
  icon: LucideIcon;
};

/** Section « blog » (réutilise le gestionnaire d'articles existant). */
export type BlogSection = {
  type: "blog";
  id: string;
  label: string;
  icon: LucideIcon;
  seed: Row[];
};

/** Section « utilisateurs » (accès admin, rôles, permissions). */
export type UsersSection = {
  type: "users";
  id: string;
  label: string;
  icon: LucideIcon;
  seed: Row[];
};

/** Section « signature email » (générateur, pas de données propres). */
export type SignatureSection = {
  type: "signature";
  id: string;
  label: string;
  icon: LucideIcon;
};

/** Section « performance & SEO » (indicateurs illustratifs, pas de données propres). */
export type PerformanceSection = {
  type: "performance";
  id: string;
  label: string;
  icon: LucideIcon;
};

/** Section « journal d'activité » (dérivée des autres sections, pas de données propres). */
export type JournalSection = {
  type: "journal";
  id: string;
  label: string;
  icon: LucideIcon;
};

/**
 * Section « planning » : vue calendrier/agenda. Ne stocke pas ses propres
 * données — elle lit et écrit celles d'une section « demandes » (sourceId),
 * pour que le calendrier et la liste restent synchronisés.
 */
export type PlanningSection = {
  type: "planning";
  id: string;
  label: string;
  icon: LucideIcon;
  sourceId: string;    // id de la section « requests » associée
  dateField: string;   // champ date des lignes (ex. "date")
  timeField?: string;  // champ heure (ex. "heure")
};

export type Section =
  | CollectionSection | RequestsSection | ReviewsSection | MessagesSection | SettingsSection | PlanningSection
  | BlogSection | UsersSection | SignatureSection | PerformanceSection | JournalSection;

/** Configuration complète d'un métier. */
export type MetierConfig = {
  id: string;                 // "restaurant" (slug d'URL)
  label: string;              // "Restaurant"
  icon: LucideIcon;
  tagline: string;            // accroche de la carte de choix
  businessName: string;       // nom du commerce fictif
  accent: string;             // couleur d'accent (hex)
  settings: Partial<SiteSettingsFull>;
  sections: Section[];
  /** Petites stats affichées sur le tableau de bord. */
  dashboard?: {
    kpis?: { label: string; from: string; kind?: "count" | "sum" | "static"; value?: string; sumField?: string }[];
  };
};

/** État persisté d'un métier : réglages + données de chaque section. */
export type BizState = {
  settings: SiteSettingsFull;
  collections: Record<string, Row[]>;
};
