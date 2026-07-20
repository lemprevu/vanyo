"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Search, Calendar, Clock, ArrowUpRight } from "lucide-react";
import { ARTICLES } from "@/lib/content";

const CATEGORIES = ["Tous", ...Array.from(new Set(ARTICLES.map((a) => a.category)))];

export function BlogList() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("Tous");

  const filtered = useMemo(() => {
    return ARTICLES.filter((a) => {
      const matchCat = cat === "Tous" || a.category === cat;
      const matchQuery =
        a.title.toLowerCase().includes(query.toLowerCase()) ||
        a.excerpt.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [query, cat]);

  return (
    <div className="container-v py-8 pb-20">
      {/* Recherche + filtres */}
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un article…"
            className="w-full rounded-full border border-white/10 bg-white/[0.03] py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/40 outline-none transition-colors focus:border-vanyo-500/60"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                cat === c
                  ? "bg-gradient-to-r from-vanyo-500 to-violet-hi text-white"
                  : "border border-white/10 text-white/55 hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((a) => (
            <motion.article
              key={a.slug}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <Link
                href={`/blog/${a.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/8 bg-ink-card/60 transition-colors hover:border-vanyo-500/40"
              >
                <div className={`relative aspect-[16/9] overflow-hidden bg-gradient-to-br ${a.color}`}>
                  <div className="absolute inset-0 bg-grid opacity-30" />
                  <span className="absolute left-3 top-3 rounded-full bg-ink/70 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                    {a.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-semibold leading-snug text-white transition-colors group-hover:text-vanyo-200">
                    {a.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-white/55">{a.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-white/40">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(a.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" /> {a.readingTime}
                    </span>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-vanyo-200">
                    Lire l'article <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <p className="py-16 text-center text-white/50">Aucun article ne correspond à votre recherche.</p>
      )}
    </div>
  );
}
