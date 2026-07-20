-- ============================================================
--  VANYO — Champs supplémentaires du formulaire de devis
--  (à exécuter après schema.sql)
--  Supabase → SQL Editor → New query → coller → Run
-- ============================================================

-- Questionnaire "Style & contenu"
alter table public.devis add column if not exists objectif           text;
alter table public.devis add column if not exists style_visuel       text;
alter table public.devis add column if not exists ambiance           text;
alter table public.devis add column if not exists couleurs_souhaitees text;
alter table public.devis add column if not exists inspirations       text;
alter table public.devis add column if not exists concurrents        text;
alter table public.devis add column if not exists public_cible       text;
alter table public.devis add column if not exists contenu_type       text;
alter table public.devis add column if not exists langues            text;
alter table public.devis add column if not exists a_des_photos       text;

-- Options payantes supplémentaires
alter table public.devis add column if not exists options               text[] default '{}';
alter table public.devis add column if not exists pages_supplementaires int    default 0;

-- Après cette migration : rechargez le cache si besoin
-- (Supabase → Settings → API → « Reload schema »).
