-- ============================================================
--  VANYO — Aperçu de projet généré par IA (outil interne)
--  À exécuter après devis-v3.sql.
--  Supabase → SQL Editor → New query → coller → Run
-- ============================================================

-- Image générée pour une demande, conservée pour ne pas la régénérer
-- (et la repayer) à chaque ouverture de la fiche. Stockée en data URL,
-- comme les autres images du panel.
alter table public.devis add column if not exists vision_image  text;
alter table public.devis add column if not exists vision_prompt text;

-- Clé d'API du service de génération d'image, et modèle utilisé.
-- Secrets : ils restent dans `site_settings` et ne sont JAMAIS exposés par
-- la vue publique `site_settings_public`.
alter table public.site_settings add column if not exists ai_image_key   text;
alter table public.site_settings add column if not exists ai_image_model text default 'gpt-image-1';

-- Après cette migration : rechargez le cache si besoin
-- (Supabase → Settings → API → « Reload schema »).
