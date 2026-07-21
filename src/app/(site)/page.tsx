import { Hero } from "@/components/sections/Hero";
import { StatsBar } from "@/components/sections/StatsBar";
import { LogosMarquee } from "@/components/sections/LogosMarquee";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { WhySection } from "@/components/sections/WhySection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { DemoCallout } from "@/components/sections/DemoCallout";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Gallery } from "@/components/sections/Gallery";
import { PricingWithPromo } from "@/components/sections/PricingWithPromo";
import { Testimonials } from "@/components/sections/Testimonials";
import { FaqSection } from "@/components/sections/FaqSection";
import { getRealisations, getAvis, getPlans, getSiteSettings } from "@/lib/data";

export const revalidate = 60;

export default async function HomePage() {
  const [projects, testimonials, plans, settings] = await Promise.all([
    getRealisations(), getAvis(), getPlans(), getSiteSettings(),
  ]);

  // Sections activées depuis /admin/parametres → Apparence.
  const on = (key: string) => settings.home_sections.includes(key);

  return (
    <>
      <Hero />
      {on("stats") && <StatsBar />}
      {on("logos") && <LogosMarquee />}
      {on("services") && <ServicesSection limit={6} />}
      {on("why") && <WhySection limit={6} />}

      <DemoCallout />

      {on("process") && <ProcessSection />}

      {on("realisations") && (
        <section className="container-v py-14 sm:py-20">
          <SectionHeading
            eyebrow="Réalisations"
            title={<>Nos derniers <span className="text-gradient-violet">projets</span></>}
            subtitle="Un aperçu de sites que nous avons imaginés et développés pour nos clients."
          />
          <div className="mt-12">
            <Gallery withFilters={false} limit={6} projects={projects} />
          </div>
        </section>
      )}

      {on("pricing") && <PricingWithPromo plans={plans} settings={settings} />}
      {on("testimonials") && <Testimonials testimonials={testimonials} />}
      {on("faq") && <FaqSection />}
    </>
  );
}
