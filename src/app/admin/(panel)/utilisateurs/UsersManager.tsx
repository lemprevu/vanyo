"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus, Trash2, X, Save, ShieldCheck, Loader2, ChevronDown } from "lucide-react";
import type { AdminProfile, AdminRole, PermissionKey } from "@/lib/types";
import { ADMIN_ROLES, PERMISSION_SECTIONS } from "@/lib/types";
import { Label, Input } from "@/components/ui/Field";

const ROLE_STYLES: Record<AdminRole, string> = {
  Administrateur: "bg-vanyo-500/15 text-vanyo-200 border-vanyo-500/40",
  Modérateur: "bg-sky-500/15 text-sky-300 border-sky-500/40",
  Commercial: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
};

/** Cases à cocher des sections accessibles — n'a de sens que pour un rôle non-Administrateur. */
function PermissionCheckboxes({
  value,
  onChange,
}: {
  value: PermissionKey[];
  onChange: (next: PermissionKey[]) => void;
}) {
  const toggle = (key: PermissionKey) =>
    onChange(value.includes(key) ? value.filter((k) => k !== key) : [...value, key]);

  return (
    <div className="grid grid-cols-2 gap-2">
      {PERMISSION_SECTIONS.map((p) => (
        <label key={p.key} className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2 text-sm text-white/75">
          <input
            type="checkbox"
            checked={value.includes(p.key)}
            onChange={() => toggle(p.key)}
            className="h-4 w-4 accent-vanyo-500"
          />
          {p.label}
        </label>
      ))}
    </div>
  );
}

export function UsersManager({ initial, currentUserId, live, onChange }: { initial: AdminProfile[]; currentUserId: string; live: boolean; onChange?: (rows: AdminProfile[]) => void }) {
  const [rows, setRows] = useState(initial);
  const [formOpen, setFormOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminRole>("Administrateur");
  const [permissions, setPermissions] = useState<PermissionKey[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const demo = !live && !!onChange;
  useEffect(() => { onChange?.(rows); }, [rows]); // eslint-disable-line react-hooks/exhaustive-deps

  async function createUser() {
    setSaving(true);
    setError("");
    try {
      if (demo) {
        // Mode démonstration : aucun appel réseau, on ajoute localement.
        setRows((prev) => [{ id: crypto.randomUUID(), email, role, permissions, created_at: new Date().toISOString() }, ...prev]);
      } else {
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, role, permissions }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur lors de la création.");
        setRows((prev) => [{ id: data.id, email, role, permissions, created_at: new Date().toISOString() }, ...prev]);
      }
      setFormOpen(false);
      setEmail("");
      setPassword("");
      setRole("Administrateur");
      setPermissions([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setSaving(false);
    }
  }

  async function updateRole(id: string, newRole: AdminRole) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, role: newRole } : r)));
    if (demo) return;
    const current = rows.find((r) => r.id === id);
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole, permissions: current?.permissions ?? [] }),
    });
  }

  async function updatePermissions(id: string, newPermissions: PermissionKey[]) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, permissions: newPermissions } : r)));
    if (demo) return;
    const current = rows.find((r) => r.id === id);
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: current?.role ?? "Modérateur", permissions: newPermissions }),
    });
  }

  async function remove(id: string) {
    if (!confirm("Supprimer définitivement cet accès administrateur ?")) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
    if (demo) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Utilisateurs</h1>
          <p className="mt-1 text-sm text-white/50">
            {rows.length} accès administrateur{rows.length > 1 ? "s" : ""}{!live && " · démonstration"}
          </p>
        </div>
        <button onClick={() => setFormOpen(true)} className="btn-premium btn-primary px-5 py-2.5 text-sm">
          <Plus className="h-4 w-4" /> Inviter un utilisateur
        </button>
      </div>

      <div className="gradient-border overflow-hidden rounded-2xl bg-ink-card/60">
        {rows.map((u) => {
          const canRestrict = u.role !== "Administrateur";
          const isExpanded = expanded === u.id;
          return (
            <div key={u.id} className="border-b border-white/5 last:border-0">
              <div className="flex items-center gap-4 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-vanyo-500 to-violet-hi text-sm font-semibold text-white">
                  {(u.email ?? "?").slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-white">{u.email}</span>
                    {u.id === currentUserId && (
                      <span className="rounded-full bg-white/8 px-2 py-0.5 text-xs text-white/50">Vous</span>
                    )}
                  </div>
                  <p className="text-xs text-white/40">
                    Ajouté le {new Date(u.created_at).toLocaleDateString("fr-FR")}
                    {canRestrict && ` · ${u.permissions.length} section${u.permissions.length > 1 ? "s" : ""} autorisée${u.permissions.length > 1 ? "s" : ""}`}
                  </p>
                </div>
                <select
                  value={u.role}
                  onChange={(e) => updateRole(u.id, e.target.value as AdminRole)}
                  className={`rounded-full border bg-transparent px-3 py-1.5 text-xs font-medium outline-none ${ROLE_STYLES[u.role]}`}
                >
                  {ADMIN_ROLES.map((r) => (
                    <option key={r} value={r} className="bg-ink-card text-white">{r}</option>
                  ))}
                </select>
                {canRestrict && (
                  <button
                    onClick={() => setExpanded(isExpanded ? null : u.id)}
                    className="glass flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/70 hover:text-white"
                    title="Gérer les permissions"
                  >
                    <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </button>
                )}
                <button
                  onClick={() => remove(u.id)}
                  disabled={u.id === currentUserId}
                  className="glass flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/70 hover:text-rose-300 disabled:opacity-30"
                  title={u.id === currentUserId ? "Impossible de supprimer votre propre compte" : "Supprimer"}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {canRestrict && isExpanded && (
                <div className="px-4 pb-4">
                  <p className="mb-2 text-xs uppercase tracking-wide text-white/40">Sections accessibles à cet utilisateur</p>
                  <PermissionCheckboxes value={u.permissions} onChange={(next) => updatePermissions(u.id, next)} />
                </div>
              )}
            </div>
          );
        })}
        {rows.length === 0 && <p className="py-14 text-center text-sm text-white/40">Aucun utilisateur.</p>}
      </div>

      <AnimatePresence>
        {formOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFormOpen(false)} className="fixed inset-0 z-40 bg-black/60" />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-white/10 bg-ink-soft p-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                  <ShieldCheck className="h-5 w-5 text-vanyo-400" /> Nouvel utilisateur
                </h2>
                <button onClick={() => setFormOpen(false)} className="glass flex h-9 w-9 items-center justify-center rounded-lg"><X className="h-5 w-5" /></button>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <Label required>Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="collegue@vanyo.fr" />
                </div>
                <div>
                  <Label required>Mot de passe temporaire</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="8 caractères minimum" />
                  <p className="mt-1.5 text-xs text-white/40">Transmettez-le à la personne concernée ; elle pourra le changer ensuite.</p>
                </div>
                <div>
                  <Label>Rôle</Label>
                  <div className="flex flex-wrap gap-2">
                    {ADMIN_ROLES.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`rounded-lg border px-3 py-1.5 text-sm ${role === r ? "border-vanyo-500/70 bg-vanyo-500/15 text-white" : "border-white/10 text-white/55"}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {role !== "Administrateur" && (
                  <div>
                    <Label>Sections accessibles</Label>
                    <PermissionCheckboxes value={permissions} onChange={setPermissions} />
                  </div>
                )}

                {error && (
                  <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-300">{error}</p>
                )}

                <button
                  onClick={createUser}
                  disabled={saving || !email || password.length < 8}
                  className="btn-premium btn-primary w-full py-3 text-sm disabled:opacity-60"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saving ? "Création…" : "Créer l'accès"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
