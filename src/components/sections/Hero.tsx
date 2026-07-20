"use client";

import { motion } from "motion/react";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { BrowserMockup } from "./BrowserMockup";
import { Magnetic } from "@/components/ui/Magnetic";
import Link from "next/link";

const words = "Votre présence en ligne mérite bien plus qu'un simple site.".split(" ");

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="container-v grid items-center gap-14 py-10 lg:grid-cols-[1.05fr_1fr] lg:py-20">
        {/* Colonne gauche */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-vanyo-500/30 bg-vanyo-500/10 px-4 py-1.5 text-xs font-medium text-vanyo-200"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Agence web premium · Sites qui convertissent
          </motion.div>

          <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {words.map((w, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.15 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className={`mr-[0.28em] inline-block ${
                  w === "simple" || w === "site." ? "text-gradient-violet" : ""
                }`}
              >
                {w}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-white/60"
          >
            Nous concevons des sites internet modernes, rapides et pensés pour
            convertir vos visiteurs en clients.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.6 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Magnetic strength={0.4}>
              <Link href="/devis" className="btn-premium btn-primary px-7 py-3.5 text-[0.98rem]">
                Demander un devis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Magnetic>
            <Link href="/realisations" className="btn-premium btn-ghost px-7 py-3.5 text-[0.98rem]">
              Voir nos réalisations
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.05 }}
            className="mt-9 flex items-center gap-4"
          >
            <div className="flex -space-x-2.5">
              {["CL", "TN", "SB", "JM"].map((n) => (
                <span
                  key={n}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink bg-gradient-to-br from-vanyo-500 to-violet-hi text-[10px] font-semibold text-white"
                >
                  {n}
                </span>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs text-white/50">180+ clients accompagnés</p>
            </div>
          </motion.div>
        </div>

        {/* Colonne droite : maquette */}
        <div className="relative">
          <BrowserMockup />
        </div>
      </div>
    </section>
  );
}
