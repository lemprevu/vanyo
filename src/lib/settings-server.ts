import { createServiceClient } from "@/lib/supabase/server";
import { SETTINGS_FALLBACK } from "@/lib/data";
import type { SiteSettingsFull } from "@/lib/types";

/**
 * Réglages COMPLETS (avec secrets SMTP / Turnstile).
 * Réservé au serveur : n'importe jamais ça dans un composant client.
 * Utilise la clé service_role pour pouvoir lire depuis les routes
 * publiques (envoi d'email de notification) qui n'ont pas de session.
 */
export async function getSiteSettingsFull(): Promise<SiteSettingsFull> {
  const fallback: SiteSettingsFull = {
    ...SETTINGS_FALLBACK,
    turnstile_secret: null,
    smtp_host: null,
    smtp_port: 587,
    smtp_user: null,
    smtp_password: null,
    smtp_from: null,
    notify_email: null,
    notify_enabled: true,
    notify_events: ["devis", "messages"],
    pagespeed_api_key: null,
  };

  const supabase = createServiceClient();
  if (!supabase) return fallback;

  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (!data) return fallback;
  return { ...fallback, ...(data as Partial<SiteSettingsFull>) } as SiteSettingsFull;
}
