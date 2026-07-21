"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus, Pencil, Trash2, X, Save, Ticket, Power } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { PromoCode } from "@/lib/types";
import { FieldGroup, Input, Label } from "@/components/ui/Field";

const empty: Omit<PromoCode, "id" | "created_at"> = {
  code: "", description: "", discount_type: "percent", discount_value: 10, active: true, expires_at: null,
};

export function PromoManager({ initial, live, onChange }: { initial: PromoCode[]; live: boolean; onChange?: (rows: PromoCode[]) => void }) {
  const [rows, setRows] = useState<PromoCode[]>(initial);
  const [editing, setEditing] = useState<PromoCode | null>(null);
  const [draft, setDraft] = useState(empty);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const supabase = live ? createClient() : null;

  useEffect(() => { onChange?.(rows); }, [rows]); // eslint-disable-line react-hooks/exhaustive-deps

  function openNew() { setEditing(null); setDraft(empty); setFormOpen(true); }
  function openEdit(p: PromoCode) { setEditing(p); setDraft(p); setFormOpen(true); }

  async function save() {
    setSaving(true);
    const payload = { ...draft, code: draft.code.trim().toUpperCase(), discount_value: Number(draft.discount_value) || 0, expires_at: draft.expires_at || null };
    if (editing) {
      setRows((prev) => prev.map((r) => (r.id === editing.id ? { ...r, ...payload } : r)));
      if (supabase) await supabase.from("promo_codes").update(payload).eq("id", editing.id);
    } else {
      const newRow: PromoCode = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...payload };
      if (supabase) {
        const { data, error } = await supabase.from("promo_codes").insert(payload).select().single();
        if (error) { alert(error.message.includes("duplicate") ? "Ce code existe déjà." : error.message); setSaving(false); return; }
        if (data) newRow.id = data.id;
      }
      setRows((prev) => [newRow, ...prev]);
    }
    setSaving(false);
    setFormOpen(false);
  }

  async function toggleActive(p: PromoCode) {
    setRows((prev) => prev.map((r) => (r.id === p.id ? { ...r, active: !r.active } : r)));
    if (supabase) await supabase.from("promo_codes").update({ active: !p.active }).eq("id", p.id);
  }

  async function remove(id: string) {
    if (!confirm("Supprimer ce code promo ?")) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
    if (supabase) await supabase.from("promo_codes").delete().eq("id", id);
  }

  const label = (p: PromoCode) =>
    p.discount_type === "percent" ? `−${p.discount_value}%` : `−${p.discount_value}€`;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Codes promo</h1>
          <p className="mt-1 text-sm text-white/50">
            {rows.length} code{rows.length > 1 ? "s" : ""}{!live && " · démonstration"}
          </p>
        </div>
        <button onClick={openNew} className="btn-premium btn-primary px-5 py-2.5 text-sm">
          <Plus className="h-4 w-4" /> Nouveau code
        </button>
      </div>

      <div className="gradient-border overflow-hidden rounded-2xl bg-ink-card/60">
        {rows.map((p) => (
          <div key={p.id} className="flex items-center gap-4 border-b border-white/5 p-4 last:border-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-vanyo-500/12 text-vanyo-300 ring-1 ring-vanyo-500/25">
              <Ticket className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-white">{p.code}</span>
                <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-300">{label(p)}</span>
                {!p.active && <span className="rounded-full bg-white/8 px-2 py-0.5 text-xs text-white/50">Inactif</span>}
              </div>
              <p className="mt-0.5 truncate text-xs text-white/45">
                {p.description || "—"}{p.expires_at ? ` · expire le ${new Date(p.expires_at).toLocaleDateString("fr-FR")}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <button onClick={() => toggleActive(p)} className={`glass flex h-8 w-8 items-center justify-center rounded-lg ${p.active ? "text-emerald-300" : "text-white/50"}`} title={p.active ? "Désactiver" : "Activer"}>
                <Power className="h-4 w-4" />
              </button>
              <button onClick={() => openEdit(p)} className="glass flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => remove(p.id)} className="glass flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-rose-300"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="py-14 text-center text-sm text-white/40">Aucun code promo. Créez-en un.</p>}
      </div>

      <AnimatePresence>
        {formOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFormOpen(false)} className="fixed inset-0 z-40 bg-black/60" />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/10 bg-ink-soft p-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">{editing ? "Modifier le code" : "Nouveau code promo"}</h2>
                <button onClick={() => setFormOpen(false)} className="glass flex h-9 w-9 items-center justify-center rounded-lg"><X className="h-5 w-5" /></button>
              </div>

              <div className="mt-6 space-y-4">
                <FieldGroup label="Code" required>
                  <Input value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })} placeholder="BIENVENUE10" className="font-mono" />
                </FieldGroup>
                <FieldGroup label="Description (interne)">
                  <Input value={draft.description ?? ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Ex : offre de lancement" />
                </FieldGroup>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type de remise</Label>
                    <div className="flex gap-2">
                      {(["percent", "amount"] as const).map((t) => (
                        <button key={t} type="button" onClick={() => setDraft({ ...draft, discount_type: t })}
                          className={`flex-1 rounded-lg border px-3 py-2 text-sm ${draft.discount_type === t ? "border-vanyo-500/70 bg-vanyo-500/15 text-white" : "border-white/10 text-white/55"}`}>
                          {t === "percent" ? "%" : "€"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <FieldGroup label="Valeur">
                    <Input type="number" value={draft.discount_value} onChange={(e) => setDraft({ ...draft, discount_value: Number(e.target.value) })} />
                  </FieldGroup>
                </div>
                <FieldGroup label="Date d'expiration (optionnel)">
                  <Input type="date" value={draft.expires_at ?? ""} onChange={(e) => setDraft({ ...draft, expires_at: e.target.value })} />
                </FieldGroup>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-white/70">
                  <input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} className="h-4 w-4 accent-vanyo-500" />
                  Code actif
                </label>

                <button onClick={save} disabled={saving || !draft.code} className="btn-premium btn-primary w-full py-3 text-sm disabled:opacity-60">
                  <Save className="h-4 w-4" /> {saving ? "Enregistrement…" : "Enregistrer"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
