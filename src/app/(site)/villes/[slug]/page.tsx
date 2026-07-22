import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/sections/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { cityServiceSchema, faqSchema, breadcrumbSchema } from "@/lib/seo/schema";
import { CITIES, getCity } from "@/lib/cities";

export function generateStaticParams() {
  return CITIES.map((c) => ({ slug: c.slug }));
}

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const city = getCity(slug);
  if (!city) return { title: "Ville introuvable" };
  return {
    title: `Création de site internet à ${city.name}`,
    description: `Vanyo accompagne les entreprises, commerces et artisans de ${city.name} (${city.region}) dans la création de sites internet modernes, rapides et bien référencés.`,
    alternates: { canonical: `/villes/${city.slug}` },
  };
}

const COMMON_ADVANTAGES = [
  "Design sur mesure, pensé pour votre secteur d'activité",
  "Site rapide, optimisé pour les Core Web Vitals de Google",
  "Structure SEO complète, locale et nationale",
  "Panel d'administration pour tout modifier vous-même",
  "Accompagnement à distance, réactif et humain",
  "Tarifs identiques partout en France, sans surcoût",
];

export default async function CityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const city = getCity(slug);
  if (!city) notFound();

  return (
    <>
      <JsonLd data={cityServiceSchema(city)} />
      <JsonLd data={faqSchema(city.faq)} />
      <JsonLd data={breadcrumbSchema([
        { label: "Accueil", href: "/" },
        { label: "Villes", href: "/villes" },
        { label: city.name, href: `/villes/${city.slug}` },
      ])} />

      <PageHeader
        eyebrow={`${city.region} · ${city.department}`}
        title={<>Création de site internet à <span className="text-gradient-violet">{city.name}</span></>}
        subtitle={`Un site moderne, rapide et bien référencé pour votre activité à ${city.name} et dans toute l'agglomération.`}
      >
        <ButtonLink href="/devis" size="lg">Demander un devis</ButtonLink>
        <ButtonLink href="/realisations" variant="ghost" size="lg">Voir nos réalisations</ButtonLink>
      </PageHeader>

      <section className="container-v max-w-3xl py-14">
        <p className="flex items-center gap-2 text-sm font-medium text-vanyo-300">
          <MapPin className="h-4 w-4" /> {city.name} · {city.population} habitants environ
        </p>
        <p className="mt-4 text-lg leading-relaxed text-white/70">{city.intro}</p>
      </section>

      <section className="container-v py-6">
        <SectionHeading
          eyebrow={`À ${city.name}`}
          title={<>Nous accompagnons <span className="text-gradient-violet">ces secteurs</span></>}
        />
        <div className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-1">
          {city.sectors.map((s) => (
            <div key={s} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-5 py-4">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-vanyo-400" />
              <span className="text-sm text-white/75">{s}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="container-v py-16">
        <SectionHeading
          eyebrow="Pourquoi Vanyo"
          title={<>Le même niveau d&apos;exigence, <span className="text-gradient-violet">quelle que soit votre ville</span></>}
        />
        <StaggerGroup stagger={0.05} className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-2">
          {COMMON_ADVANTAGES.map((a) => (
            <StaggerItem key={a} direction="up">
              <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-vanyo-400" />
                <span className="text-sm text-white/75">{a}</span>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      <section className="container-v max-w-3xl py-10 pb-24">
        <SectionHeading
          eyebrow="Questions fréquentes"
          title={<>Vos questions sur {city.name}</>}
        />
        <div className="mt-10 space-y-4">
          {city.faq.map((f) => (
            <div key={f.question} className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
              <h3 className="font-semibold text-white">{f.question}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{f.answer}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 rounded-2xl border border-white/8 bg-white/[0.02] p-6 text-center">
          <h3 className="text-lg font-semibold text-white">Un projet à {city.name} ?</h3>
          <p className="mt-1 text-sm text-white/55">Recevez un devis gratuit et personnalisé sous quelques heures.</p>
          <div className="mt-5">
            <ButtonLink href="/devis">Demander un devis</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
