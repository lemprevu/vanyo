import nodemailer from "nodemailer";
import { getSiteSettingsFull } from "@/lib/settings-server";

/**
 * Envoie un email de notification via le SMTP configuré dans l'admin
 * (Paramètres → Emails & SMTP). Silencieux si le SMTP n'est pas
 * configuré : la réception du devis/message ne doit jamais échouer
 * juste parce que l'email ne part pas.
 */
export async function sendNotification(subject: string, html: string, options?: { bypassToggle?: boolean }) {
  try {
    const s = await getSiteSettingsFull();
    if (!s.notify_enabled && !options?.bypassToggle) {
      return { sent: false, reason: "notifications-disabled" };
    }
    if (!s.smtp_host || !s.smtp_user || !s.smtp_password) {
      return { sent: false, reason: "smtp-not-configured" };
    }

    const transporter = nodemailer.createTransport({
      host: s.smtp_host,
      port: s.smtp_port ?? 587,
      secure: (s.smtp_port ?? 587) === 465, // 465 = SSL, sinon STARTTLS
      auth: { user: s.smtp_user, pass: s.smtp_password },
    });

    const to = s.notify_email || s.email;
    const from = s.smtp_from || s.smtp_user;

    await transporter.sendMail({ from, to, subject, html });
    return { sent: true };
  } catch (err) {
    console.error("[mailer] Échec envoi:", err instanceof Error ? err.message : err);
    return { sent: false, reason: "error" };
  }
}

/** Gabarit d'email simple aux couleurs Vanyo. */
export function emailTemplate(title: string, rows: [string, string][], extra?: string) {
  const cells = rows
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px;color:#6b7280;font-size:13px;white-space:nowrap;">${k}</td><td style="padding:6px 12px;color:#111827;font-size:13px;">${v}</td></tr>`
    )
    .join("");
  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;">
    <div style="background:linear-gradient(120deg,#6D4AFF,#A855F7);padding:20px 24px;border-radius:12px 12px 0 0;">
      <span style="color:#fff;font-size:18px;font-weight:bold;">Vanyo</span>
    </div>
    <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:24px;">
      <h2 style="margin:0 0 16px;font-size:18px;color:#111827;">${title}</h2>
      <table style="border-collapse:collapse;width:100%;">${cells}</table>
      ${extra ? `<div style="margin-top:16px;padding-top:16px;border-top:1px solid #e5e7eb;color:#374151;font-size:13px;line-height:1.6;">${extra}</div>` : ""}
    </div>
  </div>`;
}
