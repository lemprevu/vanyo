-- ============================================================
--  VANYO — Contenu éditable (à exécuter APRÈS schema.sql)
--  Supabase → SQL Editor → New query → coller ce fichier → Run
--  Ajoute : réalisations, articles de blog, avis clients, tarifs.
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
--  Réalisations (portfolio)
-- ------------------------------------------------------------
create table if not exists public.realisations (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title      text not null,
  category   text not null,
  tags       text[] default '{}',
  color      text not null default 'from-vanyo-500/30 to-violet-hi/30',
  link       text,
  position   int not null default 0
);

-- ------------------------------------------------------------
--  Articles de blog
-- ------------------------------------------------------------
create table if not exists public.articles (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  slug          text not null unique,
  title         text not null,
  excerpt       text,
  content       text,
  category      text not null default 'Conseils',
  color         text not null default 'from-vanyo-500/40 to-violet-hi/30',
  reading_time  text not null default '5 min',
  published     boolean not null default true,
  published_at  date not null default current_date
);

-- ------------------------------------------------------------
--  Avis clients
-- ------------------------------------------------------------
create table if not exists public.avis (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name       text not null,
  company    text,
  rating     int not null default 5,
  quote      text not null,
  initials   text,
  featured   boolean not null default true,
  position   int not null default 0
);

-- ------------------------------------------------------------
--  Tarifs (packs)
-- ------------------------------------------------------------
create table if not exists public.plans (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  price       text not null,
  price_note  text default 'à partir de',
  description text,
  features    text[] default '{}',
  highlight   boolean not null default false,
  position    int not null default 0
);

-- ============================================================
--  Sécurité — lecture publique, écriture réservée aux admins
-- ============================================================
alter table public.realisations enable row level security;
alter table public.articles     enable row level security;
alter table public.avis         enable row level security;
alter table public.plans        enable row level security;

-- Lecture publique (le site affiche ce contenu à tout le monde)
drop policy if exists "public read realisations" on public.realisations;
create policy "public read realisations" on public.realisations for select using (true);

drop policy if exists "public read articles" on public.articles;
create policy "public read articles" on public.articles for select using (published = true);

drop policy if exists "public read avis" on public.avis;
create policy "public read avis" on public.avis for select using (true);

drop policy if exists "public read plans" on public.plans;
create policy "public read plans" on public.plans for select using (true);

-- Écriture réservée aux comptes connectés (admins)
drop policy if exists "admins write realisations" on public.realisations;
create policy "admins write realisations" on public.realisations for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "admins write articles" on public.articles;
create policy "admins write articles" on public.articles for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "admins write avis" on public.avis;
create policy "admins write avis" on public.avis for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "admins write plans" on public.plans;
create policy "admins write plans" on public.plans for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Les admins doivent aussi pouvoir LIRE les articles non publiés (brouillons)
drop policy if exists "admins read all articles" on public.articles;
create policy "admins read all articles" on public.articles for select
  using (auth.role() = 'authenticated');

-- ============================================================
--  Contenu de démarrage (identique à la vitrine par défaut)
-- ============================================================
insert into public.plans (name, price, price_note, description, features, highlight, position) values
  ('Starter', '690€', 'à partir de', 'Idéal pour lancer une présence en ligne soignée.',
   array['Site vitrine 1 à 3 pages','Design sur mesure','100% responsive','Formulaire de contact','SEO de base','Mise en ligne incluse'], false, 1),
  ('Business', '1 490€', 'à partir de', 'Le choix des entreprises qui veulent convertir.',
   array['Site 5 à 8 pages','Design premium & animations','SEO avancé','Blog / actualités','Panel administrateur','Nom de domaine + emails pro','Support 3 mois'], true, 2),
  ('Premium', '2 990€', 'à partir de', 'Pour un projet ambitieux et évolutif.',
   array['Site sur mesure illimité','E-commerce ou espace client','Animations avancées','SEO complet + suivi','Panel admin complet','Hébergement premium 1 an','Support prioritaire 12 mois'], false, 3),
  ('Sur Mesure', 'Sur devis', '', 'Application web, plateforme ou besoin spécifique.',
   array['Cahier des charges dédié','Fonctionnalités avancées','Intégrations & API','Équipe dédiée','Accompagnement long terme'], false, 4)
on conflict do nothing;

-- ============================================================
--  Fin. Les modules Réalisations / Blog / Avis / Tarifs du panel
--  admin lisent et écrivent désormais dans ces tables.
-- ============================================================
