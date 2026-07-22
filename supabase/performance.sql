-- ============================================================
--  VANYO — Section Performance & SEO du panel admin
--  Supabase → SQL Editor → New query → coller ce fichier → Run
-- ============================================================

-- Clé API PageSpeed Insights (Google Cloud), optionnelle et gratuite.
-- Sans elle, la section Performance affiche un contrôle technique
-- basé sur le site lui-même (sitemap, robots.txt, HTTPS...) mais pas
-- de vrai score Core Web Vitals — l'API publique sans clé est trop
-- vite limitée (429) pour un usage répété depuis le panel.
alter table public.site_settings add column if not exists pagespeed_api_key text;

-- Ce champ contient un secret : il ne doit jamais être exposé par la
-- vue publique utilisée par le site vitrine.
-- (site_settings_public, définie dans settings-advanced.sql, ne liste
--  pas ce champ — rien à faire si vous l'avez déjà exécutée telle quelle.)

-- ============================================================
--  Fin. Renseignez la clé dans /admin/parametres → Intégrations.
-- ============================================================
