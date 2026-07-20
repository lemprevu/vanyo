import Link from "next/link";
import { SERVICES } from "@/lib/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlowCard } from "@/components/ui/GlowCard";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";

export function ServicesSection({ limit }: { limit?: number }) {
  const items = limit ? SERVICES.slice(0, limit) : SERVICES;

  return (
    <section id="services" className="container-v py-14 sm:py-20">
      <SectionHeading
        eyebrow="Nos services"
        title={<>Tout ce qu'il faut pour <span className="text-gradient-violet">réussir en ligne</span></>}
        subtitle="De la création au référencement, en passant par l'hébergement et le support : un accompagnement complet et sans prise de tête."
      />

      <StaggerGroup
        stagger={0.05}
        className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {items.map((s) => (
          <StaggerItem key={s.slug} direction="up">
            <GlowCard className="h-full">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-vanyo-500/25 to-violet-hi/15 text-vanyo-200 ring-1 ring-vanyo-500/30 transition-transform duration-500 group-hover:scale-110">
                <Icon name={s.icon} className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{s.description}</p>
            </GlowCard>
          </StaggerItem>
        ))}
      </StaggerGroup>

      {limit && (
        <div className="mt-10 text-center">
          <Link href="/services" className="btn-premium btn-ghost px-6 py-3">
            Voir tous nos services
          </Link>
        </div>
      )}
    </section>
  );
}
