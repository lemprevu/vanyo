"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus, Pencil, Trash2, X, Save, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Article } from "@/lib/types";
import { CATEGORIES_ARTICLES, COLOR_PRESETS } from "@/lib/types";
import { Label, Input, Textarea } from "@/components/ui/Field";

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const empty: Omit<Article, "id" | "created_at"> = {
  slug: "", title: "", excerpt: "", content: "", category: CATEGORIES_ARTICLES[0],
  color: COLOR_PRESETS[0].value, reading_time: "5 min", published: true,
  published_at: new Date().toISOString().slice(0, 10),
};

export function ArticlesManager({ initial, live }: { initial: Article[]; live: boolean }) {
  const [rows, setRows] = useState<Article[]>(initial);
  const [editing, setEditing] = useState<Article | null>(null);
  const [draft, setDraft] = useState(empty);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const supabase = live ? createClient() : null;

  function openNew() {
    setEditing(null);
    setDraft(empty);
    setFormOpen(true);
  }

  function openEdit(a: Article) {
    setEditing(a);
    setDraft(a);
    setFormOpen(true);
  }

  async function save() {
    setSaving(true);
    const slug = draft.slug || slugify(draft.title);
    const payload = { ...draft, slug };

    if (editing) {
      setRows((prev) => prev.map((a) => (a.id === editing.id ? { ...a, ...payload } : a)));
      if (supabase) await supabase.from("articles").update(payload).eq("id", editing.id);
    } else {
      const newRow: Article = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...payload };
      if (supabase) {
        const { data } = await supabase.from("articles").insert(payload).select().single();
        if (data) newRow.id = data.id;
      }
      setRows((prev) => [newRow, ...prev]);
    }
    setSaving(false);
    setFormOpen(false);
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cet article ?")) return;
    setRows((prev) => prev.filter((a) => a.id !== id));
    if (supabase) await supabase.from("articles").delete().eq("id", id);
  }

  async function togglePublish(a: Article) {
    setRows((prev) => prev.map((r) => (r.id === a.id ? { ...r, published: !r.published } : r)));
    if (supabase) await supabase.from("articles").update({ published: !a.published }).eq("id", a.id);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Blog</h1>
          <p className="mt-1 text-sm text-white/50">{rows.length} article{rows.length > 1 ? "s" : ""}{!live && " · démonstration"}</p>
        </div>
        <button onClick={openNew} className="btn-premium btn-primary px-5 py-2.5 text-sm">
          <Plus className="h-4 w-4" /> Nouvel article
        </button>
      </div>

      <div className="gradient-border overflow-hidden rounded-2xl bg-ink-card/60">
        {rows.map((a) => (
          <div key={a.id} className="flex items-center gap-4 border-b border-white/5 p-4 last:border-0">
            <div className={`h-14 w-20 shrink-0 rounded-lg bg-gradient-to-br ${a.color}`} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-medium text-white">{a.title}</h3>
                {!a.published && <span className="rounded-full bg-white/8 px-2 py-0.5 text-xs text-white/50">Brouillon</span>}
              </div>
              <p className="mt-0.5 text-xs text-white/45">{a.category} · {new Date(a.published_at).toLocaleDateString("fr-FR")} · {a.reading_time}</p>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <button onClick={() => togglePublish(a)} className="glass flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white" title={a.published ? "Dépublier" : "Publier"}>
                {a.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <button onClick={() => openEdit(a)} className="glass flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => remove(a.id)} className="glass flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-rose-300">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="py-14 text-center text-sm text-white/40">Aucun article. Créez-en un.</p>}
      </div>

      <AnimatePresence>
        {formOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFormOpen(false)} className="fixed inset-0 z-40 bg-black/60" />
            <motion.aside
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto border-l border-white/10 bg-ink-soft p-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">{editing ? "Modifier l'article" : "Nouvel article"}</h2>
                <button onClick={() => setFormOpen(false)} className="glass flex h-9 w-9 items-center justify-center rounded-lg"><X className="h-5 w-5" /></button>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <Label required>Titre</Label>
                  <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Titre de l'article" />
                </div>
                <div>
                  <Label>URL (slug)</Label>
                  <Input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: slugify(e.target.value) })} placeholder={slugify(draft.title) || "genere-automatiquement"} />
                </div>
                <div>
                  <Label>Catégorie</Label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES_ARTICLES.map((c) => (
                      <button key={c} onClick={() => setDraft({ ...draft, category: c })}
                        className={`rounded-lg border px-3 py-1.5 text-sm ${draft.category === c ? "border-vanyo-500/70 bg-vanyo-500/15 text-white" : "border-white/10 text-white/55"}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Résumé</Label>
                  <Textarea rows={2} value={draft.excerpt ?? ""} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} placeholder="Résumé affiché sur la liste des articles" />
                </div>
                <div>
                  <Label>Contenu</Label>
                  <Textarea rows={8} value={draft.content ?? ""} onChange={(e) => setDraft({ ...draft, content: e.target.value })} placeholder="Contenu complet de l'article" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date de publication</Label>
                    <Input type="date" value={draft.published_at} onChange={(e) => setDraft({ ...draft, published_at: e.target.value })} />
                  </div>
                  <div>
                    <Label>Temps de lecture</Label>
                    <Input value={draft.reading_time} onChange={(e) => setDraft({ ...draft, reading_time: e.target.value })} placeholder="5 min" />
                  </div>
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
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-white/70">
                  <input type="checkbox" checked={draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} className="h-4 w-4 accent-vanyo-500" />
                  Publié (visible sur le site)
                </label>

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
