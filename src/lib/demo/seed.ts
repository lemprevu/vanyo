/**
 * Données de démonstration du panel client (route publique /demo).
 * Un site fictif crédible — « Studio Lumen » — que le prospect peut
 * manipuler librement. Aucune de ces données ne touche Supabase : tout
 * vit dans le navigateur du visiteur (localStorage), voir demo/store.ts.
 */
import type {
  Realisation, Article, Avis, Plan, PromoCode, AdminProfile, SiteSettingsFull,
} from "@/lib/types";
import type { Devis } from "@/lib/devis";
import { SETTINGS_FALLBACK } from "@/lib/data";
import { PROJECTS, ARTICLES, TESTIMONIALS, PLANS } from "@/lib/content";

export type DemoMessage = {
  id: string;
  created_at: string;
  nom: string;
  email: string;
  sujet?: string | null;
  message: string;
  lu?: boolean;
};

export type DemoState = {
  settings: SiteSettingsFull;
  realisations: Realisation[];
  articles: Article[];
  avis: Avis[];
  plans: Plan[];
  promoCodes: PromoCode[];
  devis: Devis[];
  messages: DemoMessage[];
  users: AdminProfile[];
};

// Horodatages relatifs figés au chargement du module (pas de Date.now()
// répété dans le rendu pour éviter les incohérences d'hydratation).
const now = Date.now();
const iso = (msAgo: number) => new Date(now - msAgo).toISOString();
const H = 3600_000;
const D = 24 * H;

const SETTINGS: SiteSettingsFull = {
  ...SETTINGS_FALLBACK,
  site_name: "Studio Lumen",
  tagline: "Fleuriste & concept-store",
  description:
    "Studio Lumen imagine des compositions florales d'exception et un concept-store où déco, cadeaux et ateliers se rencontrent.",
  email: "bonjour@studio-lumen.fr",
  phone: "04 78 00 12 34",
  address: "18 rue des Lilas, 69002 Lyon",
  hours: "Mar – Sam · 10h – 19h",
  brand_color: "#E5637B",
  font_family: "Poppins",
  seo_keywords: "fleuriste lyon, bouquet sur mesure, concept store, atelier floral",
  og_title: "Studio Lumen — Fleuriste & concept-store à Lyon",
  meta_description:
    "Compositions florales sur mesure, cadeaux et ateliers à Lyon. Découvrez le Studio Lumen.",
  promo_active: true,
  promo_label: "Offre printemps",
  promo_percent: 15,
  // Secrets laissés vides : c'est une démo.
  turnstile_secret: null,
  smtp_host: "ssl0.ovh.net",
  smtp_port: 587,
  smtp_user: "bonjour@studio-lumen.fr",
  smtp_password: null,
  smtp_from: "bonjour@studio-lumen.fr",
  notify_email: "bonjour@studio-lumen.fr",
};

const REALISATIONS: Realisation[] = PROJECTS.map((p, i) => ({
  id: p.slug,
  created_at: iso(i * D),
  title: p.title,
  category: p.category,
  tags: p.tags,
  color: p.color,
  link: null,
  position: i,
}));

const ARTICLE_ROWS: Article[] = ARTICLES.map((a, i) => ({
  id: a.slug,
  created_at: iso(i * D),
  slug: a.slug,
  title: a.title,
  excerpt: a.excerpt,
  content:
    "Voici un exemple d'article. Depuis votre panel, vous pouvez écrire, mettre en forme, planifier la publication et gérer vos brouillons — le tout sans aucune compétence technique.",
  category: a.category,
  color: a.color,
  reading_time: a.readingTime,
  published: i !== 2,
  published_at: a.date,
}));

const AVIS_ROWS: Avis[] = TESTIMONIALS.map((t, i) => ({
  id: String(i),
  created_at: iso(i * 2 * D),
  name: t.name,
  company: t.company,
  rating: t.rating,
  quote: t.quote,
  initials: t.initials,
  featured: i < 4,
  position: i,
}));

const PLAN_ROWS: Plan[] = PLANS.map((p, i) => ({
  id: String(i),
  created_at: iso(i * D),
  name: p.name,
  price: p.price,
  original_price: i === 1 ? "1 990€" : null,
  price_note: p.priceNote,
  description: p.description,
  features: p.features,
  highlight: !!p.highlight,
  position: i,
}));

const PROMO_ROWS: PromoCode[] = [
  { id: "1", created_at: iso(10 * D), code: "PRINTEMPS15", description: "Offre de saison", discount_type: "percent", discount_value: 15, active: true, expires_at: null },
  { id: "2", created_at: iso(30 * D), code: "BIENVENUE", description: "Première commande", discount_type: "amount", discount_value: 10, active: true, expires_at: null },
  { id: "3", created_at: iso(60 * D), code: "NOEL2025", description: "Ancienne opération", discount_type: "percent", discount_value: 20, active: false, expires_at: "2025-12-31" },
];

const DEVIS_ROWS: Devis[] = [
  { id: "1", created_at: iso(1 * H), status: "Nouveau", prenom: "Camille", nom: "Laurent", entreprise: "Maison Laurent", email: "camille@maison-laurent.fr", telephone: "06 12 34 56 78", ville: "Lyon", code_postal: "69002", pays: "France", type_site: "Restaurant", nombre_pages: "6", budget: "2000 - 5000€", nom_domaine: "Oui", hebergement: "Je veux que vous vous en occupiez", logo: "Oui", charte_graphique: "Non", fonctionnalites: ["Réservation", "Galerie", "SEO", "Contact"], description: "Nous souhaitons un site élégant pour notre restaurant avec réservation en ligne et une belle galerie photo de nos plats.", rgpd: true, site_existant: "Non", viewed: false, objectif: "Prendre des rendez-vous", style_visuel: "Chaleureux & convivial" },
  { id: "2", created_at: iso(3 * H), status: "Nouveau", prenom: "Inès", nom: "Roux", entreprise: "Fleurs & Sens", email: "ines@fleurs-sens.fr", telephone: "06 45 78 90 12", ville: "Villeurbanne", pays: "France", type_site: "E-commerce", nombre_pages: "8", budget: "1000 - 2000€", nom_domaine: "Non", hebergement: "Je veux que vous vous en occupiez", logo: "À créer", charte_graphique: "Non", fonctionnalites: ["Paiement", "Galerie", "Newsletter"], description: "Boutique en ligne pour vendre nos bouquets et abonnements floraux.", rgpd: true, site_existant: "Non", viewed: false, objectif: "Vendre en ligne", style_visuel: "Coloré & créatif" },
  { id: "3", created_at: iso(28 * H), status: "Contacté", prenom: "Thomas", nom: "Nguyen", entreprise: "NovaImmo", email: "t.nguyen@novaimmo.fr", telephone: "07 98 76 54 32", ville: "Paris", pays: "France", type_site: "Immobilier", nombre_pages: "12", budget: "5000€ +", nom_domaine: "Oui", hebergement: "Oui", logo: "Oui", charte_graphique: "Oui", fonctionnalites: ["Espace Client", "Dashboard", "SEO", "Multilingue"], description: "Portail immobilier avec recherche avancée et espace client.", rgpd: true, site_existant: "Oui", lien_actuel: "https://novaimmo.fr", viewed: true },
  { id: "4", created_at: iso(3 * D), status: "En cours", prenom: "Sarah", nom: "Benali", entreprise: "Boutique Lumé", email: "sarah@boutique-lume.com", type_site: "E-commerce", budget: "2000 - 5000€", fonctionnalites: ["Paiement", "Newsletter", "Blog"], description: "Boutique en ligne de bougies artisanales.", rgpd: true, nom_domaine: "Non", hebergement: "Je veux que vous vous en occupiez", logo: "À créer", charte_graphique: "Non", viewed: true } as Devis,
  { id: "5", created_at: iso(9 * D), status: "Accepté", prenom: "Julien", nom: "Moreau", entreprise: "Axio Conseil", email: "j.moreau@axio-conseil.fr", telephone: "06 22 33 44 55", ville: "Lyon", pays: "France", type_site: "Site vitrine", nombre_pages: "5", budget: "1000 - 2000€", nom_domaine: "Oui", hebergement: "Oui", logo: "Oui", charte_graphique: "Oui", fonctionnalites: ["Contact", "SEO", "Blog"], description: "Site corporate pour un cabinet de conseil.", rgpd: true, site_existant: "Oui", lien_actuel: "https://axio-conseil.fr", viewed: true, note_interne: "Devis signé le 12/03, acompte reçu." },
  { id: "6", created_at: iso(21 * D), status: "Terminé", prenom: "Léa", nom: "Fontaine", entreprise: "GreenRoots", email: "lea@greenroots.org", type_site: "Association", budget: "500 - 1000€", fonctionnalites: ["Don en ligne", "Blog", "Contact"], description: "Site vitrine pour une association écologique avec module de dons.", rgpd: true, nom_domaine: "Oui", hebergement: "Je veux que vous vous en occupiez", logo: "Oui", charte_graphique: "Oui", viewed: true } as Devis,
];

const MESSAGES: DemoMessage[] = [
  { id: "1", created_at: iso(40 * 60_000), nom: "Marc Dubois", email: "marc@atelier-cassard.fr", sujet: "Portfolio photographe", message: "Bonjour, j'ai vu vos réalisations, superbe travail ! J'aimerais un portfolio dans le même esprit. Êtes-vous disponibles ce mois-ci ?", lu: false },
  { id: "2", created_at: iso(5 * H), nom: "Sophie Martel", email: "sophie.martel@gmail.com", sujet: "Atelier floral — question", message: "Est-il possible de réserver un atelier pour un groupe de 8 personnes ? Merci d'avance.", lu: false },
  { id: "3", created_at: iso(2 * D), nom: "Antoine Lefèvre", email: "a.lefevre@brasserie-nord.fr", sujet: "Devis site restaurant", message: "Nous ouvrons une nouvelle brasserie et cherchons un site avec réservation. Pouvez-vous nous rappeler ?", lu: true },
];

const USERS: AdminProfile[] = [
  { id: "demo-1", email: "vous@studio-lumen.fr", role: "Administrateur", created_at: iso(120 * D) },
  { id: "demo-2", email: "atelier@studio-lumen.fr", role: "Modérateur", created_at: iso(45 * D) },
  { id: "demo-3", email: "ventes@studio-lumen.fr", role: "Commercial", created_at: iso(12 * D) },
];

/** L'identifiant du compte « courant » simulé dans la démo. */
export const DEMO_CURRENT_USER_ID = "demo-1";

/** Construit un état de démo neuf (utilisé au premier chargement et au reset). */
export function makeSeed(): DemoState {
  return {
    settings: { ...SETTINGS },
    realisations: REALISATIONS.map((r) => ({ ...r })),
    articles: ARTICLE_ROWS.map((a) => ({ ...a })),
    avis: AVIS_ROWS.map((a) => ({ ...a })),
    plans: PLAN_ROWS.map((p) => ({ ...p })),
    promoCodes: PROMO_ROWS.map((p) => ({ ...p })),
    devis: DEVIS_ROWS.map((d) => ({ ...d })),
    messages: MESSAGES.map((m) => ({ ...m })),
    users: USERS.map((u) => ({ ...u })),
  };
}
