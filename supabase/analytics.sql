-- ============================================================
--  VANYO — Analyse de trafic maison (page vues + provenance)
--  Supabase → SQL Editor → New query → coller ce fichier → Run
-- ============================================================

create table if not exists public.page_views (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  path         text not null,
  referrer     text,          -- URL complète de provenance (vide si accès direct)
  source       text,          -- domaine simplifié : "google.com", "instagram.com", "direct"...
  device       text            -- "mobile" | "desktop"
);

-- Index pour les agrégations du panel admin (par période, par page).
create index if not exists page_views_created_at_idx on public.page_views (created_at desc);
create index if not exists page_views_path_idx on public.page_views (path);

alter table public.page_views enable row level security;

-- Écriture publique : n'importe quel visiteur doit pouvoir enregistrer sa
-- propre vue de page (c'est le principe même d'un compteur de trafic).
-- Aucune donnée personnelle n'est stockée (pas d'IP, pas d'identifiant).
drop policy if exists "public insert page views" on public.page_views;
create policy "public insert page views" on public.page_views
  for insert with check (true);

-- Lecture réservée aux admins connectés (le détail du trafic ne doit pas
-- être public).
drop policy if exists "admins read page views" on public.page_views;
create policy "admins read page views" on public.page_views
  for select using (auth.role() = 'authenticated');

-- Nettoyage automatique au-delà de 12 mois, pour ne pas faire grossir la
-- table indéfiniment (à exécuter manuellement ou via un cron Supabase si besoin) :
-- delete from public.page_views where created_at < now() - interval '12 months';

-- ============================================================
--  Fin. La page /admin/performance affiche désormais le trafic réel.
-- ============================================================
