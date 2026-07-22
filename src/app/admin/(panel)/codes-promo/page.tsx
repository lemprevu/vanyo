import { createClient } from "@/lib/supabase/server";
import { PromoManager } from "./PromoManager";
import type { PromoCode } from "@/lib/types";
import { requirePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

const DEMO: PromoCode[] = [
  { id: "1", created_at: new Date().toISOString(), code: "BIENVENUE10", description: "Offre de lancement", discount_type: "percent", discount_value: 10, active: true, expires_at: null },
];

export default async function Page() {
  await requirePermission("codes-promo");
  const supabase = await createClient();
  if (!supabase) return <PromoManager initial={DEMO} live={false} />;

  const { data } = await supabase.from("promo_codes").select("*").order("created_at", { ascending: false });
  return <PromoManager initial={(data as PromoCode[]) ?? []} live />;
}
