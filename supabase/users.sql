-- ============================================================
--  VANYO — Gestion des utilisateurs admin (à exécuter après schema.sql)
--  Supabase → SQL Editor → New query → coller ce fichier → Run
-- ============================================================

-- Les admins doivent pouvoir lire tous les profils (pas seulement le leur)
-- pour afficher la liste dans /admin/utilisateurs.
drop policy if exists "read own profile" on public.profiles;
drop policy if exists "admins read all profiles" on public.profiles;
create policy "admins read all profiles" on public.profiles
  for select using (auth.role() = 'authenticated');

-- Un admin peut modifier le rôle d'un profil (le sien ou celui d'un autre).
drop policy if exists "admins update profiles" on public.profiles;
create policy "admins update profiles" on public.profiles
  for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============================================================
--  Fin. La page /admin/utilisateurs peut désormais lister,
--  créer, modifier le rôle et supprimer des comptes admin.
-- ============================================================
