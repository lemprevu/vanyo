-- ============================================================
--  VANYO — Activer/désactiver les emails de notification
--  Supabase → SQL Editor → New query → coller ce fichier → Run
-- ============================================================

-- Permet de couper les emails de notification (devis/messages) sans
-- avoir à effacer la config SMTP — utile pour mettre en pause les
-- alertes temporairement (vacances, etc.) sans tout reconfigurer après.
alter table public.site_settings add column if not exists notify_enabled boolean not null default true;

-- ============================================================
--  Fin. Le bouton apparaît dans /admin/parametres → Emails & SMTP.
-- ============================================================
