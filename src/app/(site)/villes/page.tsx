import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/sections/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { CITIES } from "@/lib/cities";

export const metadata: Metadata = {
  title: "Création de site internet partout en France",
  description:
    "Vanyo accompagne des clients dans toute la France : Nantes, Paris, Lyon, Bordeaux, Toulouse, Rennes et bien d'autres villes. Découvrez notre approche locale.",
  alternates: { canonical: "/villes" },
};

export default function VillesPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ label: "Accueil", href: "/" }, { label: "Villes", href: "/villes" }])} />
      <PageHeader
        eyebrow="Partout en France"
        title={<>Un accompagnement local, <span className="text-gradient-violet">où que vous soyez</span></>}
        subtitle="Vanyo travaille à distance avec des clients dans toute la France. Découvrez notre approche pour votre ville."
      >
        <ButtonLink href="/devis" size="lg">Demander un devis</ButtonLink>
      </PageHeader>

      <section className="container-v py-16">
        <StaggerGroup stagger={0.04} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CITIES.map((c) => (
            <StaggerItem key={c.slug} direction="up">
              <Link
                href={`/villes/${c.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-white/8 bg-white/[0.02] p-5 transition-all duration-300 hover:border-vanyo-500/40 hover:bg-white/[0.04]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-vanyo-500/12 text-vanyo-300 ring-1 ring-vanyo-500/25">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="font-semibold text-white">{c.name}</h2>
                    <p className="text-xs text-white/40">{c.region}</p>
                  </div>
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-white/55">{c.intro.slice(0, 110)}…</p>
                <span className="mt-4 flex items-center gap-1.5 text-sm font-medium text-vanyo-200 group-hover:text-white">
                  Voir la page {c.name} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <p className="mt-10 text-center text-sm text-white/40">
          Votre ville n&apos;apparaît pas dans la liste ? Nous intervenons partout en France —{" "}
          <Link href="/contact" className="text-vanyo-200 hover:text-white">contactez-nous</Link>.
        </p>
      </section>
    </>
  );
}
