"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Search, Eye, Trash2, X, Mail, Phone, MapPin, Building2,
  Calendar, Euro, Printer, Save, Wand2,
} from "lucide-react";
import {
  DEVIS_STATUSES, STATUS_STYLES, type Devis, type DevisStatus,
  resolveCatalog, type CatalogOverrides,
} from "@/lib/devis";
import { createClient } from "@/lib/supabase/client";
import { suggestQuote, selectionFromDevis, devisTypes, devisObjectifs } from "@/lib/quote";
import { VisionPreview } from "@/components/devis/VisionPreview";

export function DevisManager({
  initial, live, onChange, catalogOverrides,
}: {
  initial: Devis[];
  live: boolean;
  onChange?: (rows: Devis[]) => void;
  /** Tarifs personnalisés (Paramètres → Tarifs), pour chiffrer comme le site. */
  catalogOverrides?: CatalogOverrides | null;
}) {
  const catalog = useMemo(() => resolveCatalog(catalogOverrides), [catalogOverrides]);
  const [rows, setRows] = useState<Devis[]>(initial);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"Tous" | DevisStatus>("Tous");
  const [selected, setSelected] = useState<Devis | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const supabase = live ? createClient() : null;
  const demo = !live && !!onChange;

  useEffect(() => { onChange?.(rows); }, [rows]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    return rows.filter((d) => {
      const matchFilter = filter === "Tous" || d.status === filter;
      const q = query.toLowerCase();
      const matchQuery =
        !q ||
        `${d.prenom} ${d.nom} ${d.entreprise ?? ""} ${d.email} ${d.type_site ?? ""}`
          .toLowerCase()
          .includes(q);
      return matchFilter && matchQuery;
    });
  }, [rows, query, filter]);

  const quote = useMemo(() => (selected ? suggestQuote(selected, catalog) : null), [selected, catalog]);

  // Aperçu « vision du client », régénéré à partir des réponses enregistrées.
  const vision = useMemo(() => {
    if (!selected) return null;
    const sel = selectionFromDevis(selected);
    const pack = sel.pack ? catalog.packsByKey[sel.pack] : undefined;
    return {
      siteName: selected.entreprise || `${selected.prenom} ${selected.nom}`.trim(),
      typesSite: devisTypes(selected),
      objectifs: devisObjectifs(selected),
      styleVisuel: selected.style_visuel,
      couleurs: selected.couleurs_souhaitees,
      pages: sel.pages,
      modules: [...(sel.modules ?? []), ...(pack?.includes ?? [])],
    };
  }, [selected, catalog]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { Tous: rows.length };
    DEVIS_STATUSES.forEach((s) => (map[s] = rows.filter((d) => d.status === s).length));
    return map;
  }, [rows]);

  async function updateStatus(id: string, status: DevisStatus) {
    setRows((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
    setSelected((s) => (s && s.id === id ? { ...s, status } : s));
    if (supabase) await supabase.from("devis").update({ status }).eq("id", id);
  }

  async function remove(id: string) {
    if (!confirm("Supprimer définitivement cette demande ?")) return;
    setRows((prev) => prev.filter((d) => d.id !== id));
    setSelected(null);
    if (supabase) await supabase.from("devis").delete().eq("id", id);
  }

  function openDetail(d: Devis) {
    setSelected(d);
    setNote(d.note_interne ?? "");
    if (!d.viewed && (live || demo)) {
      setRows((prev) => prev.map((r) => (r.id === d.id ? { ...r, viewed: true } : r)));
      // keepalive : la requête aboutit même si la page est rafraîchie juste après.
      if (live) {
        fetch("/api/admin/devis/mark-viewed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: [d.id] }),
          keepalive: true,
        }).catch(() => {});
      }
    }
  }

  async function saveNote() {
    if (!selected) return;
    setSaving(true);
    setRows((prev) => prev.map((d) => (d.id === selected.id ? { ...d, note_interne: note } : d)));
    if (supabase) await supabase.from("devis").update({ note_interne: note }).eq("id", selected.id);
    setSaving(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Demandes de devis</h1>
          <p className="mt-1 text-sm text-white/50">
            {rows.length} demande{rows.length > 1 ? "s" : ""}
            {!live && " · mode démonstration"}
          </p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher…"
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/35 outline-none focus:border-vanyo-500/60"
          />
        </div>
      </div>

      {/* Filtres par statut — bande défilante sur mobile, plutôt qu'un pavé
          de pastilles sur quatre lignes. */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden">
        {(["Tous", ...DEVIS_STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
              filter === s ? "bg-vanyo-500 text-white" : "border border-white/10 text-white/55 hover:text-white"
            }`}
          >
            {s} <span className="opacity-60">({counts[s] ?? 0})</span>
          </button>
        ))}
      </div>

      {/* Mobile : une carte par demande, pour éviter un tableau à faire
          défiler horizontalement sur téléphone. */}
      <div className="space-y-2.5 lg:hidden">
        {filtered.map((d) => (
          <div key={d.id} className="gradient-border rounded-2xl bg-ink-card/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <button onClick={() => openDetail(d)} className="min-w-0 flex-1 text-left">
                <div className="truncate font-medium text-white">{d.prenom} {d.nom}</div>
                <div className="truncate text-xs text-white/40">{d.email}</div>
              </button>
              {!d.viewed && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-vanyo-400" />}
            </div>

            <dl className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="shrink-0 text-white/45">Type</dt>
                <dd className="min-w-0 truncate text-right text-white/75">{devisTypes(d).join(", ") || "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="shrink-0 text-white/45">Estimation</dt>
                <dd className="min-w-0 truncate text-right text-white/75">
                  {d.estimation != null ? `${d.estimation.toLocaleString("fr-FR")} €` : (d.budget || "—")}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="shrink-0 text-white/45">Reçu le</dt>
                <dd className="text-right text-white/75">{new Date(d.created_at).toLocaleDateString("fr-FR")}</dd>
              </div>
            </dl>

            <div className="mt-3 flex items-center gap-2">
              <select
                value={d.status}
                onChange={(e) => updateStatus(d.id, e.target.value as DevisStatus)}
                className={`min-w-0 flex-1 rounded-full border bg-transparent px-3 py-2 text-xs font-medium outline-none ${STATUS_STYLES[d.status]}`}
              >
                {DEVIS_STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-ink-card text-white">{s}</option>
                ))}
              </select>
              <button
                onClick={() => openDetail(d)}
                aria-label="Voir le détail"
                className="glass flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white/70"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={() => remove(d.id)}
                aria-label="Supprimer"
                className="glass flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white/70"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="gradient-border rounded-2xl bg-ink-card/60 py-12 text-center text-sm text-white/40">
            Aucune demande ne correspond.
          </p>
        )}
      </div>

      {/* Desktop : tableau complet */}
      <div className="gradient-border hidden overflow-hidden rounded-2xl bg-ink-card/60 lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-white/8 text-left text-xs uppercase tracking-wide text-white/40">
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Budget</th>
                <th className="px-5 py-3 font-medium">Statut</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                  <td className="px-5 py-3">
                    <button onClick={() => openDetail(d)} className="text-left">
                      <div className="font-medium text-white hover:text-vanyo-200">{d.prenom} {d.nom}</div>
                      <div className="text-xs text-white/40">{d.email}</div>
                    </button>
                  </td>
                  <td className="px-5 py-3 text-white/70">{devisTypes(d).join(", ") || "—"}</td>
                  <td className="px-5 py-3 text-white/70">{d.budget || "—"}</td>
                  <td className="px-5 py-3">
                    <select
                      value={d.status}
                      onChange={(e) => updateStatus(d.id, e.target.value as DevisStatus)}
                      className={`rounded-full border bg-transparent px-2.5 py-1 text-xs font-medium outline-none ${STATUS_STYLES[d.status]}`}
                    >
                      {DEVIS_STATUSES.map((s) => (
                        <option key={s} value={s} className="bg-ink-card text-white">{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3 text-white/50">{new Date(d.created_at).toLocaleDateString("fr-FR")}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => openDetail(d)} className="glass flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white" title="Voir">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => remove(d.id)} className="glass flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-rose-300" title="Supprimer">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="py-14 text-center text-sm text-white/40">Aucune demande ne correspond.</p>
        )}
      </div>

      {/* Panneau détail */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="fixed inset-0 z-40 bg-black/60"
            />
            <motion.aside
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto overscroll-contain border-l border-white/10 bg-ink-soft p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[selected.status]}`}>
                    {selected.status}
                  </span>
                  <h2 className="mt-3 text-xl font-semibold text-white">{selected.prenom} {selected.nom}</h2>
                  <p className="text-sm text-white/45">
                    Reçu le {new Date(selected.created_at).toLocaleString("fr-FR")}
                  </p>
                </div>
                <button onClick={() => setSelected(null)} className="glass flex h-9 w-9 items-center justify-center rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {quote && (
                  <Section title="Estimation & aperçu générés">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="flex items-center gap-1.5 text-sm text-white/60">
                        <Wand2 className="h-4 w-4 text-vanyo-400" /> Prix suggéré
                      </span>
                      <span className="text-right">
                        <span className="block text-2xl font-bold leading-tight text-white">
                          {quote.surDevis ? "Sur devis" : `${quote.total.toLocaleString("fr-FR")} €`}
                        </span>
                        {quote.monthly > 0 && (
                          <span className="block text-xs text-white/55">
                            puis {quote.monthly.toLocaleString("fr-FR")} €/mois
                          </span>
                        )}
                      </span>
                    </div>

                    {selected.estimation != null && selected.estimation !== quote.total && (
                      <p className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs text-sky-200">
                        Montant affiché au client lors de l&apos;envoi :{" "}
                        {selected.estimation.toLocaleString("fr-FR")} €. Le tarif ayant changé depuis, honorez
                        de préférence le montant annoncé.
                      </p>
                    )}

                    {quote.lines.length > 0 && (
                      <div className="space-y-1 border-t border-white/8 pt-2 text-xs">
                        {quote.lines.map((l, i) => (
                          <div key={`${l.label}-${i}`} className="flex justify-between gap-3 text-white/50">
                            <span className="min-w-0">{l.label}</span>
                            <span className="shrink-0">+{l.amount.toLocaleString("fr-FR")} €</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {quote.monthlyLines.length > 0 && (
                      <div className="space-y-1 border-t border-white/8 pt-2 text-xs">
                        {quote.monthlyLines.map((l, i) => (
                          <div key={`${l.label}-${i}`} className="flex justify-between gap-3 text-white/50">
                            <span className="min-w-0">{l.label}</span>
                            <span className="shrink-0">+{l.amount} €/mois</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {quote.packSuggested && (
                      <p className="rounded-lg border border-vanyo-500/30 bg-vanyo-500/10 px-3 py-2 text-xs text-vanyo-200">
                        Le client n&apos;a pas choisi de formule — calcul basé sur la formule{" "}
                        {catalog.packsByKey[quote.packKey]?.name}, la plus adaptée à ses réponses.
                      </p>
                    )}

                    {quote.belowClientBudget && (
                      <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                        Le budget annoncé ({selected.budget}) est nettement en dessous de l&apos;estimation — à
                        clarifier avec le client (réduire le périmètre ou ajuster le budget).
                      </p>
                    )}

                    {vision && (
                      <div className="pt-2">
                        <VisionPreview vision={vision} />
                      </div>
                    )}

                    <p className="text-[11px] text-white/35">
                      Estimation automatique à partir des réponses du formulaire — un point de départ pour
                      l&apos;échange, pas un prix à annoncer tel quel.
                    </p>
                  </Section>
                )}

                {(selected.formule || selected.modules?.length || selected.deploiement || selected.maintenance) && (
                  <Section title="Configuration choisie">
                    <Field
                      label="Formule"
                      value={selected.formule ? (catalog.packsByKey[selected.formule]?.name ?? "À conseiller") : null}
                    />
                    <Field label="Pages" value={selected.pages_total ? String(selected.pages_total) : null} />
                    <Field
                      label="Mise en ligne"
                      value={selected.deploiement ? (catalog.deploiementsByKey[selected.deploiement]?.label ?? null) : null}
                    />
                    <Field label="Délai" value={selected.delai ? (catalog.delaisByKey[selected.delai]?.label ?? null) : null} />
                    <Field
                      label="Maintenance"
                      value={selected.maintenance ? (catalog.maintenancePlansByKey[selected.maintenance]?.label ?? null) : null}
                    />

                    {selected.modules && selected.modules.length > 0 && (
                      <div className="pt-1">
                        <span className="text-xs text-white/45">Modules demandés</span>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {selected.modules.map((m) => (
                            <span key={m} className="rounded-md bg-vanyo-500/12 px-2 py-1 text-xs text-vanyo-200">
                              {catalog.modulesByKey[m]?.label ?? m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selected.maintenance_options && selected.maintenance_options.length > 0 && (
                      <div className="pt-1">
                        <span className="text-xs text-white/45">Suppléments mensuels</span>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {selected.maintenance_options.map((o) => (
                            <span key={o} className="rounded-md bg-emerald-500/15 px-2 py-1 text-xs text-emerald-300">
                              {catalog.maintenanceOptionsByKey[o]?.label ?? o}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </Section>
                )}

                <Section title="Coordonnées">
                  <Info icon={Mail} value={selected.email} href={`mailto:${selected.email}`} />
                  {selected.telephone && <Info icon={Phone} value={selected.telephone} href={`tel:${selected.telephone}`} />}
                  {selected.entreprise && <Info icon={Building2} value={selected.entreprise} />}
                  {(selected.adresse || selected.ville) && (
                    <Info icon={MapPin} value={[selected.adresse, selected.code_postal, selected.ville, selected.pays].filter(Boolean).join(", ")} />
                  )}
                </Section>

                <Section title="Projet">
                  <Field label="Type de site" value={devisTypes(selected).join(", ")} />
                  <Field label="Nombre de pages" value={selected.nombre_pages} />
                  <Info icon={Euro} value={selected.budget || "—"} />
                  {selected.date_souhaitee && <Info icon={Calendar} value={selected.date_souhaitee} />}
                  <Field label="Site existant" value={selected.site_existant} />
                  {selected.lien_actuel && <Field label="Lien actuel" value={selected.lien_actuel} />}
                </Section>

                {(selected.nom_domaine || selected.hebergement || selected.logo || selected.charte_graphique) && (
                  <Section title="Identité & technique">
                    <Field label="Nom de domaine" value={selected.nom_domaine} />
                    <Field label="Hébergement" value={selected.hebergement} />
                    <Field label="Logo" value={selected.logo} />
                    <Field label="Charte graphique" value={selected.charte_graphique} />
                  </Section>
                )}

                {selected.fonctionnalites && selected.fonctionnalites.length > 0 && (
                  <Section title="Fonctionnalités">
                    <div className="flex flex-wrap gap-1.5">
                      {selected.fonctionnalites.map((f) => (
                        <span key={f} className="rounded-md bg-vanyo-500/12 px-2 py-1 text-xs text-vanyo-200">{f}</span>
                      ))}
                    </div>
                  </Section>
                )}

                {(selected.objectif || selected.style_visuel || selected.couleurs_souhaitees ||
                  selected.ambiance || selected.inspirations || selected.concurrents ||
                  selected.public_cible || selected.contenu_type || selected.langues || selected.a_des_photos) && (
                  <Section title="Style & contenu">
                    <Field label="Objectifs" value={devisObjectifs(selected).join(", ")} />
                    <Field label="Style visuel" value={selected.style_visuel} />
                    <Field label="Couleurs" value={selected.couleurs_souhaitees} />
                    <Field label="Ambiance" value={selected.ambiance} />
                    <Field label="Clientèle cible" value={selected.public_cible} />
                    <Field label="Contenu" value={selected.contenu_type} />
                    <Field label="Photos" value={selected.a_des_photos} />
                    <Field label="Langues" value={selected.langues} />
                    {selected.inspirations && (
                      <div className="pt-1">
                        <span className="text-xs text-white/45">Inspirations</span>
                        <p className="whitespace-pre-wrap text-sm text-white/80">{selected.inspirations}</p>
                      </div>
                    )}
                    {selected.concurrents && (
                      <div className="pt-1">
                        <span className="text-xs text-white/45">Concurrents</span>
                        <p className="whitespace-pre-wrap text-sm text-white/80">{selected.concurrents}</p>
                      </div>
                    )}
                  </Section>
                )}

                {((selected.options && selected.options.length > 0) || (selected.pages_supplementaires ?? 0) > 0) && (
                  <Section title="Options supplémentaires">
                    <div className="flex flex-wrap gap-1.5">
                      {(selected.pages_supplementaires ?? 0) > 0 && (
                        <span className="rounded-md bg-emerald-500/15 px-2 py-1 text-xs text-emerald-300">
                          {selected.pages_supplementaires} page(s) supplémentaire(s)
                        </span>
                      )}
                      {(selected.options ?? []).map((o) => (
                        <span key={o} className="rounded-md bg-emerald-500/15 px-2 py-1 text-xs text-emerald-300">{o}</span>
                      ))}
                    </div>
                  </Section>
                )}

                {selected.description && (
                  <Section title="Description">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/70">{selected.description}</p>
                  </Section>
                )}

                <Section title="Note interne">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    placeholder="Ajouter une note…"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-white outline-none focus:border-vanyo-500/60"
                  />
                  <button onClick={saveNote} disabled={saving} className="btn-premium btn-ghost mt-2 px-4 py-2 text-sm">
                    <Save className="h-4 w-4" /> {saving ? "Enregistré" : "Enregistrer la note"}
                  </button>
                </Section>

                <div className="flex gap-2 pt-2">
                  <a href={`mailto:${selected.email}`} className="btn-premium btn-primary flex-1 py-2.5 text-sm">
                    <Mail className="h-4 w-4" /> Répondre
                  </a>
                  <button onClick={() => window.print()} className="btn-premium btn-ghost px-4 py-2.5 text-sm">
                    <Printer className="h-4 w-4" />
                  </button>
                  <button onClick={() => remove(selected.id)} className="btn-premium btn-ghost px-4 py-2.5 text-sm text-rose-300">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/40">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Info({ icon: Icon, value, href }: { icon: typeof Mail; value: string; href?: string }) {
  const content = (
    <span className="flex items-center gap-2.5 text-sm text-white/75">
      <Icon className="h-4 w-4 shrink-0 text-vanyo-400" /> {value}
    </span>
  );
  return href ? <a href={href} className="block hover:text-white">{content}</a> : content;
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-white/45">{label}</span>
      <span className="text-right text-white/80">{value}</span>
    </div>
  );
}
