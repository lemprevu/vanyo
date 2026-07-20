import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";

/** En-tête standard des pages internes. */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-vanyo-500/20 blur-[110px]" />
      <div className="container-v relative py-16 text-center sm:py-20">
        <Reveal direction="fade">
          <span className="inline-flex items-center gap-2 rounded-full border border-vanyo-500/30 bg-vanyo-500/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-vanyo-200">
            <span className="h-1.5 w-1.5 rounded-full bg-vanyo-400" />
            {eyebrow}
          </span>
        </Reveal>
        <Reveal direction="up" delay={0.05}>
          <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-[3.25rem] md:leading-[1.08]">
            {title}
          </h1>
        </Reveal>
        {subtitle && (
          <Reveal direction="up" delay={0.12}>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-white/60">
              {subtitle}
            </p>
          </Reveal>
        )}
        {children && (
          <Reveal direction="up" delay={0.18}>
            <div className="mt-8 flex flex-wrap justify-center gap-3">{children}</div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
