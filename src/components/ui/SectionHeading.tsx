import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

/** Titre de section standardisé : eyebrow + titre dégradé + sous-titre. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "center" | "left";
}) {
  return (
    <div
      className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : "text-left"}`}
    >
      {eyebrow && (
        <Reveal direction="fade">
          <span className="inline-flex items-center gap-2 rounded-full border border-vanyo-500/30 bg-vanyo-500/10 px-3.5 py-1 text-xs font-medium uppercase tracking-widest text-vanyo-200">
            <span className="h-1.5 w-1.5 rounded-full bg-vanyo-400" />
            {eyebrow}
          </span>
        </Reveal>
      )}
      <Reveal direction="up" delay={0.05}>
        <h2 className="mt-5 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-[2.75rem] md:leading-[1.1]">
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal direction="up" delay={0.12}>
          <p className="mt-4 text-pretty text-base leading-relaxed text-white/60 sm:text-lg">
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}
