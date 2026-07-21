"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Palette, Sun, Moon, Check, RotateCcw, X } from "lucide-react";
import { useSiteTheme } from "@/lib/theme-context";

const PRESET_COLORS = [
  { name: "Violet Vanyo", value: "#6D4AFF" },
  { name: "Bleu océan", value: "#2563EB" },
  { name: "Émeraude", value: "#10B981" },
  { name: "Rose", value: "#EC4899" },
  { name: "Ambre", value: "#F59E0B" },
  { name: "Rouge", value: "#EF4444" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Cyan", value: "#06B6D4" },
] as const;

/** Widget flottant : le visiteur choisit son thème et sa couleur d'accent. */
export function PersonalizeWidget() {
  const { theme, setTheme, accent, setAccent, defaultAccent } = useSiteTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-[9990] sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="glass-strong absolute bottom-16 right-0 w-[19rem] rounded-2xl p-4 shadow-2xl sm:w-80"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Personnalisez l'affichage</h3>
              <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white" aria-label="Fermer">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-xs text-white/50">
              Essayez le site à votre goût — juste pour vous, ça ne change rien pour les autres visiteurs.
            </p>

            {/* Thème */}
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/40">Thème</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                    theme === "dark" ? "border-vanyo-500/70 bg-vanyo-500/15 text-white" : "border-white/10 text-white/60 hover:border-white/25"
                  }`}
                >
                  <Moon className="h-4 w-4" /> Sombre
                </button>
                <button
                  onClick={() => setTheme("light")}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                    theme === "light" ? "border-vanyo-500/70 bg-vanyo-500/15 text-white" : "border-white/10 text-white/60 hover:border-white/25"
                  }`}
                >
                  <Sun className="h-4 w-4" /> Clair
                </button>
              </div>
            </div>

            {/* Couleur d'accent */}
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-white/40">Couleur d'accent</p>
                {accent && (
                  <button onClick={() => setAccent(null)} className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70">
                    <RotateCcw className="h-3 w-3" /> Réinitialiser
                  </button>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_COLORS.map((c) => {
                  const active = (accent ?? defaultAccent).toLowerCase() === c.value.toLowerCase();
                  return (
                    <button
                      key={c.value}
                      onClick={() => setAccent(c.value)}
                      title={c.name}
                      className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-110 ${
                        active ? "ring-2 ring-white ring-offset-2 ring-offset-ink-card" : ""
                      }`}
                      style={{ backgroundColor: c.value }}
                    >
                      {active && <Check className="h-4 w-4 text-white drop-shadow" />}
                    </button>
                  );
                })}
                <label
                  className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-white/25 text-white/50 hover:border-white/50 hover:text-white"
                  title="Couleur personnalisée"
                >
                  <Palette className="h-4 w-4" />
                  <input
                    type="color"
                    value={accent ?? defaultAccent}
                    onChange={(e) => setAccent(e.target.value)}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                </label>
              </div>
            </div>

            <p className="mt-4 text-[11px] leading-relaxed text-white/35">
              C'est exactement ce que vous pourrez faire, vous aussi, depuis votre panel admin Vanyo —
              en un clic, pour tout le monde cette fois.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.92 }}
        className="btn-premium btn-primary flex h-14 w-14 items-center justify-center rounded-full shadow-glow-strong"
        aria-label="Personnaliser l'apparence du site"
      >
        <Palette className="h-5 w-5" />
      </motion.button>
    </div>
  );
}
