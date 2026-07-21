"use client";

import { motion } from "motion/react";

/**
 * Maquette animée d'un navigateur affichant un « beau site web ».
 * 100% CSS/SVG, aucune image externe — reste net et rapide.
 *
 * L'apparition d'ensemble est gérée par le parent (classe CSS `.reveal-css`
 * dans Hero.tsx), pas ici : les animations Framer Motion à base d'un état
 * "initial" invisible peuvent occasionnellement rester bloquées sur Safari
 * iOS. Seules les animations infinies (flottement, pulsation) restent en
 * Framer Motion : elles démarrent toujours visibles, donc sans risque.
 */
export function BrowserMockup() {
  return (
    <div style={{ transformStyle: "preserve-3d", perspective: 1200 }} className="relative">
      {/* Halo */}
      <div className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-vanyo-500/20 blur-[90px]" />

      <div className="animate-float gradient-border overflow-hidden rounded-2xl bg-ink-card/90 shadow-2xl shadow-vanyo-900/40">
        {/* Barre du navigateur */}
        <div className="flex items-center gap-2 border-b border-white/8 bg-white/[0.03] px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-rose-400/80" />
          <span className="h-3 w-3 rounded-full bg-amber-400/80" />
          <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
          <div className="ml-3 flex-1 rounded-md bg-white/5 px-3 py-1 text-[11px] text-white/40">
            https://votre-entreprise.fr
          </div>
        </div>

        {/* Contenu du site fictif */}
        <div className="relative p-5">
          {/* mini navbar */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-md bg-gradient-to-br from-vanyo-500 to-violet-hi" />
              <div className="h-2.5 w-14 rounded bg-white/25" />
            </div>
            <div className="hidden gap-3 sm:flex">
              {[10, 12, 10, 14].map((w, i) => (
                <div key={i} className="h-2 rounded bg-white/12" style={{ width: w * 3 }} />
              ))}
            </div>
            <div className="h-6 w-16 rounded-full bg-gradient-to-r from-vanyo-500 to-violet-hi" />
          </div>

          {/* hero fictif */}
          <div className="grid gap-5 sm:grid-cols-2 sm:items-center">
            <div>
              <div className="h-3 w-3/4 rounded bg-white/70" />
              <div className="mt-2 h-3 w-1/2 rounded bg-gradient-to-r from-vanyo-400 to-violet-hi" />
              <div className="mt-4 space-y-1.5">
                <div className="h-2 w-full rounded bg-white/12" />
                <div className="h-2 w-5/6 rounded bg-white/12" />
                <div className="h-2 w-2/3 rounded bg-white/12" />
              </div>
              <div className="mt-4 flex gap-2">
                <div className="h-7 w-24 rounded-full bg-gradient-to-r from-vanyo-500 to-violet-hi" />
                <div className="h-7 w-20 rounded-full border border-white/15 bg-white/5" />
              </div>
            </div>
            <motion.div
              className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-vanyo-500/40 via-violet-mid/25 to-transparent"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="absolute inset-0 bg-grid opacity-40" />
              <div className="absolute bottom-3 left-3 h-2 w-16 rounded bg-white/40" />
              <div className="absolute bottom-6 left-3 h-2 w-24 rounded bg-white/20" />
            </motion.div>
          </div>

          {/* cartes fictives */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-lg border border-white/8 bg-white/[0.03] p-3">
                <div className="h-6 w-6 rounded-md bg-gradient-to-br from-vanyo-500 to-violet-hi" />
                <div className="mt-2 h-1.5 w-full rounded bg-white/15" />
                <div className="mt-1 h-1.5 w-2/3 rounded bg-white/10" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Petites cartes flottantes autour */}
      <motion.div
        className="glass-strong absolute -left-6 top-20 hidden rounded-xl px-4 py-3 shadow-glow sm:block"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="text-2xl font-bold text-gradient-violet">100</div>
        <div className="text-[10px] text-white/50">Score Lighthouse</div>
      </motion.div>
      <motion.div
        className="glass-strong absolute -right-4 bottom-16 hidden rounded-xl px-4 py-3 shadow-glow sm:block"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-medium text-white">En ligne</span>
        </div>
        <div className="mt-0.5 text-[10px] text-white/50">Livré en 12 jours</div>
      </motion.div>
    </div>
  );
}
