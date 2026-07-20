import { getSiteSettingsFull } from "@/lib/settings-server";

/**
 * Vérifie un jeton Turnstile côté serveur.
 * - Si aucune clé secrète n'est configurée : la protection est considérée
 *   comme désactivée, on laisse passer (le site reste fonctionnel).
 * - Sinon, on valide le jeton auprès de Cloudflare.
 */
export async function verifyTurnstile(token: unknown): Promise<boolean> {
  const s = await getSiteSettingsFull();
  if (!s.turnstile_secret) return true; // protection non activée

  if (typeof token !== "string" || !token) return false;

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: s.turnstile_secret, response: token }),
    });
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
