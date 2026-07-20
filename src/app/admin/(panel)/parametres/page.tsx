import { Settings, Search, Palette, Mail, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PlansManager } from "./PlansManager";
import type { Plan } from "@/lib/types";
import { PLANS as DEMO_PLANS } from "@/lib/content";

export const dynamic = "force-dynamic";

const groups = [
  { icon: Settings, title: "Général", items: ["Nom du site", "Logo & favicon", "Coordonnées", "Réseaux sociaux"] },
  { icon: Palette, title: "Apparence", items: ["Couleurs de la marque", "Typographie", "Sections de la page d'accueil"] },
  { icon: Search, title: "SEO", items: ["Titre & description", "Mots-clés", "OpenGraph / Twitter", "robots.txt & sitemap"] },
  { icon: Mail, title: "Emails & SMTP", items: ["Serveur SMTP", "Email d'expédition", "Notifications"] },
  { icon: Shield, title: "Sécurité & intégrations", items: ["Google Analytics", "Meta Pixel", "reCAPTCHA / Turnstile", "Double authentification"] },
];

const DEMO: Plan[] = DEMO_PLANS.map((p, i) => ({
  id: String(i),
  created_at: new Date().toISOString(),
  name: p.name,
  price: p.price,
  price_note: p.priceNote,
  description: p.description,
  features: p.features,
  highlight: !!p.highlight,
  position: i,
}));

export default async function Page() {
  const supabase = await createClient();
  let plans = DEMO;
  let live = false;
  if (supabase) {
    const { data } = await supabase.from("plans").select("*").order("position", { ascending: true });
    plans = (data as Plan[]) ?? [];
    live = true;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Paramètres</h1>
        <p className="mt-1 text-sm text-white/50">Configurez l'ensemble de votre site depuis un seul endroit.</p>
      </div>

      <PlansManager initial={plans} live={live} />

      <div>
        <p className="mb-3 text-xs uppercase tracking-wide text-white/40">Autres réglages (à venir)</p>
        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((g) => (
            <div key={g.title} className="gradient-border rounded-2xl bg-ink-card/60 p-5 opacity-70">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vanyo-500/12 text-vanyo-300 ring-1 ring-vanyo-500/25">
                  <g.icon className="h-5 w-5" />
                </div>
                <h2 className="font-semibold text-white">{g.title}</h2>
              </div>
              <ul className="mt-4 space-y-2">
                {g.items.map((it) => (
                  <li key={it} className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2 text-sm text-white/50">
                    {it}
                    <span className="text-xs text-white/25">Bientôt</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
