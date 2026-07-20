import type { Metadata } from "next";
import { Check, X } from "lucide-react";
import { PageHeader } from "@/components/sections/PageHeader";
import { PricingWithPromo } from "@/components/sections/PricingWithPromo";
import { FaqSection } from "@/components/sections/FaqSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { getPlans } from "@/lib/data";

export const metadata: Metadata = {
  title: "Tarifs",
  description:
    "Des tarifs transparents pour la création de votre site internet : packs Starter, Business, Premium et Sur Mesure. Devis gratuit et sans engagement.",
};

export const revalidate = 60;

const rows: { feature: string; values: (boolean | string)[] }[] = [
  { feature: "Design sur mesure", values: [true, true, true, true] },
  { feature: "Responsive mobile", values: [true, true, true, true] },
  { feature: "Nombre de pages", values: ["1-3", "5-8", "Illimité", "Illimité"] },
  { feature: "SEO", values: ["Base", "Avancé", "Complet", "Complet"] },
  { feature: "Panel administrateur", values: [false, true, true, true] },
  { feature: "Blog / actualités", values: [false, true, true, true] },
  { feature: "E-commerce / espace client", values: [false, false, true, true] },
  { feature: "Nom de domaine + emails", values: [false, true, true, true] },
  { feature: "Hébergement inclus", values: ["Option", "1 an", "1 an", "Sur mesure"] },
  { feature: "Support", values: ["—", "3 mois", "12 mois", "Dédié"] },
];

const cols = ["Starter", "Business", "Premium", "Sur Mesure"];

function Cell({ v }: { v: boolean | string }) {
  if (v === true) return <Check className="mx-auto h-4 w-4 text-vanyo-400" />;
  if (v === false) return <X className="mx-auto h-4 w-4 text-white/20" />;
  return <span className="text-sm text-white/70">{v}</span>;
}

export default async function TarifsPage() {
  const plans = await getPlans();
  return (
    <>
      <PageHeader
        eyebrow="Tarifs"
        title={<>Un prix juste pour un <span className="text-gradient-violet">site d'exception</span></>}
        subtitle="Pas de coûts cachés. Vous savez exactement ce que vous payez, et pourquoi."
      />
      <PricingWithPromo plans={plans} />

      <section className="container-v py-16">
        <SectionHeading eyebrow="Comparatif" title={<>Comparez les <span className="text-gradient-violet">formules</span></>} />
        <Reveal direction="up" className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[640px] border-separate border-spacing-0 overflow-hidden rounded-2xl">
            <thead>
              <tr>
                <th className="bg-white/[0.03] p-4 text-left text-sm font-semibold text-white/70">Fonctionnalité</th>
                {cols.map((c, i) => (
                  <th
                    key={c}
                    className={`p-4 text-center text-sm font-semibold ${
                      i === 1 ? "bg-vanyo-500/12 text-vanyo-200" : "bg-white/[0.03] text-white"
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
                  <td className={`p-4 text-sm text-white/70 ${ri % 2 ? "bg-white/[0.015]" : ""}`}>{r.feature}</td>
                  {r.values.map((v, vi) => (
                    <td
                      key={vi}
                      className={`p-4 text-center ${vi === 1 ? "bg-vanyo-500/[0.06]" : ri % 2 ? "bg-white/[0.015]" : ""}`}
                    >
                      <Cell v={v} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </section>

      <FaqSection />
    </>
  );
}
