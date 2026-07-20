import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { PLANS, type Plan } from "@/lib/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";

export function PricingSection({ heading = true, plans = PLANS }: { heading?: boolean; plans?: Plan[] }) {
  return (
    <section className="container-v py-20">
      {heading && (
        <SectionHeading
          eyebrow="Tarifs"
          title={<>Des offres claires, <span className="text-gradient-violet">sans surprise</span></>}
          subtitle="Choisissez la formule qui vous ressemble. Chaque projet reste unique : le prix final dépend de vos besoins."
        />
      )}

      <StaggerGroup
        stagger={0.08}
        className="mt-14 grid gap-5 lg:grid-cols-4"
      >
        {plans.map((plan) => (
          <StaggerItem key={plan.name} direction="up" className="h-full">
            <div
              className={`relative flex h-full flex-col rounded-2xl p-6 transition-transform duration-500 hover:-translate-y-2 ${
                plan.highlight
                  ? "gradient-border bg-ink-card shadow-glow-strong"
                  : "border border-white/8 bg-white/[0.02]"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-to-r from-vanyo-500 to-violet-hi px-3 py-1 text-xs font-semibold text-white">
                  <Sparkles className="h-3 w-3" /> Le plus choisi
                </span>
              )}
              <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
              <p className="mt-1 text-sm text-white/50">{plan.description}</p>
              <div className="mt-5">
                {plan.priceNote && (
                  <span className="text-xs text-white/45">{plan.priceNote}</span>
                )}
                <div className="text-3xl font-bold tracking-tight text-white">{plan.price}</div>
              </div>
              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-vanyo-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/devis"
                className={`btn-premium mt-7 w-full py-3 text-sm ${
                  plan.highlight ? "btn-primary" : "btn-ghost"
                }`}
              >
                Demander un devis
              </Link>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
