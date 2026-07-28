import { Brain, TriangleAlert, Search, Check, X, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { INTENT_LABELS } from "@/lib/ai/intents";
import { saveLesson, toggleLesson, deleteLesson } from "./actions";

export const dynamic = "force-dynamic";

/**
 * Panel « Assistant IA » — la boucle d'amélioration.
 *
 * L'assistant note lui-même chaque question et la façon dont il y a répondu.
 * Cette page remonte ce qu'il a raté, les plus fréquentes d'abord, et permet
 * de corriger d'un geste : on choisit la bonne rubrique, et la formulation
 * est reconnue dès la question suivante — sans redéploiement.
 */

type Groupe = {
  normalized: string;
  exemple: string;
  total: number;
  derniere_fois: string;
  source_dominante: string | null;
  intent_dominante: string | null;
  confiance_moyenne: number | null;
};

type Lecon = {
  id: string;
  phrase: string;
  intent: string;
  active: boolean;
  hits: number;
};

const SOURCE_LABELS: Record<string, { label: string; classe: string }> = {
  intention: { label: "Comprise", classe: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40" },
  entretien: { label: "Entretien", classe: "bg-sky-500/15 text-sky-300 border-sky-500/40" },
  recherche: { label: "Réponse générique", classe: "bg-amber-500/15 text-amber-300 border-amber-500/40" },
  echec: { label: "Pas comprise", classe: "bg-rose-500/15 text-rose-300 border-rose-500/40" },
};

function quand(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default async function AssistantPage() {
  const supabase = await createClient();

  if (!supabase) {
    return (
      <Coquille>
        <Message titre="Supabase n'est pas configuré">
          L&apos;assistant fonctionne, mais il ne peut rien enregistrer. Renseignez les clés Supabase
          pour activer le suivi.
        </Message>
      </Coquille>
    );
  }

  const [{ data: groupesData, error: erreurGroupes }, { data: leconsData }] = await Promise.all([
    supabase
      .from("assistant_questions_grouped")
      .select("*")
      .order("total", { ascending: false })
      .limit(200),
    supabase.from("assistant_lessons").select("*").order("created_at", { ascending: false }).limit(200),
  ]);

  if (erreurGroupes) {
    return (
      <Coquille>
        <Message titre="La migration n'a pas encore été exécutée">
          Ouvrez Supabase → SQL Editor et exécutez le fichier{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-[13px]">supabase/assistant.sql</code>.
          Tant qu&apos;il n&apos;est pas passé, l&apos;assistant répond normalement mais n&apos;enregistre rien.
        </Message>
      </Coquille>
    );
  }

  const groupes = (groupesData ?? []) as Groupe[];
  const lecons = (leconsData ?? []) as Lecon[];

  // Ce qui mérite une correction : les questions non comprises, et celles qui
  // n'ont eu qu'une réponse générique tirée de la base documentaire.
  const aCorriger = groupes.filter(
    (g) => g.source_dominante === "echec" || g.source_dominante === "recherche",
  );
  const comprises = groupes.filter(
    (g) => g.source_dominante === "intention" || g.source_dominante === "entretien",
  );

  const totalQuestions = groupes.reduce((s, g) => s + g.total, 0);
  const totalRatees = aCorriger.reduce((s, g) => s + g.total, 0);
  const tauxCompris = totalQuestions > 0 ? Math.round(((totalQuestions - totalRatees) / totalQuestions) * 100) : null;

  return (
    <Coquille>
      {/* Indicateurs */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Carte valeur={String(totalQuestions)} libelle="Questions posées" />
        <Carte
          valeur={tauxCompris === null ? "—" : `${tauxCompris} %`}
          libelle="Comprises directement"
          accent={tauxCompris !== null && tauxCompris < 70}
        />
        <Carte valeur={String(lecons.filter((l) => l.active).length)} libelle="Corrections actives" />
      </div>

      {totalQuestions === 0 && (
        <Message titre="Aucune question pour l'instant">
          Dès qu&apos;un visiteur écrira à l&apos;assistant, ses questions apparaîtront ici — et celles
          qu&apos;il n&apos;a pas comprises remonteront en haut, prêtes à corriger.
        </Message>
      )}

      {/* À corriger */}
      {aCorriger.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
            <TriangleAlert className="h-4 w-4 text-amber-300" />
            À corriger
            <span className="text-xs font-normal text-white/40">
              — les plus fréquentes d&apos;abord
            </span>
          </h2>

          <div className="space-y-2">
            {aCorriger.slice(0, 40).map((g) => (
              <form
                key={g.normalized}
                action={saveLesson}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
              >
                <input type="hidden" name="phrase" value={g.normalized} />

                <div className="flex flex-wrap items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-sm text-white/85">
                    « {g.exemple} »
                  </span>
                  <Etiquette source={g.source_dominante} />
                  <span className="shrink-0 text-[11px] text-white/40">
                    {g.total} fois · {quand(g.derniere_fois)}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <select
                    name="intent"
                    defaultValue=""
                    required
                    className="min-w-0 flex-1 rounded-lg border border-white/12 bg-ink-card px-2.5 py-1.5 text-[13px] text-white focus:border-vanyo-500/50 focus:outline-none"
                  >
                    <option value="" disabled>
                      Cette question parle de…
                    </option>
                    {Object.entries(INTENT_LABELS).map(([cle, libelle]) => (
                      <option key={cle} value={cle}>
                        {libelle}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="shrink-0 rounded-lg border border-vanyo-500/40 bg-vanyo-500/20 px-3 py-1.5 text-[13px] text-white transition hover:bg-vanyo-500/30"
                  >
                    Apprendre
                  </button>
                </div>
              </form>
            ))}
          </div>
        </section>
      )}

      {/* Corrections en place */}
      {lecons.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Brain className="h-4 w-4 text-vanyo-300" />
            Corrections apprises
          </h2>

          <div className="space-y-1.5">
            {lecons.map((l) => (
              <div
                key={l.id}
                className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2"
              >
                <span className={`min-w-0 flex-1 truncate text-[13px] ${l.active ? "text-white/85" : "text-white/35 line-through"}`}>
                  « {l.phrase} »
                </span>
                <span className="shrink-0 rounded-full border border-white/12 bg-white/5 px-2 py-0.5 text-[11px] text-white/60">
                  {INTENT_LABELS[l.intent] ?? l.intent}
                </span>
                <span className="shrink-0 text-[11px] text-white/35" title="Nombre de fois où elle a servi">
                  {l.hits} ×
                </span>

                <form action={toggleLesson} className="shrink-0">
                  <input type="hidden" name="id" value={l.id} />
                  <input type="hidden" name="active" value={String(l.active)} />
                  <button
                    type="submit"
                    aria-label={l.active ? "Désactiver" : "Réactiver"}
                    title={l.active ? "Désactiver" : "Réactiver"}
                    className="rounded-lg p-1.5 text-white/45 transition hover:bg-white/10 hover:text-white"
                  >
                    {l.active ? <X className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                  </button>
                </form>

                <form action={deleteLesson} className="shrink-0">
                  <input type="hidden" name="id" value={l.id} />
                  <button
                    type="submit"
                    aria-label="Supprimer"
                    title="Supprimer"
                    className="rounded-lg p-1.5 text-white/45 transition hover:bg-rose-500/15 hover:text-rose-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Questions bien traitées */}
      {comprises.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Search className="h-4 w-4 text-emerald-300" />
            Questions bien traitées
            <span className="text-xs font-normal text-white/40">— rien à faire</span>
          </h2>

          <div className="space-y-1">
            {comprises.slice(0, 30).map((g) => (
              <div
                key={g.normalized}
                className="flex flex-wrap items-center gap-2 rounded-lg px-3 py-1.5 text-[13px]"
              >
                <span className="min-w-0 flex-1 truncate text-white/60">« {g.exemple} »</span>
                <Etiquette source={g.source_dominante} />
                <span className="shrink-0 text-[11px] text-white/30">{g.total} fois</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </Coquille>
  );
}

/* ------------------------------------------------------------------ */
/*  Présentation                                                       */
/* ------------------------------------------------------------------ */

function Coquille({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-xl font-semibold text-white">
          <Brain className="h-5 w-5 text-vanyo-300" />
          Assistant IA
        </h1>
        <p className="mt-1 text-sm text-white/50">
          L&apos;assistant note lui-même ce qu&apos;il ne comprend pas. Choisissez la bonne rubrique et
          il retiendra la formulation dès la question suivante.
        </p>
      </header>
      {children}
    </div>
  );
}

function Carte({ valeur, libelle, accent }: { valeur: string; libelle: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className={`text-2xl font-semibold ${accent ? "text-amber-300" : "text-white"}`}>{valeur}</p>
      <p className="mt-0.5 text-xs text-white/45">{libelle}</p>
    </div>
  );
}

function Etiquette({ source }: { source: string | null }) {
  const s = SOURCE_LABELS[source ?? ""] ?? SOURCE_LABELS.echec;
  return (
    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] ${s.classe}`}>{s.label}</span>
  );
}

function Message({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-sm font-medium text-white">{titre}</p>
      <p className="mt-1 text-sm leading-relaxed text-white/55">{children}</p>
    </div>
  );
}
