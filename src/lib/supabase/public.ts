import { createClient as createRawClient } from "@supabase/supabase-js";

/**
 * Client Supabase « public » pour les lectures anonymes en lecture seule
 * (réalisations, articles, avis, tarifs, paramètres du site).
 *
 * Volontairement séparé du client serveur lié aux cookies de session
 * (`./server.ts`) : lire `cookies()` force Next.js à rendre la page de
 * façon dynamique à CHAQUE requête, ce qui tue le cache/ISR et rend tout
 * le site public lent. Ce client n'a aucune dépendance aux cookies, donc
 * ces pages restent statiques/ISR (`revalidate`) comme prévu.
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createRawClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
