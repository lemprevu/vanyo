import { FileText, Users, Eye, MessageSquare, Newspaper, ImageIcon, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/admin/StatCard";
import { AreaChart, DonutStat } from "@/components/admin/Charts";
import { STATUS_STYLES, type Devis, type DevisStatus } from "@/lib/devis";
import Link from "next/link";

export const dynamic = "force-dynamic";

const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil"];

export default async function DashboardPage() {
  const supabase = await createClient();

  let total = 0;
  let today = 0;
  let recent: Partial<Devis>[] = [];
  const series = [8, 12, 9, 18, 22, 19, 27];

  if (supabase) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [{ count }, { count: todayCount }, { data }] = await Promise.all([
      supabase.from("devis").select("*", { count: "exact", head: true }),
      supabase.from("devis").select("*", { count: "exact", head: true }).gte("created_at", startOfDay.toISOString()),
      supabase.from("devis").select("id, prenom, nom, entreprise, type_site, budget, status, created_at").order("created_at", { ascending: false }).limit(6),
    ]);
    total = count ?? 0;
    today = todayCount ?? 0;
    recent = data ?? [];
  } else {
    // Données de démonstration
    total = 142;
    today = 4;
    recent = [
      { id: "1", prenom: "Camille", nom: "Laurent", entreprise: "Maison Laurent", type_site: "Restaurant", budget: "2000 - 5000€", status: "Nouveau", created_at: new Date().toISOString() },
      { id: "2", prenom: "Thomas", nom: "Nguyen", entreprise: "NovaImmo", type_site: "Immobilier", budget: "5000€ +", status: "Contacté", created_at: new Date().toISOString() },
      { id: "3", prenom: "Sarah", nom: "Benali", entreprise: "Boutique Lumé", type_site: "E-commerce", budget: "2000 - 5000€", status: "En cours", created_at: new Date().toISOString() },
      { id: "4", prenom: "Julien", nom: "Moreau", entreprise: "Axio Conseil", type_site: "Site vitrine", budget: "1000 - 2000€", status: "Accepté", created_at: new Date().toISOString() },
    ];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Tableau de bord</h1>
        <p className="mt-1 text-sm text-white/50">Vue d'ensemble de votre activité en temps réel.</p>
      </div>

      {/* Cartes statistiques */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText} label="Demandes totales" value={total} trend="+18%" accent="vanyo" />
        <StatCard icon={TrendingUp} label="Demandes aujourd'hui" value={today} accent="emerald" />
        <StatCard icon={Users} label="Clients" value={supabase ? "—" : 86} accent="sky" />
        <StatCard icon={Eye} label="Visiteurs (30j)" value={supabase ? "—" : "12,4k"} trend="+9%" accent="amber" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Graphique */}
        <div className="gradient-border rounded-2xl bg-ink-card/60 p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white">Évolution des demandes</h2>
              <p className="text-xs text-white/45">7 derniers mois</p>
            </div>
          </div>
          <AreaChart data={series} labels={MONTHS} />
        </div>

        {/* Conversion */}
        <div className="gradient-border flex flex-col items-center justify-center rounded-2xl bg-ink-card/60 p-5">
          <h2 className="mb-2 self-start font-semibold text-white">Taux de conversion</h2>
          <DonutStat value={34} label="Devis → clients" />
          <div className="mt-4 grid w-full grid-cols-2 gap-2 text-center">
            <div className="rounded-xl bg-white/[0.03] p-3">
              <div className="text-lg font-bold text-white">2 h</div>
              <div className="text-xs text-white/45">Réponse moy.</div>
            </div>
            <div className="rounded-xl bg-white/[0.03] p-3">
              <div className="text-lg font-bold text-white">12 j</div>
              <div className="text-xs text-white/45">Livraison moy.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Petits compteurs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={MessageSquare} label="Messages" value={supabase ? "—" : 12} accent="sky" />
        <StatCard icon={Newspaper} label="Articles" value={6} accent="vanyo" />
        <StatCard icon={ImageIcon} label="Réalisations" value={9} accent="emerald" />
      </div>

      {/* Dernières demandes */}
      <div className="gradient-border overflow-hidden rounded-2xl bg-ink-card/60">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-semibold text-white">Dernières demandes</h2>
          <Link href="/admin/devis" className="text-sm text-vanyo-200 hover:text-white">Tout voir</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-y border-white/8 text-left text-xs uppercase tracking-wide text-white/40">
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Budget</th>
                <th className="px-5 py-3 font-medium">Statut</th>
                <th className="px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((d) => (
                <tr key={d.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                  <td className="px-5 py-3">
                    <div className="font-medium text-white">{d.prenom} {d.nom}</div>
                    <div className="text-xs text-white/40">{d.entreprise || "—"}</div>
                  </td>
                  <td className="px-5 py-3 text-white/70">{d.type_site || "—"}</td>
                  <td className="px-5 py-3 text-white/70">{d.budget || "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[(d.status as DevisStatus) ?? "Nouveau"]}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-white/50">
                    {d.created_at ? new Date(d.created_at).toLocaleDateString("fr-FR") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
