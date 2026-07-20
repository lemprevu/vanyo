import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase côté navigateur (composants clients / admin).
 * Retourne null si les variables d'environnement ne sont pas configurées,
 * afin que le site fonctionne même avant le branchement de Supabase.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}

export const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
