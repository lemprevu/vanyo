import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { req, str } from "@/lib/validate";
import { ADMIN_ROLES, type AdminRole } from "@/lib/types";

/** Vérifie qu'un administrateur est bien connecté avant toute action privilégiée. */
async function requireAdmin() {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? supabase : null;
}

/** Crée un nouveau compte admin (email + mot de passe + rôle). */
export async function POST(request: Request) {
  const caller = await requireAdmin();
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

  await admin.from("profiles").update({ role }).eq("id", data.user.id);

  return NextResponse.json({ ok: true, id: data.user.id });
}
