import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { Gallery } from "@/components/sections/Gallery";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Réalisations",
  description:
    "Découvrez notre portfolio : sites de restaurants, entreprises, agences immobilières, associations, commerces, portfolios et landing pages réalisés par Vanyo.",
};

export default function RealisationsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Réalisations"
        title={<>Des projets qui <span className="text-gradient-violet">parlent d'eux-mêmes</span></>}
        subtitle="Filtrez par secteur et explorez les sites que nous avons conçus."
      />
      <section className="container-v py-8 pb-20">
        <Gallery />
        <div className="mt-14 text-center">
          <ButtonLink href="/devis" size="lg">Lancer mon projet</ButtonLink>
        </div>
      </section>
    </>
  );
}
