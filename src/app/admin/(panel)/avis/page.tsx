import { createClient } from "@/lib/supabase/server";
import { AvisManager } from "./AvisManager";
import type { Avis } from "@/lib/types";
import { TESTIMONIALS } from "@/lib/content";
import { requirePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

const DEMO: Avis[] = TESTIMONIALS.map((t, i) => ({
  id: String(i),
  created_at: new Date().toISOString(),
  name: t.name,
  company: t.company,
  rating: t.rating,
  quote: t.quote,
  initials: t.initials,
  featured: true,
  position: i,
}));

export default async function Page() {
  await requirePermission("avis");
  const supabase = await createClient();
  if (!supabase) return <AvisManager initial={DEMO} live={false} />;

  const { data } = await supabase.from("avis").select("*").order("position", { ascending: true });
  return <AvisManager initial={(data as Avis[]) ?? []} live />;
}
