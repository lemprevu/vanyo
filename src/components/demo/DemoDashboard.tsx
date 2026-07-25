"use client";

import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { AreaChart, DonutStat } from "@/components/admin/Charts";
import { useBiz } from "@/lib/demo/BizProvider";
import type { RequestsSection } from "@/lib/demo/types";

const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil"];
const SERIES = [8, 12, 9, 18, 22, 19, 27];
const ACCENTS = ["vanyo", "emerald", "sky", "amber"] as const;

export function DemoDashboard() {
  const { config, state } = useBiz();
  const base = `/demo/${config.id}`;

  // KPIs : nombre d'éléments par section (hors réglages), 4 max.
  const kpis = config.sections
    // Seules les sections qui portent réellement des données ont un compteur.
    .filter((s) => !["settings", "planning", "signature", "performance", "journal"].includes(s.type))
    .slice(0, 4)
    .map((s, i) => ({
      label: s.label,
      value: (state.collections[s.id] ?? []).length,
      accent: ACCENTS[i % ACCENTS.length],
      icon: s.icon,
    }));

  // Première section « demandes » : sert de flux récent + taux de traitement.
  const reqSection = config.sections.find((s) => s.type === "requests") as RequestsSection | undefined;
  const reqRows = reqSection ? state.collections[reqSection.id] ?? [] : [];
  const doneStatuses = reqSection ? reqSection.statuses.slice(-3) : [];
  const treated = reqRows.filter((r) => doneStatuses.includes(String(r.status))).length;
  const conversion = reqRows.length ? Math.round((treated / reqRows.length) * 100) : 0;
  const recent = [...reqRows]
    .sort((a, b) => new Date(String(b.created_at ?? 0)).getTime() - new Date(String(a.created_at ?? 0)).getTime())
    .slice(0, 6);

  const statusColor = (status: string) => {
    const i = reqSection ? reqSection.statuses.indexOf(status) : -1;
    const p = ["bg-vanyo-500/15 text-vanyo-200", "bg-amber-500/15 text-amber-300", "bg-sky-500/15 text-sky-300", "bg-emerald-500/15 text-emerald-300", "bg-rose-500/15 text-rose-300", "bg-teal-500/15 text-teal-300", "bg-white/8 text-white/50"];
    return p[i] ?? p[p.length - 1];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Tableau de bord</h1>
        <p className="mt-1 text-sm text-white/50">Bienvenue sur l&apos;espace de gestion de {state.settings.site_name}.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <StatCard key={k.label} icon={k.icon ?? LayoutGrid} label={k.label} value={k.value} accent={k.accent} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="gradient-border rounded-2xl bg-ink-card/60 p-5 lg:col-span-2">
          <div className="mb-4">
            <h2 className="font-semibold text-white">Activité récente</h2>
            <p className="text-xs text-white/45">7 derniers mois</p>
          </div>
          <AreaChart data={SERIES} labels={MONTHS} />
        </div>

        <div className="gradient-border flex flex-col items-center justify-center rounded-2xl bg-ink-card/60 p-5">
          <h2 className="mb-2 self-start font-semibold text-white">Taux de traitement</h2>
          <DonutStat value={conversion} label={reqSection ? reqSection.label : "—"} />
        </div>
      </div>

      {reqSection && (
        <div className="gradient-border overflow-hidden rounded-2xl bg-ink-card/60">
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="font-semibold text-white">Dernières {reqSection.label.toLowerCase()}</h2>
            <Link href={`${base}/${reqSection.id}`} className="text-sm text-vanyo-200 hover:text-white">Tout voir</Link>
          </div>
          {/* Trois colonnes courtes : elles tiennent sur un téléphone sans
              défilement horizontal, à condition de resserrer les marges. */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-white/8 text-left text-[11px] uppercase tracking-wide text-white/40 sm:text-xs">
                  <th className="px-3 py-3 font-medium sm:px-5">{reqSection.fields.find((f) => f.key === reqSection.nameField)?.label ?? "Client"}</th>
                  <th className="px-3 py-3 font-medium sm:px-5">Statut</th>
                  <th className="px-3 py-3 text-right font-medium sm:px-5 sm:text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((d) => (
                  <tr key={d.id} className="border-b border-white/5">
                    <td className="max-w-[130px] truncate px-3 py-3 font-medium text-white sm:max-w-none sm:px-5">
                      {String(d[reqSection.nameField] ?? "—")}
                    </td>
                    <td className="px-3 py-3 sm:px-5">
                      <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium sm:px-2.5 sm:text-xs ${statusColor(String(d.status ?? ""))}`}>
                        {String(d.status ?? "")}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right text-white/50 sm:px-5 sm:text-left">
                      {d.created_at ? new Date(String(d.created_at)).toLocaleDateString("fr-FR") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
