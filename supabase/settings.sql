-- ============================================================
--  VANYO — Paramètres généraux du site (à exécuter après content.sql)
--  Supabase → SQL Editor → New query → coller ce fichier → Run
-- ============================================================

create extension if not exists "pgcrypto";

create table if not exists public.site_settings (
  id           int primary key default 1,
  site_name    text not null default 'Vanyo',
  tagline      text not null default 'Agence web premium',
  description  text,
  email        text not null default 'contact@vanyo.fr',
  phone        text not null default '+33 6 00 00 00 00',
  address      text not null default '12 rue de l''Innovation, 75008 Paris',
  hours        text not null default 'Lun – Ven · 9h – 19h',
  instagram    text default 'https://instagram.com',
  linkedin     text default 'https://linkedin.com',
  twitter      text default 'https://x.com',
  dribbble     text default 'https://dribbble.com',
  updated_at   timestamptz not null default now(),
  constraint single_row check (id = 1)
);

insert into public.site_settings (id) values (1) on conflict (id) do nothing;

alter table public.site_settings enable row level security;

drop policy if exists "public read settings" on public.site_settings;
create policy "public read settings" on public.site_settings for select using (true);

drop policy if exists "admins update settings" on public.site_settings;
create policy "admins update settings" on public.site_settings for update
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============================================================
--  Fin. Le module « Général » du panel admin (/admin/parametres)
--  lit et écrit désormais dans cette table.
-- ============================================================
