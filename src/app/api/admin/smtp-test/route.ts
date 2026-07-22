import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendNotification, emailTemplate } from "@/lib/mailer";

/** Envoie un email de test pour vérifier la configuration SMTP. */
export async function POST() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const result = await sendNotification(
    "Test SMTP — Vanyo",
    emailTemplate("Configuration SMTP validée", [["Statut", "L'envoi d'emails fonctionne 🎉"]]),
    { bypassToggle: true }
  );

  if (!result.sent) {
    return NextResponse.json(
      {
        error:
          result.reason === "smtp-not-configured"
            ? "SMTP non configuré (hôte, utilisateur et mot de passe requis)."
            : "Échec de l'envoi. Vérifiez vos identifiants SMTP.",
      },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
