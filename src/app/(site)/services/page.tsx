import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { ButtonLink } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { serviceSchema, breadcrumbSchema } from "@/lib/seo/schema";
import { SERVICES } from "@/lib/content";

export const metadata: Metadata = {
  title: "Nos services",
  description:
    "Création de sites vitrines, e-commerce, restaurants, refonte, SEO, hébergement, emails professionnels, maintenance et support. Découvrez tous les services Vanyo.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <JsonLd data={serviceSchema(SERVICES)} />
      <JsonLd data={breadcrumbSchema([{ label: "Accueil", href: "/" }, { label: "Services", href: "/services" }])} />
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
