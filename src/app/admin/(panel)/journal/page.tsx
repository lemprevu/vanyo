import { redirect } from "next/navigation";
import { ScrollText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentAdminProfile } from "@/lib/permissions";

export const dynamic = "force-dynamic";

type LogRow = {
  id: string;
  created_at: string;
  email: string | null;
  ip: string | null;
  action: string;
  resource_label: string | null;
};

const ACTION_LABELS: Record<string, string> = {
  "user.create": "Création d'un utilisateur",
  "user.update": "Modification d'un utilisateur",
  "user.delete": "Suppression d'un utilisateur",
};

export default async function JournalPage() {
  const supabase = await createClient();

  if (supabase) {
    const profile = await getCurrentAdminProfile();
    if (profile && profile.role !== "Administrateur") redirect("/admin");
  }

  const DEMO: LogRow[] = [
    { id: "1", created_at: new Date().toISOString(), email: "demo@vanyo.fr", ip: "192.168.1.10", action: "user.create", resource_label: "collegue@vanyo.fr créé avec le rôle Modérateur" },
    { id: "2", created_at: new Date(Date.now() - 3600_000).toISOString(), email: "demo@vanyo.fr", ip: "192.168.1.10", action: "user.update", resource_label: "collegue@vanyo.fr → rôle Commercial" },
  ];

  let rows = DEMO;
  let live = false;

  if (supabase) {
    const { data } = await supabase
      .from("activity_logs")
      .select("id, created_at, email, ip, action, resource_label")
      .order("created_at", { ascending: false })
      .limit(200);
    if (data) {
      rows = data as LogRow[];
      live = true;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Journal d&apos;activité</h1>
        <p className="mt-1 text-sm text-white/50">
          Qui a fait quoi, depuis quelle adresse IP{!live && " · démonstration"}.
        </p>
      </div>

      <div className="gradient-border overflow-hidden rounded-2xl bg-ink-card/60">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-white/8 text-left text-xs uppercase tracking-wide text-white/40">
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Utilisateur</th>
                <th className="px-5 py-3 font-medium">Action</th>
                <th className="px-5 py-3 font-medium">Détail</th>
                <th className="px-5 py-3 font-medium">IP</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-white/5 last:border-0">
                  <td className="whitespace-nowrap px-5 py-3 text-white/50">
                    {new Date(r.created_at).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-5 py-3 font-medium text-white">{r.email ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-full border border-vanyo-500/30 bg-vanyo-500/10 px-2.5 py-0.5 text-xs font-medium text-vanyo-200">
                      {ACTION_LABELS[r.action] ?? r.action}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-white/70">{r.resource_label ?? "—"}</td>
                  <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-white/45">{r.ip ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-sm text-white/40">
            <ScrollText className="h-6 w-6 text-white/25" />
            Aucune activité enregistrée pour l&apos;instant.
          </div>
        )}
      </div>

      <p className="text-xs text-white/35">
        Actuellement, ce journal couvre la gestion des accès administrateurs (création, rôle, suppression) —
        les actions les plus sensibles. L&apos;extension à d&apos;autres sections (devis, contenu…) peut être
        ajoutée si besoin.
      </p>
    </div>
  );
}
