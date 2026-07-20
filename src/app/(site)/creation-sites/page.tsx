import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlowCard } from "@/components/ui/GlowCard";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { ButtonLink } from "@/components/ui/Button";
import { getPlans } from "@/lib/data";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Création de sites internet",
  description:
    "Création de sites vitrines, e-commerce, restaurants, immobilier, portfolios et applications web. Des sites sur mesure, rapides et optimisés pour convertir.",
};

const TYPES = [
  { icon: "Globe", title: "Site vitrine", text: "Présentez votre activité avec élégance et gagnez la confiance de vos visiteurs.", pour: "Artisans, PME, professions libérales" },
  { icon: "UtensilsCrossed", title: "Site restaurant", text: "Menu digital, réservation en ligne, galerie appétissante et avis clients.", pour: "Restaurants, bars, traiteurs" },
  { icon: "ShoppingCart", title: "Site e-commerce", text: "Vendez en ligne 24h/24 avec un tunnel d'achat fluide et sécurisé.", pour: "Commerces, marques, créateurs" },
  { icon: "LayoutGrid", title: "Portfolio", text: "Sublimez vos créations avec une mise en scène immersive.", pour: "Photographes, artistes, freelances" },
  { icon: "Rocket", title: "Landing page", text: "Une page unique ultra-optimisée pour transformer vos visiteurs en leads.", pour: "Lancements, campagnes, événements" },
  { icon: "RefreshCw", title: "Refonte de site", text: "On modernise votre site sans perdre votre référencement existant.", pour: "Sites vieillissants ou lents" },
];

export default async function CreationSitesPage() {
  const plans = await getPlans();
  return (
    <>
      <PageHeader
        eyebrow="Création de sites"
        title={<>Le site qu'il vous faut, <span className="text-gradient-violet">quel que soit votre métier</span></>}
        subtitle="Chaque activité a ses besoins. Nous concevons le type de site parfaitement adapté au vôtre."
      >
        <ButtonLink href="/devis" size="lg">Demander un devis</ButtonLink>
        <ButtonLink href="/realisations" variant="ghost" size="lg">Voir des exemples</ButtonLink>
      </PageHeader>

      <section className="container-v py-16">
        <StaggerGroup stagger={0.06} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TYPES.map((t) => (
            <StaggerItem key={t.title} direction="up" className="h-full">
              <GlowCard className="h-full">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-vanyo-500/25 to-violet-hi/15 text-vanyo-200 ring-1 ring-vanyo-500/30 transition-transform duration-500 group-hover:scale-110">
                  <Icon name={t.icon} className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{t.text}</p>
                <p className="mt-4 text-xs font-medium uppercase tracking-wide text-vanyo-300/80">
                  Pour : {t.pour}
                </p>
              </GlowCard>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      <div className="container-v">
        <SectionHeading
          eyebrow="Toujours inclus"
          title={<>Ce que vous obtenez <span className="text-gradient-violet">à chaque fois</span></>}
        />
        <div className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-2">
          {[
            "Design 100% sur mesure",
            "Site rapide et optimisé SEO",
            "Parfaitement responsive",
            "Panel d'administration",
            "Formulaires de contact / devis",
            "Mise en ligne clé en main",
          ].map((f) => (
            <div key={f} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
              <Icon name="CheckCircle2" className="h-5 w-5 text-vanyo-400" />
              <span className="text-sm text-white/75">{f}</span>
            </div>
          ))}
        </div>
      </div>

      <ProcessSection />
      <PricingSection plans={plans} />
    </>
  );
}
