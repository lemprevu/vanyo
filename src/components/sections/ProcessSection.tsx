"use client";

import { motion } from "motion/react";
import { PROCESS } from "@/lib/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";

export function ProcessSection() {
  return (
    <section className="container-v py-14 sm:py-20">
      <SectionHeading
        eyebrow="Notre processus"
        title={<>De l'idée à la <span className="text-gradient-violet">mise en ligne</span></>}
        subtitle="Une méthode claire en 7 étapes, pensée pour vous impliquer au bon moment et livrer sans mauvaise surprise."
      />

      <div className="relative mx-auto mt-16 max-w-3xl">
        {/* ligne verticale animée */}
        <motion.div
          className="absolute left-[27px] top-2 w-px origin-top bg-gradient-to-b from-vanyo-500 via-violet-mid to-transparent sm:left-1/2"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
          style={{ bottom: "2rem" }}
        />

        <div className="space-y-8">
          {PROCESS.map((p, i) => (
            <motion.div
              key={p.step}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className={`relative flex items-start gap-5 sm:w-1/2 ${
                i % 2 === 0 ? "sm:ml-0 sm:pr-10 sm:text-right" : "sm:ml-auto sm:pl-10 sm:flex-row-reverse"
              }`}
            >
              <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-vanyo-500 to-violet-hi text-white shadow-glow">
                <Icon name={p.icon} className="h-6 w-6" />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-vanyo-200 ring-1 ring-vanyo-500/50">
                  {p.step}
                </span>
              </div>
              <div className="gradient-border flex-1 rounded-2xl bg-ink-card/60 p-4">
                <h3 className="font-semibold text-white">{p.title}</h3>
                <p className="mt-1 text-sm text-white/55">{p.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
