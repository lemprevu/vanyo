/**
 * Récupération du contenu éditable (Supabase) avec repli automatique
 * sur le contenu statique de démonstration (`content.ts`) quand
 * Supabase n'est pas configuré ou qu'une table est vide.
 *
 * Utilise le client « public » (sans cookies) : ces lectures sont
 * anonymes et ne doivent jamais forcer le rendu dynamique des pages.
 */
import { createPublicClient } from "@/lib/supabase/public";
import { SITE } from "@/lib/site";
import {
  PROJECTS, ARTICLES, TESTIMONIALS, PLANS,
  type Project, type Article as StaticArticle, type Testimonial, type Plan as StaticPlan,
} from "@/lib/content";
import type { Realisation, Article, Avis, Plan, SiteSettings } from "@/lib/types";

export async function getRealisations(): Promise<Project[]> {
  const supabase = createPublicClient();
  if (!supabase) return PROJECTS;

  const { data } = await supabase.from("realisations").select("*").order("position", { ascending: true });
  const rows = data as Realisation[] | null;
  if (!rows || rows.length === 0) return PROJECTS;

  return rows.map((r) => ({
    slug: r.id, title: r.title, category: r.category, tags: r.tags, color: r.color, link: r.link,
  }));
}

export async function getArticles(): Promise<StaticArticle[]> {
  const supabase = createPublicClient();
  if (!supabase) return ARTICLES;

  const { data } = await supabase
    .from("articles").select("*").eq("published", true).order("published_at", { ascending: false });
  const rows = data as Article[] | null;
  if (!rows || rows.length === 0) return ARTICLES;

  return rows.map((a) => ({
    slug: a.slug, title: a.title, excerpt: a.excerpt ?? "", category: a.category,
    date: a.published_at, readingTime: a.reading_time, color: a.color,
  }));
}

export async function getArticleBySlug(slug: string): Promise<(StaticArticle & { content?: string | null }) | null> {
  const supabase = createPublicClient();
  if (supabase) {
    const { data } = await supabase.from("articles").select("*").eq("slug", slug).eq("published", true).maybeSingle();
    if (data) {
      const a = data as Article;
      return {
        slug: a.slug, title: a.title, excerpt: a.excerpt ?? "", category: a.category,
        date: a.published_at, readingTime: a.reading_time, color: a.color, content: a.content,
      };
    }
  }
  return ARTICLES.find((a) => a.slug === slug) ?? null;
}

export async function getAvis(): Promise<Testimonial[]> {
  const supabase = createPublicClient();
  if (!supabase) return TESTIMONIALS;

  const { data } = await supabase.from("avis").select("*").eq("featured", true).order("position", { ascending: true });
  const rows = data as Avis[] | null;
  if (!rows || rows.length === 0) return TESTIMONIALS;

  return rows.map((a) => ({
    name: a.name, company: a.company ?? "", rating: a.rating, quote: a.quote,
    initials: a.initials ?? a.name.slice(0, 2).toUpperCase(),
  }));
}

export async function getPlans(): Promise<StaticPlan[]> {
  const supabase = createPublicClient();
  if (!supabase) return PLANS;

  const { data } = await supabase.from("plans").select("*").order("position", { ascending: true });
  const rows = data as Plan[] | null;
  if (!rows || rows.length === 0) return PLANS;

  return rows.map((p) => ({
    name: p.name, price: p.price, originalPrice: p.original_price, priceNote: p.price_note ?? "",
    description: p.description ?? "", features: p.features, highlight: p.highlight,
  }));
}

export const SETTINGS_FALLBACK: SiteSettings = {
  id: 1,
  site_name: SITE.name,
  tagline: SITE.tagline,
  description: SITE.description,
  email: SITE.email,
  phone: SITE.phone,
  address: SITE.address,
  hours: SITE.hours,
  instagram: SITE.socials.instagram,
  linkedin: SITE.socials.linkedin,
  twitter: SITE.socials.twitter,
  dribbble: SITE.socials.dribbble,
  brand_color: "#6D4AFF",
  font_family: "Geist",
  home_sections: ["stats", "logos", "services", "why", "process", "realisations", "pricing", "testimonials", "faq"],
  seo_keywords: null,
  og_title: null,
  og_description: null,
  search_visible: true,
  meta_description: null,
  og_image: null,
  twitter_handle: null,
  google_verification: null,
  ga_id: null,
  meta_pixel_id: null,
  turnstile_site_key: null,
  promo_active: false,
  promo_label: "Offre limitée",
  promo_percent: 10,
  promo_expires_at: null,
};

/**
 * Réglages publics du site (SANS secrets), lus via la vue Supabase
 * `site_settings_public`. Utilisé partout sur le site public.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createPublicClient();
  if (!supabase) return SETTINGS_FALLBACK;

  const { data } = await supabase.from("site_settings_public").select("*").eq("id", 1).maybeSingle();
  if (!data) return SETTINGS_FALLBACK;
  // Fusion avec le fallback pour couvrir un éventuel champ null.
  return { ...SETTINGS_FALLBACK, ...(data as Partial<SiteSettings>) } as SiteSettings;
}
