"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus, Pencil, Trash2, X, Save, Star, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Plan } from "@/lib/types";
import { Label, Input, Textarea } from "@/components/ui/Field";
import { parsePrice, discountPercent } from "@/lib/price";

const empty: Omit<Plan, "id" | "created_at"> = {
  name: "", price: "", original_price: "", price_note: "à partir de", description: "", features: [], highlight: false, position: 0,
};

export function PlansManager({ initial, live }: { initial: Plan[]; live: boolean }) {
  const [rows, setRows] = useState<Plan[]>(initial);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [draft, setDraft] = useState(empty);
  const [featuresInput, setFeaturesInput] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const supabase = live ? createClient() : null;

  function openNew() {
    setEditing(null);
    setDraft(empty);
    setFeaturesInput("");
    setFormOpen(true);
  }

  function openEdit(p: Plan) {
    setEditing(p);
    setDraft(p);
    setFeaturesInput(p.features.join("\n"));
    setFormOpen(true);
  }

  async function save() {
    setSaving(true);
    const payload = { ...draft, features: featuresInput.split("\n").map((f) => f.trim()).filter(Boolean) };

    if (editing) {
      setRows((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...payload } : p)));
      if (supabase) await supabase.from("plans").update(payload).eq("id", editing.id);
    } else {
      const newRow: Plan = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...payload };
      if (supabase) {
        const { data } = await supabase.from("plans").insert(payload).select().single();
        if (data) newRow.id = data.id;
      }
      setRows((prev) => [...prev, newRow]);
    }
    setSaving(false);
    setFormOpen(false);
  }

  async function remove(id: string) {
    if (!confirm("Supprimer ce pack tarifaire ?")) return;
    setRows((prev) => prev.filter((p) => p.id !== id));
    if (supabase) await supabase.from("plans").delete().eq("id", id);
  }

  return (
    <div className="gradient-border rounded-2xl bg-ink-card/60 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-white">Tarifs affichés sur le site</h2>
          <p className="text-xs text-white/45">{rows.length} pack{rows.length > 1 ? "s" : ""}{!live && " · démonstration"}</p>
        </div>
        <button onClick={openNew} className="btn-premium btn-ghost px-4 py-2 text-sm">
          <Plus className="h-4 w-4" /> Nouveau pack
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {rows.map((p) => (
          <div key={p.id} className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{p.name}</span>
                  {p.highlight && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">{p.price}</span>
                  {p.original_price && (
                    <span className="text-xs text-white/40 line-through">{p.original_price}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => openEdit(p)} className="glass flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => remove(p.id)} className="glass flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-rose-300"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <p className="mt-1 text-xs text-white/50">{p.features.length} fonctionnalités incluses</p>
          </div>
        ))}
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
                <h2 className="text-lg font-semibold text-white">{editing ? "Modifier le pack" : "Nouveau pack"}</h2>
                <button onClick={() => setFormOpen(false)} className="glass flex h-9 w-9 items-center justify-center rounded-lg"><X className="h-5 w-5" /></button>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <Label required>Nom du pack</Label>
                  <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Business" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label required>Prix affiché</Label>
                    <Input value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} placeholder="1 490€" />
                  </div>
                  <div>
                    <Label>Précision</Label>
                    <Input value={draft.price_note ?? ""} onChange={(e) => setDraft({ ...draft, price_note: e.target.value })} placeholder="à partir de" />
                  </div>
                </div>
                <div>
                  <Label>Prix conseillé (barré, optionnel)</Label>
                  <Input
                    value={draft.original_price ?? ""}
                    onChange={(e) => setDraft({ ...draft, original_price: e.target.value })}
                    placeholder="Ex : 1 990€ — laissez vide si pas de réduction"
                  />
                  {(() => {
                    const orig = parsePrice(draft.original_price ?? "");
                    const cur = parsePrice(draft.price);
                    const pct = orig && cur ? discountPercent(orig, cur) : 0;
                    return pct > 0 ? (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-300">
                        <Tag className="h-3.5 w-3.5" /> Réduction calculée automatiquement : −{pct}%
                      </p>
                    ) : orig ? (
                      <p className="mt-1.5 text-xs text-amber-300">
                        Le prix conseillé doit être supérieur au prix affiché pour qu'une réduction apparaisse.
                      </p>
                    ) : null;
                  })()}
                </div>
                <div>
                  <Label>Description</Label>
                  <Input value={draft.description ?? ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Le choix des entreprises…" />
                </div>
                <div>
                  <Label>Fonctionnalités (une par ligne)</Label>
                  <Textarea rows={6} value={featuresInput} onChange={(e) => setFeaturesInput(e.target.value)} placeholder={"Site 5 à 8 pages\nSEO avancé\nBlog inclus"} />
                </div>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-white/70">
                  <input type="checkbox" checked={draft.highlight} onChange={(e) => setDraft({ ...draft, highlight: e.target.checked })} className="h-4 w-4 accent-vanyo-500" />
                  Mettre en avant (« Le plus choisi »)
                </label>

                <button onClick={save} disabled={saving || !draft.name || !draft.price} className="btn-premium btn-primary w-full py-3 text-sm disabled:opacity-60">
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
