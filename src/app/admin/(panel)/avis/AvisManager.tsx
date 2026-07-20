"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus, Pencil, Trash2, X, Save, Star, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Avis } from "@/lib/types";
import { Label, Input, Textarea } from "@/components/ui/Field";

const empty: Omit<Avis, "id" | "created_at"> = {
  name: "", company: "", rating: 5, quote: "", initials: "", featured: true, position: 0,
};

export function AvisManager({ initial, live }: { initial: Avis[]; live: boolean }) {
  const [rows, setRows] = useState<Avis[]>(initial);
  const [editing, setEditing] = useState<Avis | null>(null);
  const [draft, setDraft] = useState(empty);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const supabase = live ? createClient() : null;

  function openNew() {
    setEditing(null);
    setDraft(empty);
    setFormOpen(true);
  }

  function openEdit(a: Avis) {
    setEditing(a);
    setDraft(a);
    setFormOpen(true);
  }

  async function save() {
    setSaving(true);
    const initials = draft.initials || draft.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
    const payload = { ...draft, initials };

    if (editing) {
      setRows((prev) => prev.map((a) => (a.id === editing.id ? { ...a, ...payload } : a)));
      if (supabase) await supabase.from("avis").update(payload).eq("id", editing.id);
    } else {
      const newRow: Avis = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...payload };
      if (supabase) {
        const { data } = await supabase.from("avis").insert(payload).select().single();
        if (data) newRow.id = data.id;
      }
      setRows((prev) => [newRow, ...prev]);
    }
    setSaving(false);
    setFormOpen(false);
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cet avis ?")) return;
    setRows((prev) => prev.filter((a) => a.id !== id));
    if (supabase) await supabase.from("avis").delete().eq("id", id);
  }

  async function toggleFeatured(a: Avis) {
    setRows((prev) => prev.map((r) => (r.id === a.id ? { ...r, featured: !r.featured } : r)));
    if (supabase) await supabase.from("avis").update({ featured: !a.featured }).eq("id", a.id);
  }

  const pending = rows.filter((a) => !a.featured).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Avis clients</h1>
          <p className="mt-1 text-sm text-white/50">
            {rows.length} avis{pending > 0 && ` · ${pending} en attente de validation`}{!live && " · démonstration"}
          </p>
        </div>
        <button onClick={openNew} className="btn-premium btn-primary px-5 py-2.5 text-sm">
          <Plus className="h-4 w-4" /> Ajouter un avis
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((a) => (
          <div key={a.id} className={`gradient-border rounded-2xl bg-ink-card/60 p-5 ${!a.featured ? "ring-1 ring-amber-500/30" : ""}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-0.5 text-amber-400">
                {Array.from({ length: a.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
              </div>
              {!a.featured && (
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-300">En attente</span>
              )}
            </div>
            <p className="mt-3 line-clamp-3 text-sm text-white/70">« {a.quote} »</p>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-vanyo-500 to-violet-hi text-xs font-semibold text-white">{a.initials}</span>
                <div>
                  <div className="text-sm font-medium text-white">{a.name}</div>
                  <div className="text-xs text-white/45">{a.company}</div>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => toggleFeatured(a)}
                  className={`glass flex h-8 w-8 items-center justify-center rounded-lg ${a.featured ? "text-emerald-300" : "text-white/70 hover:text-emerald-300"}`}
                  title={a.featured ? "Dépublier" : "Publier"}
                >
                  {a.featured ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button onClick={() => openEdit(a)} className="glass flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => remove(a.id)} className="glass flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-rose-300"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="col-span-full py-14 text-center text-sm text-white/40">Aucun avis. Ajoutez-en un.</p>}
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
                <h2 className="text-lg font-semibold text-white">{editing ? "Modifier l'avis" : "Nouvel avis"}</h2>
                <button onClick={() => setFormOpen(false)} className="glass flex h-9 w-9 items-center justify-center rounded-lg"><X className="h-5 w-5" /></button>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <Label required>Nom</Label>
                  <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Camille Laurent" />
                </div>
                <div>
                  <Label>Entreprise</Label>
                  <Input value={draft.company ?? ""} onChange={(e) => setDraft({ ...draft, company: e.target.value })} placeholder="Maison Laurent" />
                </div>
                <div>
                  <Label>Note</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => setDraft({ ...draft, rating: n })}>
                        <Star className={`h-6 w-6 ${n <= draft.rating ? "fill-amber-400 text-amber-400" : "text-white/20"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label required>Avis</Label>
                  <Textarea rows={4} value={draft.quote} onChange={(e) => setDraft({ ...draft, quote: e.target.value })} placeholder="Le témoignage du client…" />
                </div>
                <div>
                  <Label>Initiales (auto si vide)</Label>
                  <Input value={draft.initials ?? ""} onChange={(e) => setDraft({ ...draft, initials: e.target.value.toUpperCase().slice(0, 2) })} placeholder="CL" />
                </div>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-white/70">
                  <input type="checkbox" checked={draft.featured} onChange={(e) => setDraft({ ...draft, featured: e.target.checked })} className="h-4 w-4 accent-vanyo-500" />
                  Mettre en avant sur le site
                </label>

                <button onClick={save} disabled={saving || !draft.name || !draft.quote} className="btn-premium btn-primary w-full py-3 text-sm disabled:opacity-60">
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
