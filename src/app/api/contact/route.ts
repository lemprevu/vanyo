import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { isEmail, req, str, clean } from "@/lib/validate";
import { sendNotification, emailTemplate } from "@/lib/mailer";
import { verifyTurnstile } from "@/lib/turnstile";

/** Réception d'un message de contact public. */
export async function POST(request: Request) {
  const ip = clientIp(request);
  const { ok } = rateLimit(`contact:${ip}`, 5, 60_000);
  if (!ok) {
    return NextResponse.json(
      { error: "Trop de messages. Réessayez dans une minute." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const nom = req(body.nom, 120);
  const message = req(body.message, 5000);
  if (!nom || !message) {
    return NextResponse.json({ error: "Nom et message requis." }, { status: 400 });
  }
  if (!isEmail(body.email)) {
    return NextResponse.json({ error: "Email invalide." }, { status: 400 });
  }
  if (!(await verifyTurnstile(body.turnstileToken))) {
    return NextResponse.json({ error: "Vérification anti-spam échouée. Réessayez." }, { status: 400 });
  }

  const record = {
    nom: clean(nom),
    email: (body.email as string).toLowerCase(),
    sujet: str(body.sujet, 200),
    message: clean(message),
    ip,
    lu: false,
  };

  const supabase = createServiceClient();
  if (!supabase) {
    console.warn("[contact] Supabase non configuré — message reçu:", record.email);
    return NextResponse.json({ ok: true, persisted: false });
  }

  const { error } = await supabase.from("messages").insert(record);
  if (error) {
    console.error("[contact] Erreur Supabase:", error.message);
    return NextResponse.json({ error: "Envoi impossible pour le moment." }, { status: 500 });
  }

  await sendNotification(
    `Nouveau message — ${record.nom}`,
    emailTemplate(
      "Nouveau message de contact",
      [
        ["Nom", record.nom],
        ["Email", record.email],
        ["Sujet", record.sujet ?? ""],
      ],
      record.message
    )
  );

  return NextResponse.json({ ok: true, persisted: true });
}
