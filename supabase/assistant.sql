-- ============================================================
--  VANYO — Apprentissage de l'assistant
--  Supabase → SQL Editor → New query → coller ce fichier → Run
-- ============================================================
--
--  Deux tables, une boucle :
--
--  1. `assistant_questions` enregistre CE QUE LES VISITEURS DEMANDENT et si
--     l'assistant a su répondre. C'est le seul moyen de savoir ce qu'il rate :
--     personne ne peut surveiller ça à la main.
--
--  2. `assistant_lessons` contient les corrections. Une phrase mal comprise
--     y est rattachée à la bonne intention, et l'assistant l'applique dès la
--     question suivante — sans redéploiement, sans toucher au code.
--
--  Les deux sont consultables dans /admin/assistant.
-- ============================================================

/* ------------------------------------------------------------------ */
/*  1. Journal des questions                                           */
/* ------------------------------------------------------------------ */

create table if not exists public.assistant_questions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- La question telle qu'elle a été écrite, et sa forme normalisée
  -- (minuscules, sans accents, langage SMS traduit) qui sert au regroupement.
  question text not null,
  normalized text not null,

  -- Ce que le moteur en a compris.
  intent text,
  confidence real,

  -- Comment la réponse a été trouvée :
  --   'intention' : une réponse dédiée, le cas nominal ;
  --   'entretien' : une étape de la qualification ;
  --   'recherche' : repli sur la base documentaire, réponse correcte mais générique ;
  --   'echec'     : l'assistant a dit qu'il ne savait pas.
  source text not null,

  -- Page depuis laquelle la question a été posée.
  page text
);

comment on table public.assistant_questions is
  'Journal des questions posées à l''assistant. Sert à repérer ce qu''il ne comprend pas.';

create index if not exists assistant_questions_created_idx
  on public.assistant_questions (created_at desc);

-- L'index qui compte : retrouver instantanément les échecs à corriger.
create index if not exists assistant_questions_source_idx
  on public.assistant_questions (source, created_at desc);

create index if not exists assistant_questions_normalized_idx
  on public.assistant_questions (normalized);

/* ------------------------------------------------------------------ */
/*  2. Corrections apprises                                            */
/* ------------------------------------------------------------------ */

create table if not exists public.assistant_lessons (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- La formulation à reconnaître, sous forme normalisée.
  phrase text not null unique,
  -- L'intention vers laquelle l'envoyer (voir Intent dans src/lib/ai/nlu.ts).
  intent text not null,

  -- Désactiver une correction sans la perdre, le temps de vérifier.
  active boolean not null default true,

  -- Combien de fois elle a servi : une correction jamais déclenchée est
  -- probablement mal formulée.
  hits integer not null default 0
);

comment on table public.assistant_lessons is
  'Corrections apprises : une formulation mal comprise rattachée à la bonne intention.';

create index if not exists assistant_lessons_active_idx
  on public.assistant_lessons (active);

/* ------------------------------------------------------------------ */
/*  3. Vue de regroupement                                             */
/* ------------------------------------------------------------------ */

-- Les questions regroupées par formulation, les plus fréquentes d'abord.
-- Une même question posée quinze fois compte quinze fois plus qu'une
-- curiosité isolée : c'est elle qu'il faut corriger en premier.
create or replace view public.assistant_questions_grouped as
select
  normalized,
  min(question)          as exemple,
  count(*)::int          as total,
  max(created_at)        as derniere_fois,
  mode() within group (order by source) as source_dominante,
  mode() within group (order by intent) as intent_dominante,
  avg(confidence)::real  as confiance_moyenne
from public.assistant_questions
group by normalized;

comment on view public.assistant_questions_grouped is
  'Questions regroupées par formulation, avec leur fréquence.';

/* ------------------------------------------------------------------ */
/*  4. Accès                                                           */
/* ------------------------------------------------------------------ */

-- L'écriture se fait exclusivement depuis la route serveur, avec la clé de
-- service ; la lecture est réservée au panel. Aucun accès public : ces tables
-- contiennent ce que les visiteurs ont tapé.
alter table public.assistant_questions enable row level security;
alter table public.assistant_lessons enable row level security;

drop policy if exists "assistant_questions_admin_read" on public.assistant_questions;
create policy "assistant_questions_admin_read"
  on public.assistant_questions for select
  to authenticated using (true);

drop policy if exists "assistant_lessons_admin_all" on public.assistant_lessons;
create policy "assistant_lessons_admin_all"
  on public.assistant_lessons for all
  to authenticated using (true) with check (true);

/* ------------------------------------------------------------------ */
/*  5. Compteur d'usage des corrections                                */
/* ------------------------------------------------------------------ */

-- Une correction qui ne se déclenche jamais est probablement mal formulée.
-- Ce compteur permet de le repérer depuis le panel.
create or replace function public.increment_lesson_hit(p_phrase text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.assistant_lessons
     set hits = hits + 1
   where phrase = p_phrase;
$$;

-- ============================================================
--  Fin. La rubrique « Assistant IA » apparaît dans le panel admin.
-- ============================================================
