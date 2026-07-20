import { ADVANTAGES } from "@/lib/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";

export function WhySection({ limit }: { limit?: number }) {
  const items = limit ? ADVANTAGES.slice(0, limit) : ADVANTAGES;

  return (
    <section className="container-v py-20">
      <SectionHeading
        eyebrow="Pourquoi Vanyo"
        title={<>Des sites conçus pour <span className="text-gradient-violet">vous faire gagner</span></>}
        subtitle="On ne livre pas juste un joli site. On livre un outil rapide, trouvable sur Google et facile à gérer."
      />

      <StaggerGroup
        stagger={0.04}
        className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {items.map((a) => (
          <StaggerItem key={a.title} direction="up">
            <div className="group flex h-full items-start gap-4 rounded-2xl border border-white/8 bg-white/[0.02] p-5 transition-all duration-500 hover:border-vanyo-500/40 hover:bg-white/[0.04]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-vanyo-500/12 text-vanyo-300 ring-1 ring-vanyo-500/25 transition-transform duration-500 group-hover:-translate-y-1">
                <Icon name={a.icon} className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{a.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-white/55">{a.description}</p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
