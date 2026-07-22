import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { str } from "@/lib/validate";
import { ADMIN_ROLES, PERMISSION_SECTIONS, type AdminRole, type PermissionKey } from "@/lib/types";
import { logActivity } from "@/lib/activityLog";

/** Gestion des comptes réservée aux Administrateurs (évite toute élévation de privilèges). */
async function requireAdministrateur() {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "Administrateur") return null;

  return user;
}

const VALID_PERMISSIONS = new Set(PERMISSION_SECTIONS.map((p) => p.key));

function parsePermissions(value: unknown): PermissionKey[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is PermissionKey => typeof v === "string" && VALID_PERMISSIONS.has(v as PermissionKey));
}

/** Modifie le rôle et/ou les permissions d'un administrateur. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const caller = await requireAdministrateur();
  if (!caller) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const role = str(body.role, 40) as AdminRole;
  const permissions = parsePermissions(body.permissions);
  if (!role || !ADMIN_ROLES.includes(role)) {
    return NextResponse.json({ error: "Rôle invalide." }, { status: 400 });
  }

  const admin = createServiceClient();
  if (!admin) return NextResponse.json({ error: "Supabase non configuré." }, { status: 500 });

  const update: Record<string, unknown> = { role };
  if (permissions !== undefined) update.permissions = permissions;

  const { data: target } = await admin.from("profiles").select("email").eq("id", id).maybeSingle();
  const { error } = await admin.from("profiles").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logActivity(request, {
    userId: caller.id,
    email: caller.email,
    action: "user.update",
    resourceLabel: `${target?.email ?? id} → rôle ${role}`,
    details: { permissions },
  });

  return NextResponse.json({ ok: true });
}

/** Supprime un compte administrateur. */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const caller = await requireAdministrateur();
  if (!caller) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const { id } = await params;
  if (id === caller.id) {
    return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte." }, { status: 400 });
  }

  const admin = createServiceClient();
  if (!admin) return NextResponse.json({ error: "Supabase non configuré." }, { status: 500 });

  const { data: target } = await admin.from("profiles").select("email").eq("id", id).maybeSingle();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logActivity(request, {
    userId: caller.id,
    email: caller.email,
    action: "user.delete",
    resourceLabel: `${target?.email ?? id} supprimé`,
  });

  return NextResponse.json({ ok: true });
}
