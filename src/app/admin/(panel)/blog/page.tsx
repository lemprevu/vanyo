import { createClient } from "@/lib/supabase/server";
import { ArticlesManager } from "./ArticlesManager";
import type { Article } from "@/lib/types";
import { ARTICLES } from "@/lib/content";
import { requirePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

const DEMO: Article[] = ARTICLES.map((a) => ({
  id: a.slug,
  created_at: new Date().toISOString(),
  slug: a.slug,
  title: a.title,
  excerpt: a.excerpt,
  content: null,
  category: a.category,
  color: a.color,
  reading_time: a.readingTime,
  published: true,
  published_at: a.date,
}));

export default async function Page() {
  await requirePermission("blog");
  const supabase = await createClient();
  if (!supabase) return <ArticlesManager initial={DEMO} live={false} />;

  const { data } = await supabase.from("articles").select("*").order("published_at", { ascending: false });
  return <ArticlesManager initial={(data as Article[]) ?? []} live />;
}
