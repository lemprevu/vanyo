"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { PROJECTS, PROJECT_CATEGORIES, type Project } from "@/lib/content";

/** Résout le lien d'un projet : URL externe si définie, sinon la page devis. */
function projectHref(p: Project) {
  return p.link && p.link.trim() ? p.link : "/devis";
}
function isExternal(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

export function Gallery({
  withFilters = true,
  limit,
  projects = PROJECTS,
}: {
  withFilters?: boolean;
  limit?: number;
  projects?: Project[];
}) {
  const [active, setActive] = useState("Tous");

  const base = limit ? projects.slice(0, limit) : projects;
  const filtered =
    active === "Tous" ? base : base.filter((p) => p.category === active);

  return (
    <div>
      {withFilters && (
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {PROJECT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                active === cat ? "text-white" : "text-white/55 hover:text-white"
              }`}
            >
              {active === cat && (
                <motion.span
                  layoutId="filter-active"
                  className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-vanyo-500 to-violet-hi"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              {cat}
            </button>
          ))}
        </div>
      )}

      <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((p) => {
            const href = projectHref(p);
            const external = isExternal(href);
            return (
              <motion.article
                key={p.slug}
                layout
                initial={{ opacity: 0.5, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.5, scale: 0.92 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="group gradient-border overflow-hidden rounded-2xl bg-ink-card/70"
              >
                {external ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="block">
                    <ProjectVisual p={p} />
                  </a>
                ) : (
                  <Link href={href} className="block">
                    <ProjectVisual p={p} />
                  </Link>
                )}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white">{p.title}</h3>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.tags.map((t) => (
                      <span key={t} className="rounded-md bg-white/6 px-2 py-1 text-xs text-white/60">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function ProjectVisual({ p }: { p: Project }) {
  return (
    <div className={`relative aspect-[16/10] overflow-hidden bg-gradient-to-br ${p.color}`}>
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-white/80">{p.title}</span>
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-ink/70 opacity-0 backdrop-blur-sm transition-opacity duration-500 group-hover:opacity-100">
        <span className="btn-premium btn-primary px-5 py-2.5 text-sm">
          Voir le projet <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
      <span className="absolute left-3 top-3 rounded-full bg-ink/70 px-3 py-1 text-xs font-medium text-white backdrop-blur">
        {p.category}
      </span>
    </div>
  );
}
