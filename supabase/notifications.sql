-- ============================================================
--  VANYO — Suivi des notifications lues (à exécuter après schema.sql)
--  Supabase → SQL Editor → New query → coller ce fichier → Run
-- ============================================================

alter table public.devis
  add column if not exists viewed boolean not null default false;

create index if not exists devis_viewed_idx on public.devis (viewed);

-- ============================================================
--  Fin. Les demandes de devis consultées dans /admin disparaissent
--  automatiquement du centre de notifications.
-- ============================================================
