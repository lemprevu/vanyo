import type { createClient } from "@/lib/supabase/server";

type SupabaseClient = NonNullable<Awaited<ReturnType<typeof createClient>>>;
type PageViewRow = { path: string; source: string | null; device: string | null; created_at: string };

export type TrafficStats = {
  total: number;
  uniqueSources: number;
  trend: { labels: string[]; data: number[] };
  topPages: { path: string; count: number }[];
  topSources: { source: string; count: number }[];
  mobileShare: number; // pourcentage
};

const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

/** Agrège les 14 derniers jours de trafic maison (table page_views). */
export async function getTrafficStats(supabase: SupabaseClient | null): Promise<TrafficStats | null> {
  if (!supabase) return null;

  const since = new Date();
  since.setDate(since.getDate() - 14);

  const { data, error } = await supabase
    .from("page_views")
    .select("path, source, device, created_at")
    .gte("created_at", since.toISOString());

  if (error || !data) return null;

  const rows = data as PageViewRow[];

  // Tendance : nombre de vues par jour, 14 derniers jours.
  const dayBuckets = new Map<string, number>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dayBuckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const r of rows) {
    const key = r.created_at.slice(0, 10);
    if (dayBuckets.has(key)) dayBuckets.set(key, (dayBuckets.get(key) ?? 0) + 1);
  }
  const trendEntries = [...dayBuckets.entries()];
  const trend = {
    labels: trendEntries.map(([date]) => DAY_LABELS[new Date(date).getDay() === 0 ? 6 : new Date(date).getDay() - 1]),
    data: trendEntries.map(([, count]) => count),
  };

  // Pages les plus vues.
  const pageCounts = new Map<string, number>();
  for (const r of rows) pageCounts.set(r.path, (pageCounts.get(r.path) ?? 0) + 1);
  const topPages = [...pageCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([path, count]) => ({ path, count }));

  // Provenance (referrer simplifié).
  const sourceCounts = new Map<string, number>();
  for (const r of rows) {
    const s = r.source || "direct";
    sourceCounts.set(s, (sourceCounts.get(s) ?? 0) + 1);
  }
  const topSources = [...sourceCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([source, count]) => ({ source, count }));

  const mobileCount = rows.filter((r) => r.device === "mobile").length;

  return {
    total: rows.length,
    uniqueSources: sourceCounts.size,
    trend,
    topPages,
    topSources,
    mobileShare: rows.length ? Math.round((mobileCount / rows.length) * 100) : 0,
  };
}
