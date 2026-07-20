"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { FAQ } from "@/lib/content";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function FaqSection({ heading = true }: { heading?: boolean }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="container-v py-20">
      {heading && (
        <SectionHeading
          eyebrow="FAQ"
          title={<>Vos questions, <span className="text-gradient-violet">nos réponses</span></>}
          subtitle="Tout ce que vous devez savoir avant de nous confier votre projet."
        />
      )}

      <div className="mx-auto mt-12 max-w-3xl space-y-3">
        {FAQ.map((item, i) => {
          const isOpen = open === i;
          return (
            <div
              key={i}
              className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${
                isOpen ? "border-vanyo-500/40 bg-white/[0.03]" : "border-white/8 bg-white/[0.015]"
              }`}
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={isOpen}
              >
                <span className="font-medium text-white">{item.question}</span>
                <motion.span
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    isOpen ? "bg-vanyo-500 text-white" : "bg-white/8 text-white/70"
                  }`}
                >
                  <Plus className="h-4 w-4" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p className="px-5 pb-5 text-pretty leading-relaxed text-white/60">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
