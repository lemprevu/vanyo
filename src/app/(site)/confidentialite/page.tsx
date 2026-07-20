import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  robots: { index: false, follow: true },
};

export default function ConfidentialitePage() {
  return (
    <>
      <PageHeader eyebrow="Légal" title="Politique de confidentialité" />
      <section className="container-v max-w-3xl space-y-6 pb-20 text-white/65 leading-relaxed">
        <p>{SITE.name} accorde une grande importance à la protection de vos données personnelles.</p>
        <div>
          <h2 className="mb-2 text-lg font-semibold text-white">Données collectées</h2>
          <p>Nous collectons uniquement les données que vous nous transmettez via nos formulaires (contact, devis) : nom, email, téléphone et informations relatives à votre projet.</p>
        </div>
        <div>
          <h2 className="mb-2 text-lg font-semibold text-white">Utilisation</h2>
          <p>Ces données servent exclusivement à traiter votre demande et à vous recontacter. Elles ne sont jamais revendues.</p>
        </div>
        <div>
          <h2 className="mb-2 text-lg font-semibold text-white">Vos droits</h2>
          <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données en écrivant à {SITE.email}.</p>
        </div>
      </section>
    </>
  );
}
