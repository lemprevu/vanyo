import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Notre processus",
  description:
    "Découvrez comment nous créons votre site en 7 étapes : prise de contact, analyse, maquette, développement, validation, mise en ligne et suivi.",
  alternates: { canonical: "/processus" },
};

export default function ProcessusPage() {
  return (
    <>
      <PageHeader
        eyebrow="Processus"
        title={<>Une méthode <span className="text-gradient-violet">éprouvée</span></>}
        subtitle="Transparence et collaboration à chaque étape. Vous savez toujours où en est votre projet."
      >
        <ButtonLink href="/devis" size="lg">Commencer mon projet</ButtonLink>
      </PageHeader>
      <ProcessSection />
    </>
  );
}
