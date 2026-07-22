-- ============================================================
--  VANYO — Choix fin des événements notifiés par email
--  Supabase → SQL Editor → New query → coller ce fichier → Run
-- ============================================================

-- Sous-ensemble de {"devis","messages"} : permet de ne recevoir un email
-- que pour certains types d'événements plutôt que tout ou rien.
alter table public.site_settings add column if not exists notify_events text[] not null default '{devis,messages}';

-- ============================================================
--  Fin. Les cases à cocher apparaissent dans /admin/parametres →
--  Emails & SMTP, juste sous l'interrupteur principal.
-- ============================================================
