import { createClient } from "@/lib/supabase/server";
import { RealisationsManager } from "./RealisationsManager";
import type { Realisation } from "@/lib/types";
import { PROJECTS } from "@/lib/content";

export const dynamic = "force-dynamic";

const DEMO: Realisation[] = PROJECTS.map((p, i) => ({
  id: p.slug,
  created_at: new Date().toISOString(),
  title: p.title,
  category: p.category,
  tags: p.tags,
  color: p.color,
  link: null,
  position: i,
}));

export default async function Page() {
  const supabase = await createClient();
  if (!supabase) return <RealisationsManager initial={DEMO} live={false} />;

  const { data } = await supabase.from("realisations").select("*").order("position", { ascending: true });
  return <RealisationsManager initial={(data as Realisation[]) ?? []} live />;
}
