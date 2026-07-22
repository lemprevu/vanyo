import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AdminProfile, PermissionKey } from "@/lib/types";

/**
 * Profil de l'utilisateur admin connecté (rôle + permissions), ou null en
 * mode démonstration (Supabase non configuré — accès total, comme avant).
 */
export async function getCurrentAdminProfile(): Promise<AdminProfile | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, email, role, permissions, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!data) return null;
  return {
    id: data.id,
    email: data.email ?? user.email ?? null,
    role: data.role ?? "Administrateur",
    permissions: data.permissions ?? [],
    created_at: data.created_at,
  };
}

/** Un Administrateur a toujours accès à tout ; les autres rôles selon leur liste de permissions. */
export function canAccess(profile: AdminProfile | null, key: PermissionKey): boolean {
  if (!profile) return true; // démo / Supabase non configuré : accès ouvert
  if (profile.role === "Administrateur") return true;
  return profile.permissions.includes(key);
}

/**
 * À appeler en haut d'une page serveur restreinte : redirige vers le
 * tableau de bord si l'utilisateur connecté n'a pas la permission requise.
 */
export async function requirePermission(key: PermissionKey): Promise<AdminProfile | null> {
  const profile = await getCurrentAdminProfile();
  if (!canAccess(profile, key)) redirect("/admin");
  return profile;
}
