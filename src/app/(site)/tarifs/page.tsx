import type { Metadata } from "next";
import Link from "next/link";
import { Check, X, Rocket, Wrench, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/sections/PageHeader";
import { PricingWithPromo } from "@/components/sections/PricingWithPromo";
import { FaqSection } from "@/components/sections/FaqSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { getPlans, getSiteSettings } from "@/lib/data";
import { resolveCatalog, buildCompareRows } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Tarifs",
  description:
    "Des tarifs transparents pour la création de votre site internet : packs Starter, Business, Premium et Sur Mesure, mise en ligne et maintenance mensuelle. Devis gratuit et sans engagement.",
  alternates: { canonical: "/tarifs" },
};

export const revalidate = 60;

const euro = (n: number) => n.toLocaleString("fr-FR") + " €";

function Cell({ v }: { v: boolean | string }) {
  if (v === true) return <Check className="mx-auto h-4 w-4 text-vanyo-400" />;
  if (v === false) return <X className="mx-auto h-4 w-4 text-white/20" />;
  return <span className="text-[13px] text-white/70">{v}</span>;
}

export default async function TarifsPage() {
  const [plans, settings] = await Promise.all([getPlans(), getSiteSettings()]);

  // Le comparatif, la mise en ligne et la maintenance sont générés à partir du
  // catalogue effectif (valeurs par défaut + vos tarifs personnalisés) : ils ne
  // peuvent donc pas diverger de ce que facture le formulaire de devis.
  const catalog = resolveCatalog(settings.catalog);
  const { packs, deploiements, maintenancePlans, maintenanceOptions } = catalog;
  const rows = buildCompareRows(catalog);
  const cols = packs.map((p) => p.name);
  const highlightIndex = packs.findIndex((p) => p.highlight);

  return (
    <>
      <PageHeader
        eyebrow="Tarifs"
        title={<>Un prix juste pour un <span className="text-gradient-violet">site d&apos;exception</span></>}
        subtitle="Pas de coûts cachés. Vous savez exactement ce que vous payez, et pourquoi."
      />

      <PricingWithPromo plans={plans} settings={settings} />

      {/* ---------- Mise en ligne ---------- */}
      <section className="container-v py-12 sm:py-16">
        <SectionHeading
          eyebrow="Mise en ligne"
          title={<>Votre site <span className="text-gradient-violet">en ligne</span>, sans y toucher</>}
          subtitle="La création du site et sa mise en ligne sont deux choses distinctes. Choisissez ce que vous nous confiez — le nom de domaine (votre adresse .fr ou .com) est facturé en supplément."
        />
        <Reveal direction="up" className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {deploiements.map((d) => (
            <div
              key={d.key}
              className="flex h-full flex-col rounded-2xl border border-white/8 bg-white/[0.02] p-5 transition-transform duration-500 hover:-translate-y-1"
            >
              <Rocket className="h-5 w-5 text-vanyo-400" />
              <h3 className="mt-3 text-base font-semibold text-white">{d.label}</h3>
              <p className="mt-1.5 text-sm leading-snug text-white/50">{d.description}</p>
              <div className="mt-4 text-2xl font-bold tracking-tight text-white">
                {d.price === 0 ? "Offert" : euro(d.price)}
                {d.price > 0 && <span className="text-sm font-normal text-white/40"> une fois</span>}
              </div>
              <ul className="mt-4 flex-1 space-y-2">
                {d.includes.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px] leading-snug text-white/65">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-vanyo-400" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Reveal>
      </section>

      {/* ---------- Maintenance mensuelle ---------- */}
      <section className="container-v py-12 sm:py-16">
        <SectionHeading
          eyebrow="Maintenance"
          title={<>On garde votre site <span className="text-gradient-violet">en pleine forme</span></>}
          subtitle="Sans engagement, résiliable à tout moment. Composez votre formule : une base, puis uniquement les suppléments dont vous avez besoin."
        />

        <Reveal direction="up" className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {maintenancePlans.map((p) => (
            <div
              key={p.key}
              className={`relative flex h-full flex-col rounded-2xl p-5 transition-transform duration-500 hover:-translate-y-1 ${
                p.recommended ? "gradient-border bg-ink-card shadow-glow" : "border border-white/8 bg-white/[0.02]"
              }`}
            >
              {p.recommended && (
                <span className="absolute -top-2.5 left-5 rounded-full bg-gradient-to-r from-vanyo-500 to-violet-hi px-2.5 py-0.5 text-[11px] font-semibold text-white">
                  Recommandé
                </span>
              )}
              <Wrench className="h-5 w-5 text-vanyo-400" />
              <h3 className="mt-3 text-base font-semibold text-white">{p.label}</h3>
              <p className="mt-1.5 text-sm leading-snug text-white/50">{p.description}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-2xl font-bold tracking-tight text-white">{euro(p.price)}</span>
                {p.price > 0 && <span className="text-sm text-white/40">/ mois</span>}
              </div>
              <ul className="mt-4 flex-1 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px] leading-snug text-white/65">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-vanyo-400" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Reveal>

        {/* Suppléments mensuels */}
        <Reveal direction="up" className="mt-8">
          <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 sm:p-6">
            <h3 className="text-base font-semibold text-white">Suppléments mensuels, à la carte</h3>
            <p className="mt-1 text-sm text-white/50">
              Cumulables avec n&apos;importe quelle formule de maintenance. Ajoutés ou retirés quand vous le souhaitez.
            </p>
            <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {maintenanceOptions.map((o) => (
                <li
                  key={o.key}
                  className="flex items-start justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-3.5"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-white">{o.label}</span>
                    <span className="mt-0.5 block text-xs leading-snug text-white/45">{o.description}</span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-vanyo-200">+{o.price} €</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      {/* ---------- Comparatif ---------- */}
      <section className="container-v py-12 sm:py-16">
        <SectionHeading
          eyebrow="Comparatif"
          title={<>Comparez les <span className="text-gradient-violet">formules</span></>}
          subtitle="Ce qui est compris dans chaque formule, et le prix de ce qui ne l'est pas. Ce sont exactement les tarifs appliqués par notre configurateur de devis."
        />

        <Reveal direction="up" className="mt-10">
          {/* La table défile horizontalement dans son propre conteneur :
              la page, elle, ne déborde jamais sur mobile. */}
          <div className="-mx-6 overflow-x-auto px-6 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[680px] border-separate border-spacing-0 overflow-hidden rounded-2xl">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-ink-soft p-3 text-left text-xs font-semibold text-white/70 sm:bg-white/[0.03] sm:p-4 sm:text-sm">
                    Fonctionnalité
                  </th>
                  {cols.map((c, i) => (
                    <th
                      key={c}
                      className={`p-3 text-center text-xs font-semibold sm:p-4 sm:text-sm ${
                        i === highlightIndex ? "bg-vanyo-500/12 text-vanyo-200" : "bg-white/[0.03] text-white"
                      }`}
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, ri) => (
                  <tr key={r.feature}>
                    <td
                      className={`sticky left-0 z-10 p-3 text-xs text-white/70 sm:p-4 sm:text-sm ${
                        ri % 2 ? "bg-[#0c0c10] sm:bg-white/[0.015]" : "bg-ink-soft sm:bg-transparent"
                      }`}
                    >
                      {r.feature}
                    </td>
                    {r.values.map((v, vi) => (
                      <td
                        key={vi}
                        className={`p-3 text-center sm:p-4 ${
                          vi === highlightIndex ? "bg-vanyo-500/[0.06]" : ri % 2 ? "bg-white/[0.015]" : ""
                        }`}
                      >
                        <Cell v={v} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-center text-xs text-white/35 sm:hidden">
            Faites glisser le tableau horizontalement pour voir toutes les formules.
          </p>
        </Reveal>

        <div className="mt-10 text-center">
          <p className="text-sm text-white/55">
            Un doute sur la formule qui vous convient ? Le configurateur calcule votre prix en direct.
          </p>
          <Link href="/devis" className="btn-premium btn-primary mt-4 px-6 py-3 text-sm">
            Configurer mon devis <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <FaqSection />
    </>
  );
}
