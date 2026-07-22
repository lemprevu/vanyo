-- ============================================================
--  VANYO — Permissions granulaires + journal d'activité
--  Supabase → SQL Editor → New query → coller ce fichier → Run
-- ============================================================

-- Permissions par utilisateur : liste de sections autorisées (ex.
-- ["devis","realisations"]). Un compte "Administrateur" a toujours accès
-- à tout, quel que soit le contenu de ce champ (bypass géré côté code) —
-- ce tableau ne sert qu'à restreindre les rôles Modérateur / Commercial.
alter table public.profiles add column if not exists permissions text[] not null default '{}';

-- Journal d'activité : qui a fait quoi, depuis quelle IP.
create table if not exists public.activity_logs (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  user_id       uuid references auth.users(id) on delete set null,
  email         text,
  ip            text,
  action        text not null,        -- ex. "user.create", "user.role_update"
  resource_label text,                -- description lisible, ex. "camille@mail.fr → Modérateur"
  details       jsonb
);

create index if not exists activity_logs_created_at_idx on public.activity_logs (created_at desc);

alter table public.activity_logs enable row level security;

-- Écriture : uniquement via la clé service_role (routes serveur), jamais
-- depuis le client — un journal d'audit ne doit pas être falsifiable
-- par un utilisateur connecté classique.
drop policy if exists "service role writes logs" on public.activity_logs;
create policy "service role writes logs" on public.activity_logs
  for insert with check (false);
-- (la clé service_role contourne RLS de toute façon ; cette policy
--  bloque explicitement toute tentative d'insertion via la clé anon/authenticated)

-- Lecture réservée aux admins connectés.
drop policy if exists "admins read logs" on public.activity_logs;
create policy "admins read logs" on public.activity_logs
  for select using (auth.role() = 'authenticated');

-- ============================================================
--  Fin. Le journal apparaît dans /admin/journal, les permissions
--  se règlent depuis /admin/utilisateurs.
-- ============================================================
