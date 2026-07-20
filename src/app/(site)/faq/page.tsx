import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { FaqSection } from "@/components/sections/FaqSection";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Questions fréquentes sur la création de sites internet avec Vanyo : prix, délais, référencement, hébergement, maintenance et plus encore.",
};

export default function FaqPage() {
  return (
    <>
      <PageHeader
        eyebrow="FAQ"
        title={<>Des réponses <span className="text-gradient-violet">claires</span></>}
        subtitle="Vous ne trouvez pas votre réponse ? Contactez-nous, on répond sous quelques heures."
      >
        <ButtonLink href="/contact" variant="ghost" size="lg">Poser une question</ButtonLink>
      </PageHeader>
      <FaqSection heading={false} />
    </>
  );
}
