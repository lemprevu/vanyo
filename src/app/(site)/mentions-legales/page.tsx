import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  robots: { index: false, follow: true },
};

export default function MentionsPage() {
  return (
    <>
      <PageHeader eyebrow="Légal" title="Mentions légales" />
      <section className="container-v max-w-3xl space-y-6 pb-20 text-white/65 leading-relaxed">
        <div>
          <h2 className="mb-2 text-lg font-semibold text-white">Éditeur du site</h2>
          <p>{SITE.name} — {SITE.address}. Email : {SITE.email}. Téléphone : {SITE.phone}.</p>
        </div>
        <div>
          <h2 className="mb-2 text-lg font-semibold text-white">Hébergement</h2>
          <p>Ce site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA.</p>
        </div>
        <div>
          <h2 className="mb-2 text-lg font-semibold text-white">Propriété intellectuelle</h2>
          <p>L'ensemble des contenus de ce site est la propriété de {SITE.name}, sauf mention contraire. Toute reproduction est interdite sans autorisation.</p>
        </div>
        <p className="text-sm text-white/40">Contenu à personnaliser avec vos informations légales réelles (SIRET, directeur de publication, etc.).</p>
      </section>
    </>
  );
}
