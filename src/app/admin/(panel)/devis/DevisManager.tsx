"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Search, Eye, Trash2, X, Mail, Phone, MapPin, Building2,
  Calendar, Euro, Printer, Save,
} from "lucide-react";
import { DEVIS_STATUSES, STATUS_STYLES, type Devis, type DevisStatus } from "@/lib/devis";
import { createClient } from "@/lib/supabase/client";

export function DevisManager({ initial, live }: { initial: Devis[]; live: boolean }) {
  const [rows, setRows] = useState<Devis[]>(initial);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"Tous" | DevisStatus>("Tous");
  const [selected, setSelected] = useState<Devis | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const supabase = live ? createClient() : null;

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
    if (!d.viewed) {
      setRows((prev) => prev.map((r) => (r.id === d.id ? { ...r, viewed: true } : r)));
      if (supabase) supabase.from("devis").update({ viewed: true }).eq("id", d.id);
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

      {/* Filtres par statut */}
      <div className="flex flex-wrap gap-2">
        {(["Tous", ...DEVIS_STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filter === s ? "bg-vanyo-500 text-white" : "border border-white/10 text-white/55 hover:text-white"
            }`}
          >
            {s} <span className="opacity-60">({counts[s] ?? 0})</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="gradient-border overflow-hidden rounded-2xl bg-ink-card/60">
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
                  <td className="px-5 py-3 text-white/70">{d.type_site || "—"}</td>
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
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-white/10 bg-ink-soft p-6"
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
                <Section title="Coordonnées">
                  <Info icon={Mail} value={selected.email} href={`mailto:${selected.email}`} />
                  {selected.telephone && <Info icon={Phone} value={selected.telephone} href={`tel:${selected.telephone}`} />}
                  {selected.entreprise && <Info icon={Building2} value={selected.entreprise} />}
                  {(selected.adresse || selected.ville) && (
                    <Info icon={MapPin} value={[selected.adresse, selected.code_postal, selected.ville, selected.pays].filter(Boolean).join(", ")} />
                  )}
                </Section>

                <Section title="Projet">
                  <Field label="Type de site" value={selected.type_site} />
                  <Field label="Nombre de pages" value={selected.nombre_pages} />
                  <Info icon={Euro} value={selected.budget || "—"} />
                  {selected.date_souhaitee && <Info icon={Calendar} value={selected.date_souhaitee} />}
                  <Field label="Site existant" value={selected.site_existant} />
                  {selected.lien_actuel && <Field label="Lien actuel" value={selected.lien_actuel} />}
                </Section>

                <Section title="Technique">
                  <Field label="Nom de domaine" value={selected.nom_domaine} />
                  <Field label="Hébergement" value={selected.hebergement} />
                  <Field label="Logo" value={selected.logo} />
                  <Field label="Charte graphique" value={selected.charte_graphique} />
                </Section>

                {selected.fonctionnalites && selected.fonctionnalites.length > 0 && (
                  <Section title="Fonctionnalités">
                    <div className="flex flex-wrap gap-1.5">
                      {selected.fonctionnalites.map((f) => (
                        <span key={f} className="rounded-md bg-vanyo-500/12 px-2 py-1 text-xs text-vanyo-200">{f}</span>
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
