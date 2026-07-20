-- ============================================================
--  VANYO — Schéma Supabase (PostgreSQL)
--  À exécuter dans : Supabase → SQL Editor → New query → Run
-- ============================================================

-- Extension pour générer des UUID
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
--  Table : demandes de devis
-- ------------------------------------------------------------
create table if not exists public.devis (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  status           text not null default 'Nouveau',
  nom              text not null,
  prenom           text not null,
  entreprise       text,
  email            text not null,
  telephone        text,
  adresse          text,
  ville            text,
  code_postal      text,
  pays             text,
  type_site        text,
  nombre_pages     text,
  site_existant    text,
  lien_actuel      text,
  nom_domaine      text,
  hebergement      text,
  logo             text,
  charte_graphique text,
  fonctionnalites  text[] default '{}',
  budget           text,
  date_souhaitee   text,
  description       text,
  note_interne     text,
  assigned_to      text,
  rgpd             boolean not null default false,
  ip               text
);

create index if not exists devis_status_idx     on public.devis (status);
create index if not exists devis_created_at_idx  on public.devis (created_at desc);

-- ------------------------------------------------------------
--  Table : messages de contact
-- ------------------------------------------------------------
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nom        text not null,
  email      text not null,
  sujet      text,
  message    text not null,
  lu         boolean not null default false,
  ip         text
);

create index if not exists messages_created_at_idx on public.messages (created_at desc);

-- ------------------------------------------------------------
--  Table : profils administrateurs (rôles)
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  role       text not null default 'Administrateur', -- Administrateur | Modérateur | Commercial
  created_at timestamptz not null default now()
);

-- Crée automatiquement un profil à l'inscription d'un utilisateur
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
--  Table : journal des connexions
-- ------------------------------------------------------------
create table if not exists public.connexions (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_email text,
  ip         text,
  user_agent text
);

-- ============================================================
--  Sécurité — Row Level Security (RLS)
-- ============================================================
alter table public.devis      enable row level security;
alter table public.messages   enable row level security;
alter table public.profiles   enable row level security;
alter table public.connexions enable row level security;

-- Insertion publique (formulaires) uniquement via la clé "service role"
-- côté serveur : on ne crée donc PAS de policy d'insert pour anon.
-- Les utilisateurs authentifiés (admins) ont un accès complet.

create policy "admins read devis"    on public.devis      for select using (auth.role() = 'authenticated');
create policy "admins update devis"  on public.devis      for update using (auth.role() = 'authenticated');
create policy "admins delete devis"  on public.devis      for delete using (auth.role() = 'authenticated');

create policy "admins read messages"   on public.messages for select using (auth.role() = 'authenticated');
create policy "admins update messages" on public.messages for update using (auth.role() = 'authenticated');
create policy "admins delete messages" on public.messages for delete using (auth.role() = 'authenticated');

create policy "read own profile" on public.profiles for select using (auth.uid() = id);

create policy "admins read connexions" on public.connexions for select using (auth.role() = 'authenticated');

-- ============================================================
--  Fin. Pensez à créer un utilisateur admin :
--  Supabase → Authentication → Users → Add user
--  (email + mot de passe). Il pourra se connecter sur /admin.
-- ============================================================
