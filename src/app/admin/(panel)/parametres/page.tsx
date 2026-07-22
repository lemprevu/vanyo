import { createClient } from "@/lib/supabase/server";
import { getSiteSettingsFull } from "@/lib/settings-server";
import { SettingsTabs } from "./SettingsTabs";
import { PlansManager } from "./PlansManager";
import type { Plan } from "@/lib/types";
import { PLANS as DEMO_PLANS } from "@/lib/content";
import { requirePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

const DEMO_PLAN_ROWS: Plan[] = DEMO_PLANS.map((p, i) => ({
  id: String(i),
  created_at: new Date().toISOString(),
  name: p.name,
  price: p.price,
  original_price: null,
  price_note: p.priceNote,
  description: p.description,
  features: p.features,
  highlight: !!p.highlight,
  position: i,
}));

export default async function Page() {
  await requirePermission("parametres");
  const supabase = await createClient();
  const live = !!supabase;

  let plans = DEMO_PLAN_ROWS;
  if (supabase) {
    const { data } = await supabase.from("plans").select("*").order("position", { ascending: true });
    plans = (data as Plan[]) ?? [];
  }

  const settings = await getSiteSettingsFull();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Paramètres</h1>
        <p className="mt-1 text-sm text-white/50">Configurez l'ensemble de votre site depuis un seul endroit.</p>
      </div>

      <SettingsTabs initial={settings} live={live} />

      <div>
        <h2 className="mb-3 text-lg font-semibold text-white">Tarifs</h2>
        <PlansManager initial={plans} live={live} />
      </div>
    </div>
  );
}
