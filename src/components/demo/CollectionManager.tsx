"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus, Pencil, Trash2, X, Save } from "lucide-react";
import type { CollectionSection, Row } from "@/lib/demo/types";
import { FieldControl, displayValue, emptyValue } from "./FieldControl";

function makeEmpty(section: CollectionSection): Row {
  const row: Row = { id: "" };
  for (const f of section.fields) row[f.key] = emptyValue(f);
  return row;
}

export function CollectionManager({
  section,
  rows,
  onChange,
}: {
  section: CollectionSection;
  rows: Row[];
  onChange: (rows: Row[]) => void;
}) {
  const [items, setItems] = useState<Row[]>(rows);
  const [editing, setEditing] = useState<Row | null>(null);
  const [draft, setDraft] = useState<Row>(() => makeEmpty(section));
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => { onChange(items); }, [items]); // eslint-disable-line react-hooks/exhaustive-deps

  const listFields = section.fields.filter((f) => !f.hideInList && f.key !== section.titleField && f.key !== section.colorField && f.key !== section.imageField);
  const layout = section.layout ?? "grid";

  function openNew() {
    setEditing(null);
    setDraft(makeEmpty(section));
    setFormOpen(true);
  }
  function openEdit(r: Row) {
    setEditing(r);
    setDraft({ ...r });
    setFormOpen(true);
  }
  function save() {
    if (editing) {
      setItems((prev) => prev.map((r) => (r.id === editing.id ? { ...draft, id: editing.id } : r)));
    } else {
      setItems((prev) => [{ ...draft, id: crypto.randomUUID(), created_at: new Date().toISOString() }, ...prev]);
    }
    setFormOpen(false);
  }
  function remove(id: string) {
    if (!confirm(`Supprimer ${section.itemLabel} ?`)) return;
    setItems((prev) => prev.filter((r) => r.id !== id));
  }

  const title = (r: Row) => String(r[section.titleField] ?? "Sans titre");
  const colorClass = (r: Row) =>
    section.colorField && r[section.colorField] ? String(r[section.colorField]) : "from-vanyo-500/30 to-violet-hi/30";
  const image = (r: Row) =>
    section.imageField && r[section.imageField] ? String(r[section.imageField]) : null;

  const titleValid = String(draft[section.titleField] ?? "").trim().length > 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">{section.label}</h1>
          <p className="mt-1 text-sm text-white/50">{items.length} élément{items.length > 1 ? "s" : ""} · démonstration</p>
        </div>
        <button onClick={openNew} className="btn-premium btn-primary px-5 py-2.5 text-sm">
          <Plus className="h-4 w-4" /> Ajouter
        </button>
      </div>

      {/* GRID */}
      {layout === "grid" && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r) => (
            <div key={r.id} className="gradient-border overflow-hidden rounded-2xl bg-ink-card/60">
              <div className={`relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-gradient-to-br ${colorClass(r)}`}>
                {image(r) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image(r)!} alt={title(r)} className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-grid opacity-30" />
                    <span className="relative px-3 text-center text-lg font-bold text-white/85">{title(r)}</span>
                  </>
                )}
              </div>
              <div className="space-y-1.5 p-4">
                {listFields.slice(0, 3).map((f) => (
                  <div key={f.key} className="flex justify-between gap-3 text-xs">
                    <span className="text-white/40">{f.label}</span>
                    <span className="truncate text-right text-white/75">{displayValue(f, r)}</span>
                  </div>
                ))}
                <div className="flex justify-end gap-1.5 pt-2">
                  <button onClick={() => openEdit(r)} className="glass flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => remove(r.id)} className="glass flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-rose-300"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LIST */}
      {layout === "list" && (
        <div className="gradient-border overflow-hidden rounded-2xl bg-ink-card/60">
          {items.map((r) => (
            <div key={r.id} className="flex items-center gap-4 border-b border-white/5 p-4 last:border-0">
              <div className={`h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br ${colorClass(r)}`}>
                {image(r) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image(r)!} alt={title(r)} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-medium text-white">{title(r)}</h3>
                <p className="mt-0.5 truncate text-xs text-white/45">
                  {listFields.slice(0, 3).map((f) => displayValue(f, r)).filter((x) => x !== "—").join(" · ") || "—"}
                </p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button onClick={() => openEdit(r)} className="glass flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => remove(r.id)} className="glass flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-rose-300"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length === 0 && <p className="py-14 text-center text-sm text-white/40">Aucun élément. Ajoutez-en un.</p>}

      <AnimatePresence>
        {formOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFormOpen(false)} className="fixed inset-0 z-40 bg-black/60" />
            <motion.aside
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-white/10 bg-ink-soft p-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">{editing ? "Modifier" : "Nouveau"}</h2>
                <button onClick={() => setFormOpen(false)} className="glass flex h-9 w-9 items-center justify-center rounded-lg"><X className="h-5 w-5" /></button>
              </div>

              <div className="mt-6 space-y-4">
                {section.fields.map((f) => (
                  <FieldControl key={f.key} field={f} value={draft[f.key]} onChange={(v) => setDraft((d) => ({ ...d, [f.key]: v }))} />
                ))}
                <button onClick={save} disabled={!titleValid} className="btn-premium btn-primary w-full py-3 text-sm disabled:opacity-60">
                  <Save className="h-4 w-4" /> Enregistrer
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
