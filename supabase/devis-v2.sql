-- ============================================================
--  VANYO — Formulaire de devis v2 (formules, modules, mise en
--  ligne, maintenance et estimation automatique).
--  À exécuter après schema.sql et devis-extra.sql.
--  Supabase → SQL Editor → New query → coller → Run
-- ============================================================

-- Configuration chiffrée choisie par le client
alter table public.devis add column if not exists formule              text;    -- starter | business | premium | surmesure | conseillez_moi
alter table public.devis add column if not exists pages_total          int;
alter table public.devis add column if not exists modules              text[] default '{}';
alter table public.devis add column if not exists deploiement          text;    -- aucun | installation | installation_domaine | installation_domaine_emails
alter table public.devis add column if not exists maintenance          text;    -- aucune | essentiel | confort | serenite
alter table public.devis add column if not exists maintenance_options  text[] default '{}';
alter table public.devis add column if not exists delai                text default 'standard';

-- Estimation recalculée côté serveur au moment de la réception
alter table public.devis add column if not exists estimation           int;
alter table public.devis add column if not exists estimation_mensuelle int default 0;

-- Code promo éventuellement transmis depuis la page Tarifs
alter table public.devis add column if not exists promo                text;

-- Les anciennes colonnes (nombre_pages, fonctionnalites, options,
-- pages_supplementaires, nom_domaine, hebergement) sont conservées : les
-- demandes reçues avec la v1 restent lisibles et chiffrables dans le panel.

create index if not exists devis_formule_idx on public.devis (formule);

-- Après cette migration : rechargez le cache si besoin
-- (Supabase → Settings → API → « Reload schema »).
