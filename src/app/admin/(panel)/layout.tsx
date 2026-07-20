import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "./AdminShell";

export const dynamic = "force-dynamic";

/** Layout du panel : vérifie la session et alimente le shell. */
export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Supabase non configuré : mode démonstration (accès ouvert, données fictives).
  if (!supabase) {
    return (
      <AdminShell
        email="demo@vanyo.fr"
        live={false}
        counts={{ devis: 3, messages: 2 }}
        notifications={[
          { id: "1", type: "devis", text: "Nouvelle demande de devis — Maison Laurent", time: "Il y a 12 min" },
          { id: "2", type: "message", text: "Nouveau message de contact", time: "Il y a 1 h" },
        ]}
      >
        {children}
      </AdminShell>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  // Compteurs "non traités"
  const [{ count: devisCount }, { count: msgCount }] = await Promise.all([
    supabase.from("devis").select("*", { count: "exact", head: true }).eq("status", "Nouveau"),
    supabase.from("messages").select("*", { count: "exact", head: true }).eq("lu", false),
  ]);

  // Notifications = devis pas encore consultés. Si la colonne `viewed`
  // n'existe pas encore (migration supabase/notifications.sql non exécutée),
  // on retombe sur les 5 dernières demandes pour ne rien casser.
  let recent = await supabase
    .from("devis")
    .select("id, prenom, nom, created_at")
    .eq("viewed", false)
    .order("created_at", { ascending: false })
    .limit(8);

  if (recent.error) {
    recent = await supabase
      .from("devis")
      .select("id, prenom, nom, created_at")
      .order("created_at", { ascending: false })
      .limit(5);
  }

  const notifications = (recent.data ?? []).map((d) => ({
    id: d.id,
    type: "devis",
    text: `Nouvelle demande de devis — ${d.prenom} ${d.nom}`,
    time: new Date(d.created_at).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
  }));

  return (
    <AdminShell
      email={user.email ?? "admin"}
      live
      counts={{ devis: devisCount ?? 0, messages: msgCount ?? 0 }}
      notifications={notifications}
    >
      {children}
    </AdminShell>
  );
}
