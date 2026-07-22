"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Plus, X, Save, Trash2, CalendarDays, Clock } from "lucide-react";
import type { PlanningSection, RequestsSection, Row } from "@/lib/demo/types";
import { FieldControl, emptyValue } from "./FieldControl";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

const STATUS_DOT = ["bg-vanyo-400", "bg-amber-400", "bg-sky-400", "bg-emerald-400", "bg-rose-400", "bg-teal-400", "bg-white/40"];

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function frDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1].toLowerCase()} ${y}`;
}

export function PlanningManager({
  section,
  source,
  rows,
  onChange,
}: {
  section: PlanningSection;
  source: RequestsSection;
  rows: Row[];
  onChange: (rows: Row[]) => void;
}) {
  const [items, setItems] = useState<Row[]>(rows);
  const [today] = useState(() => new Date());
  const [view, setView] = useState(() => ({ year: new Date().getFullYear(), month: new Date().getMonth() }));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState<Row>({ id: "" });

  useEffect(() => { onChange(items); }, [items]); // eslint-disable-line react-hooks/exhaustive-deps

  const todayStr = ymd(today);
  const statusIndex = (s: string) => source.statuses.indexOf(s);
  const statusDot = (s: string) => STATUS_DOT[statusIndex(s)] ?? STATUS_DOT[STATUS_DOT.length - 1];

  // Regroupe les rendez-vous par jour (clé YYYY-MM-DD).
  const byDay = useMemo(() => {
    const map: Record<string, Row[]> = {};
    for (const r of items) {
      const key = String(r[section.dateField] ?? "");
      if (!key) continue;
      (map[key] ??= []).push(r);
    }
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => String(a[section.timeField ?? ""] ?? "").localeCompare(String(b[section.timeField ?? ""] ?? "")));
    }
    return map;
  }, [items, section.dateField, section.timeField]);

  // Grille du mois affiché (démarre le lundi, 6 semaines).
  const grid = useMemo(() => {
    const first = new Date(view.year, view.month, 1);
    const startOffset = (first.getDay() + 6) % 7; // lundi = 0
    const days: { date: Date; iso: string; inMonth: boolean }[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(view.year, view.month, 1 - startOffset + i);
      days.push({ date: d, iso: ymd(d), inMonth: d.getMonth() === view.month });
    }
    return days;
  }, [view]);

  const monthCount = items.filter((r) => String(r[section.dateField] ?? "").startsWith(`${view.year}-${String(view.month + 1).padStart(2, "0")}`)).length;
  const todayCount = (byDay[todayStr] ?? []).length;
  const upcoming = useMemo(
    () => items
      .filter((r) => String(r[section.dateField] ?? "") >= todayStr)
      .sort((a, b) => `${a[section.dateField]}${a[section.timeField ?? ""]}`.localeCompare(`${b[section.dateField]}${b[section.timeField ?? ""]}`))
      .slice(0, 6),
    [items, section.dateField, section.timeField, todayStr]
  );

  function shiftMonth(delta: number) {
    setView((v) => {
      const m = v.month + delta;
      return { year: v.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
    });
  }
  function goToday() {
    setView({ year: today.getFullYear(), month: today.getMonth() });
    setSelectedDay(todayStr);
  }

  function openAdd(dateIso: string) {
    const d: Row = { id: "" };
    for (const f of source.fields) d[f.key] = emptyValue(f);
    d[section.dateField] = dateIso;
    d.status = source.statuses[0];
    setDraft(d);
    setFormOpen(true);
  }
  function save() {
    setItems((prev) => [{ ...draft, id: crypto.randomUUID(), created_at: new Date().toISOString(), viewed: true }, ...prev]);
    setFormOpen(false);
    setSelectedDay(String(draft[section.dateField] ?? null) || null);
  }
  function updateStatus(id: string, status: string) {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }
  function remove(id: string) {
    if (!confirm("Supprimer ce rendez-vous ?")) return;
    setItems((prev) => prev.filter((r) => r.id !== id));
  }

  const nameField = source.nameField;
  const dayList = selectedDay ? byDay[selectedDay] ?? [] : [];
  const titleValid = String(draft[nameField] ?? "").trim().length > 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">{section.label}</h1>
          <p className="mt-1 text-sm text-white/50">
            {todayCount} aujourd&apos;hui · {monthCount} ce mois-ci · démonstration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goToday} className="btn-premium btn-ghost px-4 py-2 text-sm">Aujourd&apos;hui</button>
          <button onClick={() => openAdd(selectedDay ?? todayStr)} className="btn-premium btn-primary px-4 py-2 text-sm">
            <Plus className="h-4 w-4" /> Ajouter
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Calendrier */}
        <div className="gradient-border rounded-2xl bg-ink-card/60 p-4 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-white">{MONTHS[view.month]} {view.year}</h2>
            <div className="flex gap-1.5">
              <button onClick={() => shiftMonth(-1)} className="glass flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white"><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={() => shiftMonth(1)} className="glass flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-wide text-white/35">
            {WEEKDAYS.map((w) => <div key={w} className="py-1">{w}</div>)}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {grid.map((cell) => {
              const appts = byDay[cell.iso] ?? [];
              const isToday = cell.iso === todayStr;
              const isSel = cell.iso === selectedDay;
              return (
                <button
                  key={cell.iso}
                  onClick={() => setSelectedDay(cell.iso)}
                  className={`flex min-h-[62px] flex-col rounded-xl border p-1.5 text-left transition-colors ${
                    isSel ? "border-vanyo-500/70 bg-vanyo-500/12" : "border-white/6 hover:border-white/15"
                  } ${cell.inMonth ? "" : "opacity-35"}`}
                >
                  <span className={`text-xs font-medium ${isToday ? "flex h-5 w-5 items-center justify-center rounded-full bg-vanyo-500 text-white" : "text-white/70"}`}>
                    {cell.date.getDate()}
                  </span>
                  <div className="mt-1 flex flex-wrap gap-0.5">
                    {appts.slice(0, 4).map((a) => (
                      <span key={a.id} className={`h-1.5 w-1.5 rounded-full ${statusDot(String(a.status ?? ""))}`} />
                    ))}
                    {appts.length > 4 && <span className="text-[9px] text-white/40">+{appts.length - 4}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Détail du jour sélectionné */}
        <div className="gradient-border rounded-2xl bg-ink-card/60 p-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-white">
              <CalendarDays className="h-4 w-4 text-vanyo-300" />
              {selectedDay ? frDate(selectedDay) : "Sélectionnez un jour"}
            </h2>
          </div>

          <div className="mt-3 space-y-2">
            {selectedDay && dayList.length === 0 && (
              <p className="py-6 text-center text-sm text-white/40">Aucun rendez-vous ce jour.</p>
            )}
            {dayList.map((a) => (
              <div key={a.id} className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-white">
                    <Clock className="h-3.5 w-3.5 text-white/40" />
                    {String(a[section.timeField ?? ""] ?? "—")}
                  </span>
                  <button onClick={() => remove(a.id)} className="text-white/40 hover:text-rose-300"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
                <div className="mt-1 text-sm text-white/80">{String(a[nameField] ?? "")}</div>
                <select
                  value={String(a.status ?? source.statuses[0])}
                  onChange={(e) => updateStatus(a.id, e.target.value)}
                  className="mt-2 w-full rounded-lg border border-white/10 bg-transparent px-2 py-1 text-xs text-white/80 outline-none"
                >
                  {source.statuses.map((s) => <option key={s} value={s} className="bg-ink-card">{s}</option>)}
                </select>
              </div>
            ))}
            {selectedDay && (
              <button onClick={() => openAdd(selectedDay)} className="btn-premium btn-ghost w-full py-2 text-sm">
                <Plus className="h-4 w-4" /> Ajouter à cette date
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Prochains rendez-vous */}
      <div className="gradient-border rounded-2xl bg-ink-card/60 p-4">
        <h2 className="mb-3 font-semibold text-white">Prochains rendez-vous</h2>
        <div className="space-y-2">
          {upcoming.length === 0 && <p className="py-4 text-center text-sm text-white/40">Aucun rendez-vous à venir.</p>}
          {upcoming.map((a) => (
            <button
              key={a.id}
              onClick={() => { setView({ year: Number(String(a[section.dateField]).slice(0, 4)), month: Number(String(a[section.dateField]).slice(5, 7)) - 1 }); setSelectedDay(String(a[section.dateField])); }}
              className="flex w-full items-center gap-3 rounded-xl border border-white/6 bg-white/[0.02] p-3 text-left transition-colors hover:border-white/15"
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${statusDot(String(a.status ?? ""))}`} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-white/85">{String(a[nameField] ?? "")}</div>
                <div className="text-xs text-white/45">{frDate(String(a[section.dateField]))} · {String(a[section.timeField ?? ""] ?? "")}</div>
              </div>
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-white/60">{String(a.status ?? "")}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Formulaire d'ajout */}
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
                <h2 className="text-lg font-semibold text-white">Nouveau rendez-vous</h2>
                <button onClick={() => setFormOpen(false)} className="glass flex h-9 w-9 items-center justify-center rounded-lg"><X className="h-5 w-5" /></button>
              </div>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-white/75">Statut</label>
                  <select
                    value={String(draft.status ?? source.statuses[0])}
                    onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-vanyo-500/70"
                  >
                    {source.statuses.map((s) => <option key={s} value={s} className="bg-ink-card">{s}</option>)}
                  </select>
                </div>
                {source.fields.map((f) => (
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
