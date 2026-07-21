"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus, Pencil, Trash2, X, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Realisation } from "@/lib/types";
import { CATEGORIES_REALISATIONS, COLOR_PRESETS } from "@/lib/types";
import { Label, Input } from "@/components/ui/Field";

const empty: Omit<Realisation, "id" | "created_at"> = {
  title: "", category: CATEGORIES_REALISATIONS[0], tags: [], color: COLOR_PRESETS[0].value, link: "", position: 0,
};

export function RealisationsManager({ initial, live, onChange }: { initial: Realisation[]; live: boolean; onChange?: (rows: Realisation[]) => void }) {
  const [rows, setRows] = useState<Realisation[]>(initial);
  const [editing, setEditing] = useState<Realisation | null>(null);
  const [draft, setDraft] = useState(empty);
  const [tagsInput, setTagsInput] = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = live ? createClient() : null;

  // Mode démo : chaque changement local est remonté pour persistance.
  useEffect(() => { onChange?.(rows); }, [rows]); // eslint-disable-line react-hooks/exhaustive-deps

  function openNew() {
    setEditing(null);
    setDraft(empty);
    setTagsInput("");
  }

  function openEdit(r: Realisation) {
    setEditing(r);
    setDraft(r);
    setTagsInput(r.tags.join(", "));
  }

  async function save() {
    setSaving(true);
    const payload = {
      ...draft,
      tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
    };

    if (editing) {
      setRows((prev) => prev.map((r) => (r.id === editing.id ? { ...r, ...payload } : r)));
      if (supabase) await supabase.from("realisations").update(payload).eq("id", editing.id);
    } else {
      const tempId = crypto.randomUUID();
      const newRow: Realisation = { id: tempId, created_at: new Date().toISOString(), ...payload };
      if (supabase) {
        const { data } = await supabase.from("realisations").insert(payload).select().single();
        if (data) newRow.id = data.id;
      }
      setRows((prev) => [newRow, ...prev]);
    }
    setSaving(false);
    setEditing(null);
    setDraft(empty);
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cette réalisation ?")) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
    if (supabase) await supabase.from("realisations").delete().eq("id", id);
  }

  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Réalisations</h1>
          <p className="mt-1 text-sm text-white/50">{rows.length} projet{rows.length > 1 ? "s" : ""}{!live && " · démonstration"}</p>
        </div>
        <button
          onClick={() => { openNew(); setFormOpen(true); }}
          className="btn-premium btn-primary px-5 py-2.5 text-sm"
        >
          <Plus className="h-4 w-4" /> Ajouter
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r) => (
          <div key={r.id} className="gradient-border overflow-hidden rounded-2xl bg-ink-card/60">
            <div className={`relative flex aspect-[16/9] items-center justify-center bg-gradient-to-br ${r.color}`}>
              <div className="absolute inset-0 bg-grid opacity-30" />
              <span className="relative text-lg font-bold text-white/80">{r.title}</span>
              <span className="absolute left-2 top-2 rounded-full bg-ink/70 px-2.5 py-0.5 text-xs text-white">{r.category}</span>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-1.5">
                {r.tags.map((t) => (
                  <span key={t} className="rounded-md bg-white/6 px-2 py-0.5 text-xs text-white/55">{t}</span>
                ))}
              </div>
              <div className="mt-3 flex justify-end gap-1.5">
                <button onClick={() => { openEdit(r); setFormOpen(true); }} className="glass flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => remove(r.id)} className="glass flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-rose-300">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="col-span-full py-14 text-center text-sm text-white/40">Aucune réalisation. Ajoutez-en une.</p>}
      </div>

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
                <h2 className="text-lg font-semibold text-white">{editing ? "Modifier" : "Nouvelle réalisation"}</h2>
                <button onClick={() => setFormOpen(false)} className="glass flex h-9 w-9 items-center justify-center rounded-lg"><X className="h-5 w-5" /></button>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <Label required>Nom du projet</Label>
                  <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Maison Laurent" />
                </div>
                <div>
                  <Label required>Catégorie</Label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES_REALISATIONS.map((c) => (
                      <button key={c} onClick={() => setDraft({ ...draft, category: c })}
                        className={`rounded-lg border px-3 py-1.5 text-sm ${draft.category === c ? "border-vanyo-500/70 bg-vanyo-500/15 text-white" : "border-white/10 text-white/55"}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Tags (séparés par des virgules)</Label>
                  <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="Next.js, Réservation, SEO" />
                </div>
                <div>
                  <Label>Couleur du visuel</Label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((c) => (
                      <button key={c.value} onClick={() => setDraft({ ...draft, color: c.value })}
                        className={`h-9 w-9 rounded-lg bg-gradient-to-br ${c.value} ring-2 ${draft.color === c.value ? "ring-white" : "ring-transparent"}`}
                        title={c.label} />
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Lien (optionnel)</Label>
                  <Input value={draft.link ?? ""} onChange={(e) => setDraft({ ...draft, link: e.target.value })} placeholder="https://…" />
                </div>

                <button onClick={save} disabled={saving || !draft.title} className="btn-premium btn-primary w-full py-3 text-sm disabled:opacity-60">
                  <Save className="h-4 w-4" /> {saving ? "Enregistrement…" : "Enregistrer"}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
