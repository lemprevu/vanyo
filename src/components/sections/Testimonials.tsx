"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { TESTIMONIALS, type Testimonial } from "@/lib/content";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Testimonials({ testimonials = TESTIMONIALS }: { testimonials?: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, [paused, testimonials.length]);

  const t = testimonials[index];

  const go = (dir: number) =>
    setIndex((i) => (i + dir + testimonials.length) % testimonials.length);

  return (
    <section
      className="container-v py-14 sm:py-20"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <SectionHeading
        eyebrow="Avis clients"
        title={<>Ils nous ont fait <span className="text-gradient-violet">confiance</span></>}
        subtitle="La satisfaction de nos clients est notre meilleure vitrine."
      />

      <div className="relative mx-auto mt-14 max-w-3xl">
        <div className="gradient-border relative min-h-[280px] overflow-hidden rounded-3xl bg-ink-card/70 p-8 sm:p-12">
          <Quote className="absolute right-8 top-8 h-16 w-16 text-vanyo-500/15" />
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-0.5 text-amber-400">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-5 text-pretty text-xl leading-relaxed text-white/85 sm:text-2xl">
                « {t.quote} »
              </p>
              <div className="mt-7 flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-vanyo-500 to-violet-hi font-semibold text-white">
                  {t.initials}
                </span>
                <div>
                  <div className="font-semibold text-white">{t.name}</div>
                  <div className="text-sm text-white/50">{t.company}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => go(-1)}
            aria-label="Précédent"
            className="glass flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:border-vanyo-500/50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-1.5">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Avis ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-vanyo-400" : "w-2 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => go(1)}
            aria-label="Suivant"
            className="glass flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:border-vanyo-500/50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
