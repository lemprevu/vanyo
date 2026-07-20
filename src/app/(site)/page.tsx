import { Hero } from "@/components/sections/Hero";
import { StatsBar } from "@/components/sections/StatsBar";
import { LogosMarquee } from "@/components/sections/LogosMarquee";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { WhySection } from "@/components/sections/WhySection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Gallery } from "@/components/sections/Gallery";
import { PricingSection } from "@/components/sections/PricingSection";
import { Testimonials } from "@/components/sections/Testimonials";
import { FaqSection } from "@/components/sections/FaqSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <LogosMarquee />
      <ServicesSection limit={6} />
      <WhySection limit={6} />
      <ProcessSection />

      <section className="container-v py-20">
        <SectionHeading
          eyebrow="Réalisations"
          title={<>Nos derniers <span className="text-gradient-violet">projets</span></>}
          subtitle="Un aperçu de sites que nous avons imaginés et développés pour nos clients."
        />
        <div className="mt-12">
          <Gallery withFilters={false} limit={6} />
        </div>
      </section>

      <PricingSection />
      <Testimonials />
      <FaqSection />
    </>
  );
}
