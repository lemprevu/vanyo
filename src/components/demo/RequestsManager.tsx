"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, Eye, Trash2, X, Mail, Save } from "lucide-react";
import type { RequestsSection, Row } from "@/lib/demo/types";
import { displayValue } from "./FieldControl";

const STATUS_PALETTE = [
  "bg-vanyo-500/15 text-vanyo-200 border-vanyo-500/40",
  "bg-amber-500/15 text-amber-300 border-amber-500/40",
  "bg-sky-500/15 text-sky-300 border-sky-500/40",
  "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  "bg-rose-500/15 text-rose-300 border-rose-500/40",
  "bg-teal-500/15 text-teal-300 border-teal-500/40",
  "bg-white/8 text-white/50 border-white/15",
];

export function RequestsManager({
  section,
  rows,
  onChange,
}: {
  section: RequestsSection;
  rows: Row[];
  onChange: (rows: Row[]) => void;
}) {
  const [items, setItems] = useState<Row[]>(rows);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("Tous");
  const [selected, setSelected] = useState<Row | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => { onChange(items); }, [items]); // eslint-disable-line react-hooks/exhaustive-deps

  const statusColor = (status: string) => {
    const i = section.statuses.indexOf(status);
    return STATUS_PALETTE[i] ?? STATUS_PALETTE[STATUS_PALETTE.length - 1];
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter((d) => {
      const matchFilter = filter === "Tous" || d.status === filter;
      const hay = section.columns.map((c) => String(d[c] ?? "")).join(" ").toLowerCase();
      return matchFilter && (!q || hay.includes(q));
    });
  }, [items, query, filter, section.columns]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { Tous: items.length };
    section.statuses.forEach((s) => (map[s] = items.filter((d) => d.status === s).length));
    return map;
  }, [items, section.statuses]);

  function updateStatus(id: string, status: string) {
    setItems((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
    setSelected((s) => (s && s.id === id ? { ...s, status } : s));
  }
  function remove(id: string) {
    if (!confirm("Supprimer définitivement cette demande ?")) return;
    setItems((prev) => prev.filter((d) => d.id !== id));
    setSelected(null);
  }
  function openDetail(d: Row) {
    setSelected(d);
    setNote(String(d.note_interne ?? ""));
    if (!d.viewed) setItems((prev) => prev.map((r) => (r.id === d.id ? { ...r, viewed: true } : r)));
  }
  function saveNote() {
    if (!selected) return;
    setItems((prev) => prev.map((d) => (d.id === selected.id ? { ...d, note_interne: note } : d)));
  }

  const colFields = section.columns.map((c) => section.fields.find((f) => f.key === c)).filter(Boolean);
  const email = (d: Row) => String(d.email ?? "");

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">{section.label}</h1>
          <p className="mt-1 text-sm text-white/50">{items.length} demande{items.length > 1 ? "s" : ""} · démonstration</p>
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

      <div className="flex flex-wrap gap-2">
        {(["Tous", ...section.statuses] as string[]).map((s) => (
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

      <div className="gradient-border overflow-hidden rounded-2xl bg-ink-card/60">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-white/8 text-left text-xs uppercase tracking-wide text-white/40">
                <th className="px-5 py-3 font-medium">{section.fields.find((f) => f.key === section.nameField)?.label ?? "Client"}</th>
                {colFields.map((f) => <th key={f!.key} className="px-5 py-3 font-medium">{f!.label}</th>)}
                <th className="px-5 py-3 font-medium">Statut</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                  <td className="px-5 py-3">
                    <button onClick={() => openDetail(d)} className="text-left">
                      <div className="font-medium text-white hover:text-vanyo-200">{String(d[section.nameField] ?? "—")}</div>
                      {d.email ? <div className="text-xs text-white/40">{email(d)}</div> : null}
                    </button>
                  </td>
                  {colFields.map((f) => <td key={f!.key} className="px-5 py-3 text-white/70">{displayValue(f!, d)}</td>)}
                  <td className="px-5 py-3">
                    <select
                      value={String(d.status ?? section.statuses[0])}
                      onChange={(e) => updateStatus(d.id, e.target.value)}
                      className={`rounded-full border bg-transparent px-2.5 py-1 text-xs font-medium outline-none ${statusColor(String(d.status ?? ""))}`}
                    >
                      {section.statuses.map((s) => <option key={s} value={s} className="bg-ink-card text-white">{s}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => openDetail(d)} className="glass flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white"><Eye className="h-4 w-4" /></button>
                      <button onClick={() => remove(d.id)} className="glass flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-rose-300"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <p className="py-14 text-center text-sm text-white/40">Aucune demande ne correspond.</p>}
      </div>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} className="fixed inset-0 z-40 bg-black/60" />
            <motion.aside
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-white/10 bg-ink-soft p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColor(String(selected.status ?? ""))}`}>
                    {String(selected.status ?? "")}
                  </span>
                  <h2 className="mt-3 text-xl font-semibold text-white">{String(selected[section.nameField] ?? "")}</h2>
                  {selected.created_at ? (
                    <p className="text-sm text-white/45">Reçu le {new Date(String(selected.created_at)).toLocaleString("fr-FR")}</p>
                  ) : null}
                </div>
                <button onClick={() => setSelected(null)} className="glass flex h-9 w-9 items-center justify-center rounded-lg"><X className="h-5 w-5" /></button>
              </div>

              <div className="mt-6 space-y-2 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                {section.fields.filter((f) => f.key !== section.nameField).map((f) => {
                  const val = displayValue(f, selected);
                  if (val === "—") return null;
                  return (
                    <div key={f.key} className="flex justify-between gap-4 text-sm">
                      <span className="text-white/45">{f.label}</span>
                      <span className="text-right text-white/80">{val}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/40">Note interne</h3>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Ajouter une note…"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-white outline-none focus:border-vanyo-500/60"
                />
                <button onClick={saveNote} className="btn-premium btn-ghost mt-2 px-4 py-2 text-sm"><Save className="h-4 w-4" /> Enregistrer la note</button>
              </div>

              <div className="mt-4 flex gap-2">
                {selected.email ? (
                  <a href={`mailto:${email(selected)}`} className="btn-premium btn-primary flex-1 py-2.5 text-sm"><Mail className="h-4 w-4" /> Répondre</a>
                ) : null}
                <button onClick={() => remove(selected.id)} className="btn-premium btn-ghost px-4 py-2.5 text-sm text-rose-300"><Trash2 className="h-4 w-4" /></button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
