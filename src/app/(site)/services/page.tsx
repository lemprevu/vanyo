import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Nos services",
  description:
    "Création de sites vitrines, e-commerce, restaurants, refonte, SEO, hébergement, emails professionnels, maintenance et support. Découvrez tous les services Vanyo.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Nos services"
        title={<>Un savoir-faire <span className="text-gradient-violet">complet</span></>}
        subtitle="Design, développement, référencement, hébergement, maintenance : tout est réuni pour votre réussite en ligne."
      >
        <ButtonLink href="/devis" size="lg">Demander un devis</ButtonLink>
        <ButtonLink href="/realisations" variant="ghost" size="lg">Voir nos réalisations</ButtonLink>
      </PageHeader>
      <ServicesSection />
    </>
  );
}
