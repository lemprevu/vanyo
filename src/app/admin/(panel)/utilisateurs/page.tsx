import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UsersManager } from "./UsersManager";
import type { AdminProfile } from "@/lib/types";
import { getCurrentAdminProfile } from "@/lib/permissions";

export const dynamic = "force-dynamic";

const DEMO: AdminProfile[] = [
  { id: "demo-1", email: "demo@vanyo.fr", role: "Administrateur", permissions: [], created_at: new Date().toISOString() },
];

export default async function Page() {
  const supabase = await createClient();
  if (!supabase) return <UsersManager initial={DEMO} currentUserId="demo-1" live={false} />;

  const profile = await getCurrentAdminProfile();
  if (profile && profile.role !== "Administrateur") redirect("/admin");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("profiles")
    .select("id, email, role, permissions, created_at")
    .order("created_at", { ascending: false });

  return <UsersManager initial={(data as AdminProfile[]) ?? []} currentUserId={user?.id ?? ""} live />;
}
