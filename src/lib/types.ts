/** Types des contenus éditables depuis le panel admin (tables Supabase). */

export type Realisation = {
  id: string;
  created_at: string;
  title: string;
  category: string;
  tags: string[];
  color: string;
  link: string | null;
  position: number;
};

export type Article = {
  id: string;
  created_at: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  category: string;
  color: string;
  reading_time: string;
  published: boolean;
  published_at: string;
};

export type Avis = {
  id: string;
  created_at: string;
  name: string;
  company: string | null;
  rating: number;
  quote: string;
  initials: string | null;
  featured: boolean;
  position: number;
};

export type Plan = {
  id: string;
  created_at: string;
  name: string;
  price: string;
  original_price: string | null;
  price_note: string | null;
  description: string | null;
  features: string[];
  highlight: boolean;
  position: number;
};

export const ADMIN_ROLES = ["Administrateur", "Modérateur", "Commercial"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export type AdminProfile = {
  id: string;
  email: string | null;
  role: AdminRole;
  created_at: string;
};

export const HOME_SECTIONS = [
  { key: "stats", label: "Bandeau statistiques" },
  { key: "logos", label: "Bandeau « Ils nous font confiance »" },
  { key: "services", label: "Nos services" },
  { key: "why", label: "Pourquoi Vanyo" },
  { key: "process", label: "Processus" },
  { key: "realisations", label: "Réalisations" },
  { key: "pricing", label: "Tarifs" },
  { key: "testimonials", label: "Avis clients" },
  { key: "faq", label: "FAQ" },
] as const;

export const FONT_CHOICES = [
  { key: "Geist", label: "Geist (défaut)" },
  { key: "Inter", label: "Inter" },
  { key: "Poppins", label: "Poppins" },
  { key: "Montserrat", label: "Montserrat" },
] as const;

/** Champs publics (sans secrets) — sûrs à envoyer au navigateur. */
export type SiteSettings = {
  id: number;
  site_name: string;
  tagline: string;
  description: string | null;
  email: string;
  phone: string;
  address: string;
  hours: string;
  instagram: string | null;
  linkedin: string | null;
  twitter: string | null;
  dribbble: string | null;
  brand_color: string;
  font_family: string;
  home_sections: string[];
  seo_keywords: string | null;
  og_title: string | null;
  og_description: string | null;
  search_visible: boolean;
  meta_description: string | null;
  og_image: string | null;
  twitter_handle: string | null;
  google_verification: string | null;
  ga_id: string | null;
  meta_pixel_id: string | null;
  turnstile_site_key: string | null;
  promo_active: boolean;
  promo_label: string | null;
  promo_percent: number;
  promo_expires_at: string | null;
};

export type PromoCode = {
  id: string;
  created_at: string;
  code: string;
  description: string | null;
  discount_type: "percent" | "amount";
  discount_value: number;
  active: boolean;
  expires_at: string | null;
};

/** Champs complets (avec secrets) — uniquement côté serveur / admin. */
export type SiteSettingsFull = SiteSettings & {
  turnstile_secret: string | null;
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_user: string | null;
  smtp_password: string | null;
  smtp_from: string | null;
  notify_email: string | null;
  /** Clé API PageSpeed Insights (Google Cloud), optionnelle — voir /admin/performance. */
  pagespeed_api_key: string | null;
};

export const CATEGORIES_REALISATIONS = [
  "Restaurant", "Entreprise", "Immobilier", "Association", "Commerce", "Portfolio", "Landing Page",
] as const;

export const CATEGORIES_ARTICLES = [
  "Performance", "SEO", "Design", "Restaurant", "Conseils",
] as const;

export const COLOR_PRESETS = [
  { label: "Violet", value: "from-vanyo-500/30 to-violet-hi/30" },
  { label: "Ambre", value: "from-amber-500/30 to-vanyo-500/30" },
  { label: "Ciel", value: "from-sky-500/30 to-vanyo-500/30" },
  { label: "Émeraude", value: "from-emerald-500/30 to-vanyo-500/30" },
  { label: "Rose", value: "from-rose-500/30 to-vanyo-500/30" },
  { label: "Indigo", value: "from-indigo-500/30 to-vanyo-500/30" },
] as const;
