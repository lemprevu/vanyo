/**
 * Récupération du contenu éditable (Supabase) avec repli automatique
 * sur le contenu statique de démonstration (`content.ts`) quand
 * Supabase n'est pas configuré ou qu'une table est vide.
 */
import { createClient } from "@/lib/supabase/server";
import {
  PROJECTS, ARTICLES, TESTIMONIALS, PLANS,
  type Project, type Article as StaticArticle, type Testimonial, type Plan as StaticPlan,
} from "@/lib/content";
import type { Realisation, Article, Avis, Plan } from "@/lib/types";

export async function getRealisations(): Promise<Project[]> {
  const supabase = await createClient();
  if (!supabase) return PROJECTS;

  const { data } = await supabase.from("realisations").select("*").order("position", { ascending: true });
  const rows = data as Realisation[] | null;
  if (!rows || rows.length === 0) return PROJECTS;

  return rows.map((r) => ({
    slug: r.id, title: r.title, category: r.category, tags: r.tags, color: r.color,
  }));
}

export async function getArticles(): Promise<StaticArticle[]> {
  const supabase = await createClient();
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
  const supabase = await createClient();
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
  const supabase = await createClient();
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
  const supabase = await createClient();
  if (!supabase) return PLANS;

  const { data } = await supabase.from("plans").select("*").order("position", { ascending: true });
  const rows = data as Plan[] | null;
  if (!rows || rows.length === 0) return PLANS;

  return rows.map((p) => ({
    name: p.name, price: p.price, priceNote: p.price_note ?? "", description: p.description ?? "",
    features: p.features, highlight: p.highlight,
  }));
}
