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
  price_note: string | null;
  description: string | null;
  features: string[];
  highlight: boolean;
  position: number;
};

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
