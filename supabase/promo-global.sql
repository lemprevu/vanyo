-- ============================================================
--  VANYO — Prix barré par pack + Promo globale automatique
--  (à exécuter après seo-promo.sql)
--  Supabase → SQL Editor → New query → coller → Run
-- ============================================================

-- Prix "conseillé" (barré) sur chaque pack. Si renseigné et supérieur
-- au prix affiché, le site montre automatiquement le prix barré + le
-- pourcentage de réduction calculé.
alter table public.plans add column if not exists original_price text;

-- Promo automatique appliquée à TOUT LE MONDE, sans code à saisir.
alter table public.site_settings add column if not exists promo_active       boolean not null default false;
alter table public.site_settings add column if not exists promo_label       text    default 'Offre limitée';
alter table public.site_settings add column if not exists promo_percent     numeric default 10;
alter table public.site_settings add column if not exists promo_expires_at  date;

-- On recrée la vue publique pour inclure les champs de promo globale.
drop view if exists public.site_settings_public;
create view public.site_settings_public as
select
  id, site_name, tagline, description, email, phone, address, hours,
  instagram, linkedin, twitter, dribbble,
  brand_color, font_family, home_sections,
  seo_keywords, og_title, og_description, search_visible,
  meta_description, og_image, twitter_handle, google_verification,
  ga_id, meta_pixel_id, turnstile_site_key,
  promo_active, promo_label, promo_percent, promo_expires_at
from public.site_settings;

grant select on public.site_settings_public to anon, authenticated;

-- ============================================================
--  Fin. Rechargez le cache si besoin (Settings → API → Reload schema).
-- ============================================================
