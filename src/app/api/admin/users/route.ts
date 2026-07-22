import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { req, str } from "@/lib/validate";
import { ADMIN_ROLES, PERMISSION_SECTIONS, type AdminRole, type PermissionKey } from "@/lib/types";
import { logActivity } from "@/lib/activityLog";

/**
 * Vérifie qu'un Administrateur est bien connecté avant toute action
 * privilégiée. La gestion des comptes reste réservée aux Administrateurs :
 * l'accorder à un rôle inférieur ouvrirait une élévation de privilèges
 * (un Modérateur pourrait sinon se créer un accès Administrateur).
 */
async function requireAdministrateur() {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "Administrateur") return null;

  return { supabase, user };
}

const VALID_PERMISSIONS = new Set(PERMISSION_SECTIONS.map((p) => p.key));

function parsePermissions(value: unknown): PermissionKey[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is PermissionKey => typeof v === "string" && VALID_PERMISSIONS.has(v as PermissionKey));
}

/** Crée un nouveau compte admin (email + mot de passe + rôle + permissions). */
export async function POST(request: Request) {
  const caller = await requireAdministrateur();
  if (!caller) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const email = req(body.email, 254);
  const password = str(body.password, 200);
  const role = (str(body.role, 40) as AdminRole) || "Administrateur";
  const permissions = parsePermissions(body.permissions);

  if (!email || !password || password.length < 8) {
    return NextResponse.json(
      { error: "Email requis et mot de passe d'au moins 8 caractères." },
      { status: 400 }
    );
  }
  if (!ADMIN_ROLES.includes(role)) {
    return NextResponse.json({ error: "Rôle invalide." }, { status: 400 });
  }

  const admin = createServiceClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase non configuré." }, { status: 500 });
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) {
    return NextResponse.json({ error: error?.message || "Impossible de créer le compte." }, { status: 400 });
  }

  await admin.from("profiles").update({ role, permissions }).eq("id", data.user.id);

  await logActivity(request, {
    userId: caller.user.id,
    email: caller.user.email,
    action: "user.create",
    resourceLabel: `${email} créé avec le rôle ${role}`,
    details: { permissions },
  });

  return NextResponse.json({ ok: true, id: data.user.id });
}
