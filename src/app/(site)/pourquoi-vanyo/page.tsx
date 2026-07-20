import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { WhySection } from "@/components/sections/WhySection";
import { StatsBar } from "@/components/sections/StatsBar";
import { Testimonials } from "@/components/sections/Testimonials";
import { ButtonLink } from "@/components/ui/Button";
import { getAvis } from "@/lib/data";

export const metadata: Metadata = {
  title: "Pourquoi Vanyo",
  description:
    "Design moderne, performance, SEO, sécurité, support et accompagnement : découvrez pourquoi tant d'entreprises choisissent Vanyo pour leur site internet.",
};

export const revalidate = 60;

export default async function PourquoiPage() {
  const testimonials = await getAvis();
  return (
    <>
      <PageHeader
        eyebrow="Pourquoi Vanyo"
        title={<>Le partenaire de votre <span className="text-gradient-violet">réussite en ligne</span></>}
        subtitle="Nous ne faisons pas que des sites : nous créons des outils qui travaillent pour vous, 24h/24."
      >
        <ButtonLink href="/devis" size="lg">Demander un devis</ButtonLink>
      </PageHeader>
      <StatsBar />
      <WhySection />
      <Testimonials testimonials={testimonials} />
    </>
  );
}
