-- ============================================================
--  VANYO — Réglages avancés (à exécuter après settings.sql)
--  Supabase → SQL Editor → New query → coller ce fichier → Run
--  Ajoute Apparence, SEO, Intégrations, SMTP, Sécurité.
-- ============================================================

-- --- Apparence ---
alter table public.site_settings add column if not exists brand_color   text    not null default '#6D4AFF';
alter table public.site_settings add column if not exists font_family    text    not null default 'Geist';
alter table public.site_settings add column if not exists home_sections  jsonb   not null default
  '["stats","logos","services","why","process","realisations","pricing","testimonials","faq"]'::jsonb;

-- --- SEO ---
alter table public.site_settings add column if not exists seo_keywords   text;
alter table public.site_settings add column if not exists og_title       text;
alter table public.site_settings add column if not exists og_description text;
alter table public.site_settings add column if not exists search_visible boolean not null default true;

-- --- Intégrations analytics ---
alter table public.site_settings add column if not exists ga_id          text;   -- G-XXXXXXX
alter table public.site_settings add column if not exists meta_pixel_id  text;

-- --- Cloudflare Turnstile (anti-spam) ---
alter table public.site_settings add column if not exists turnstile_site_key text;
-- La clé secrète Turnstile n'est JAMAIS exposée au public : colonne dédiée
-- lue uniquement côté serveur (voir la vue publique plus bas).
alter table public.site_settings add column if not exists turnstile_secret   text;

-- --- SMTP (envoi d'emails de notification) ---
alter table public.site_settings add column if not exists smtp_host     text;
alter table public.site_settings add column if not exists smtp_port     int    default 587;
alter table public.site_settings add column if not exists smtp_user     text;
alter table public.site_settings add column if not exists smtp_password text;
alter table public.site_settings add column if not exists smtp_from     text;
alter table public.site_settings add column if not exists notify_email  text;  -- où recevoir les alertes

-- ============================================================
--  Sécurité : on empêche les secrets (SMTP, Turnstile secret)
--  d'être lisibles par la clé publique anon.
--  On expose une VUE publique ne contenant QUE les champs sûrs.
-- ============================================================
create or replace view public.site_settings_public as
select
  id, site_name, tagline, description, email, phone, address, hours,
  instagram, linkedin, twitter, dribbble,
  brand_color, font_family, home_sections,
  seo_keywords, og_title, og_description, search_visible,
  ga_id, meta_pixel_id, turnstile_site_key
from public.site_settings;

grant select on public.site_settings_public to anon, authenticated;

-- La table complète (avec secrets) reste réservée aux admins connectés
-- pour la lecture ; l'écriture aussi (policies déjà créées dans settings.sql).
drop policy if exists "public read settings" on public.site_settings;
create policy "admins read settings" on public.site_settings
  for select using (auth.role() = 'authenticated');

-- ============================================================
--  Fin. La page /admin/parametres pilote désormais tous ces réglages.
-- ============================================================
