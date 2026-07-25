-- ============================================================
--  VANYO — Devis v3 : multi-sélection, remises, et catalogue
--  tarifaire modifiable depuis le panel admin.
--  À exécuter après devis-v2.sql.
--  Supabase → SQL Editor → New query → coller → Run
-- ============================================================

-- Multi-sélection : un projet peut relever de plusieurs types / objectifs
alter table public.devis add column if not exists types_site  text[] default '{}';
alter table public.devis add column if not exists objectifs   text[] default '{}';

-- Remise appliquée au moment de l'envoi (promo globale ou code)
alter table public.devis add column if not exists remise_percent int default 0;
alter table public.devis add column if not exists remise_label   text;

-- Reprise des anciennes valeurs mono-valeur vers les nouvelles listes,
-- pour que les demandes déjà reçues restent exploitables telles quelles.
update public.devis
   set types_site = array[type_site]
 where type_site is not null
   and (types_site is null or cardinality(types_site) = 0);

update public.devis
   set objectifs = array[objectif]
 where objectif is not null
   and (objectifs is null or cardinality(objectifs) = 0);

-- ------------------------------------------------------------
--  Tarifs modifiables depuis Paramètres → Tarifs
--  Ne contient que les ÉCARTS au catalogue par défaut : un champ
--  absent garde sa valeur d'origine, et une évolution du catalogue
--  par défaut profite automatiquement aux champs non personnalisés.
-- ------------------------------------------------------------
alter table public.site_settings add column if not exists catalog jsonb default '{}'::jsonb;

-- La vue publique doit exposer le catalogue (aucun secret dedans) pour que
-- /tarifs et le formulaire de devis affichent bien vos prix personnalisés.
-- Reprise à l'identique de promo-global.sql, avec `catalog` en plus.
drop view if exists public.site_settings_public;
create view public.site_settings_public as
select
  id, site_name, tagline, description, email, phone, address, hours,
  instagram, linkedin, twitter, dribbble,
  brand_color, font_family, home_sections,
  seo_keywords, og_title, og_description, search_visible,
  meta_description, og_image, twitter_handle, google_verification,
  ga_id, meta_pixel_id, turnstile_site_key,
  promo_active, promo_label, promo_percent, promo_expires_at,
  catalog
from public.site_settings;

grant select on public.site_settings_public to anon, authenticated;

-- Après cette migration : rechargez le cache si besoin
-- (Supabase → Settings → API → « Reload schema »).
