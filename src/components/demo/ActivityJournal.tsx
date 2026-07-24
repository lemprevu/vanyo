"use client";

import { useMemo } from "react";
import { ScrollText } from "lucide-react";
import type { MetierConfig, BizState, Row } from "@/lib/demo/types";

type LogRow = { id: string; created_at: string; action: string; detail: string };

function labelFor(row: Row, titleField?: string, nameField?: string): string {
  if (titleField && row[titleField]) return String(row[titleField]);
  if (nameField && row[nameField]) return String(row[nameField]);
  return "élément";
}

/**
 * Version démo du « Journal d'activité » : le panel réel trace les actions
 * d'administration (création d'utilisateurs...). Ici, sans compte réel à
 * suivre, on reconstitue une timeline plausible à partir des données déjà
 * saisies dans le simulateur (nouvelles fiches, demandes, avis...).
 */
export function ActivityJournal({ config, state }: { config: MetierConfig; state: BizState }) {
  const rows = useMemo<LogRow[]>(() => {
    const entries: LogRow[] = [];
    for (const section of config.sections) {
      const data = state.collections[section.id] ?? [];
      if (section.type === "requests") {
        for (const r of data) {
          entries.push({
            id: `${section.id}-${r.id}`,
            created_at: r.created_at ?? new Date().toISOString(),
            action: section.label,
            detail: `Nouvelle entrée de ${labelFor(r, undefined, section.nameField)} · statut « ${String(r.status ?? "")} »`,
          });
        }
      } else if (section.type === "collection") {
        for (const r of data) {
          entries.push({
            id: `${section.id}-${r.id}`,
            created_at: r.created_at ?? new Date().toISOString(),
            action: section.label,
            detail: `Fiche ajoutée — ${labelFor(r, section.titleField)}`,
          });
        }
      } else if (section.type === "reviews") {
        for (const r of data) {
          entries.push({
            id: `${section.id}-${r.id}`,
            created_at: r.created_at ?? new Date().toISOString(),
            action: "Avis clients",
            detail: `Nouvel avis de ${String(r.name ?? "un client")} (${String(r.rating ?? "")}/5)`,
          });
        }
      } else if (section.type === "messages") {
        for (const r of data) {
          entries.push({
            id: `${section.id}-${r.id}`,
            created_at: r.created_at ?? new Date().toISOString(),
            action: "Messages",
            detail: `Message reçu de ${String(r.nom ?? "un visiteur")} — ${String(r.sujet ?? "")}`,
          });
        }
      } else if (section.type === "blog") {
        for (const r of data) {
          entries.push({
            id: `${section.id}-${r.id}`,
            created_at: r.created_at ?? new Date().toISOString(),
            action: "Blog",
            detail: `Article ${r.published ? "publié" : "enregistré en brouillon"} — ${String(r.title ?? "")}`,
          });
        }
      } else if (section.type === "users") {
        for (const r of data) {
          entries.push({
            id: `${section.id}-${r.id}`,
            created_at: r.created_at ?? new Date().toISOString(),
            action: "Utilisateurs",
            detail: `Accès créé — ${String(r.email ?? "")} (${String(r.role ?? "")})`,
          });
        }
      }
    }
    return entries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 50);
  }, [config, state]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Journal d&apos;activité</h1>
        <p className="mt-1 text-sm text-white/50">Ce qui s&apos;est passé sur le site, dans l&apos;ordre · démonstration</p>
      </div>

      <div className="gradient-border overflow-hidden rounded-2xl bg-ink-card/60">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-white/8 text-left text-xs uppercase tracking-wide text-white/40">
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Rubrique</th>
                <th className="px-5 py-3 font-medium">Détail</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-white/5 last:border-0">
                  <td className="whitespace-nowrap px-5 py-3 text-white/50">
                    {new Date(r.created_at).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-full border border-vanyo-500/30 bg-vanyo-500/10 px-2.5 py-0.5 text-xs font-medium text-vanyo-200">
                      {r.action}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-white/70">{r.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-sm text-white/40">
            <ScrollText className="h-6 w-6 text-white/25" />
            Aucune activité pour l&apos;instant.
          </div>
        )}
      </div>
    </div>
  );
}
