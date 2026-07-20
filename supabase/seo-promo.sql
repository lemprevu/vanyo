-- ============================================================
--  VANYO — SEO approfondi + Codes promo
--  (à exécuter après settings-advanced.sql)
--  Supabase → SQL Editor → New query → coller → Run
-- ============================================================

-- --- SEO approfondi ---
alter table public.site_settings add column if not exists meta_description   text;
alter table public.site_settings add column if not exists og_image           text;
alter table public.site_settings add column if not exists twitter_handle     text;
alter table public.site_settings add column if not exists google_verification text;

-- On recrée la vue publique pour inclure les nouveaux champs SEO.
-- (DROP obligatoire : PostgreSQL n'autorise pas l'insertion de colonnes
--  au milieu d'une vue via CREATE OR REPLACE.)
drop view if exists public.site_settings_public;
create view public.site_settings_public as
select
  id, site_name, tagline, description, email, phone, address, hours,
  instagram, linkedin, twitter, dribbble,
  brand_color, font_family, home_sections,
  seo_keywords, og_title, og_description, search_visible,
  meta_description, og_image, twitter_handle, google_verification,
  ga_id, meta_pixel_id, turnstile_site_key
from public.site_settings;

grant select on public.site_settings_public to anon, authenticated;

-- ============================================================
--  Codes promo
-- ============================================================
create table if not exists public.promo_codes (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  code           text not null unique,
  description    text,
  discount_type  text not null default 'percent',  -- 'percent' | 'amount'
  discount_value numeric not null default 0,
  active         boolean not null default true,
  expires_at     date
);

alter table public.promo_codes enable row level security;

-- Lecture réservée aux admins (les codes ne doivent pas être énumérables
-- publiquement — la validation publique passe par une route serveur dédiée).
drop policy if exists "admins read promo" on public.promo_codes;
create policy "admins read promo" on public.promo_codes
  for select using (auth.role() = 'authenticated');

drop policy if exists "admins write promo" on public.promo_codes;
create policy "admins write promo" on public.promo_codes
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============================================================
--  Fin. Rechargez le cache si besoin (Settings → API → Reload schema).
-- ============================================================
