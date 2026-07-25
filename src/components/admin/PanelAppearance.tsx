"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Palette, Sun, Moon, Check, RotateCcw, X } from "lucide-react";
import { usePanelTheme } from "@/lib/panel-theme";

const PRESETS = [
  { name: "Violet", value: "#6D4AFF" },
  { name: "Bleu", value: "#2563EB" },
  { name: "Cyan", value: "#0891B2" },
  { name: "Émeraude", value: "#059669" },
  { name: "Lime", value: "#65A30D" },
  { name: "Ambre", value: "#D97706" },
  { name: "Orange", value: "#EA580C" },
  { name: "Rouge", value: "#DC2626" },
  { name: "Rose", value: "#DB2777" },
  { name: "Indigo", value: "#4F46E5" },
  { name: "Bordeaux", value: "#9F1239" },
  { name: "Ardoise", value: "#475569" },
] as const;

/** Réglage clair/sombre + couleur du panel, depuis la barre d'en-tête. */
export function PanelAppearance() {
  const { theme, setTheme, accent, setAccent, defaultAccent, customized, reset } = usePanelTheme();
  const [open, setOpen] = useState(false);
  const active = accent ?? defaultAccent;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Apparence du panel"
        title="Apparence du panel"
        className="glass relative flex h-10 w-10 items-center justify-center rounded-xl text-white/70 hover:text-white"
      >
        <Palette className="h-5 w-5" />
        <span
          className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-ink"
          style={{ background: active }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Zone de fermeture au clic extérieur */}
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-0 top-12 z-50 w-[17.5rem] rounded-2xl border border-white/10 bg-ink-card/95 p-4 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Apparence du panel</h3>
                <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white" aria-label="Fermer">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1 text-xs text-white/50">
                Ne change que votre affichage — le site public n&apos;est pas concerné.
              </p>

              {/* Thème */}
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/40">Thème</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTheme("dark")}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                      theme === "dark"
                        ? "border-vanyo-500/70 bg-vanyo-500/15 text-white"
                        : "border-white/10 text-white/60 hover:border-white/25"
                    }`}
                  >
                    <Moon className="h-4 w-4" /> Sombre
                  </button>
                  <button
                    onClick={() => setTheme("light")}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                      theme === "light"
                        ? "border-vanyo-500/70 bg-vanyo-500/15 text-white"
                        : "border-white/10 text-white/60 hover:border-white/25"
                    }`}
                  >
                    <Sun className="h-4 w-4" /> Clair
                  </button>
                </div>
              </div>

              {/* Couleur */}
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/40">Couleur</p>
                <div className="grid grid-cols-6 gap-2">
                  {PRESETS.map((c) => {
                    const on = active.toLowerCase() === c.value.toLowerCase();
                    return (
                      <button
                        key={c.value}
                        onClick={() => setAccent(c.value)}
                        title={c.name}
                        aria-label={c.name}
                        className={`flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110 ${
                          on ? "ring-2 ring-white ring-offset-2 ring-offset-ink-card" : ""
                        }`}
                        style={{ backgroundColor: c.value }}
                      >
                        {on && <Check className="h-3.5 w-3.5 text-white drop-shadow" />}
                      </button>
                    );
                  })}
                </div>

                <label className="mt-3 flex cursor-pointer items-center gap-2.5 rounded-xl border border-white/10 px-3 py-2 text-sm text-white/70 hover:border-white/25">
                  <span
                    className="h-5 w-5 shrink-0 rounded-full border border-white/20"
                    style={{ background: active }}
                  />
                  Couleur personnalisée
                  <input
                    type="color"
                    value={active}
                    onChange={(e) => setAccent(e.target.value)}
                    className="ml-auto h-6 w-8 cursor-pointer border-0 bg-transparent p-0"
                  />
                </label>
              </div>

              {customized && (
                <button
                  onClick={reset}
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 py-2 text-xs text-white/50 hover:text-white/80"
                >
                  <RotateCcw className="h-3 w-3" /> Revenir à l&apos;apparence d&apos;origine
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
