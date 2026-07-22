import type { Metadata } from "next";
import { Star } from "lucide-react";
import { PageHeader } from "@/components/sections/PageHeader";
import { Testimonials } from "@/components/sections/Testimonials";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { GlowCard } from "@/components/ui/GlowCard";
import { getAvis, getSiteSettings } from "@/lib/data";
import { LeaveReviewForm } from "./LeaveReviewForm";

export const metadata: Metadata = {
  title: "Avis clients",
  description:
    "Ce que nos clients pensent de Vanyo : restaurants, entreprises, commerces et associations témoignent de leur expérience.",
  alternates: { canonical: "/avis" },
};

export const revalidate = 60;

export default async function AvisPage() {
  const [testimonials, settings] = await Promise.all([getAvis(), getSiteSettings()]);
  return (
    <>
      <PageHeader
        eyebrow="Avis clients"
        title={<>La parole à <span className="text-gradient-violet">nos clients</span></>}
        subtitle="Des dizaines d'entreprises nous font confiance. Voici pourquoi."
      />
      <Testimonials testimonials={testimonials} />
      <section className="container-v pb-20">
        <StaggerGroup stagger={0.06} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <StaggerItem key={t.name} direction="up" className="h-full">
              <GlowCard className="h-full">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-white/70">« {t.quote} »</p>
                <div className="mt-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-vanyo-500 to-violet-hi text-sm font-semibold text-white">
                    {t.initials}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-white/50">{t.company}</div>
                  </div>
                </div>
              </GlowCard>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>
      <section className="container-v max-w-2xl pb-24">
        <LeaveReviewForm turnstileKey={settings.turnstile_site_key} />
      </section>
    </>
  );
}
