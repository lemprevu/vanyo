import type { Metadata } from "next";
import { Clock, ShieldCheck, Gift } from "lucide-react";
import { PageHeader } from "@/components/sections/PageHeader";
import { DevisForm } from "./DevisForm";

export const metadata: Metadata = {
  title: "Demande de devis",
  description:
    "Demandez votre devis gratuit et personnalisé pour la création de votre site internet. Réponse sous quelques heures, sans engagement.",
};

const perks = [
  { Icon: Gift, title: "Gratuit & sans engagement", text: "Aucun frais, aucune obligation." },
  { Icon: Clock, title: "Réponse rapide", text: "Une proposition sous quelques heures." },
  { Icon: ShieldCheck, title: "Données protégées", text: "Vos informations restent confidentielles." },
];

export default function DevisPage() {
  return (
    <>
      <PageHeader
        eyebrow="Demande de devis"
        title={<>Obtenez votre <span className="text-gradient-violet">devis gratuit</span></>}
        subtitle="Quelques minutes suffisent. Plus vous nous en dites, plus notre proposition sera précise."
      />

      <section className="container-v pb-20">
        <div className="mb-8 grid gap-3 sm:grid-cols-3">
          {perks.map(({ Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vanyo-500/12 text-vanyo-300 ring-1 ring-vanyo-500/25">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{title}</div>
                <div className="text-xs text-white/50">{text}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto max-w-3xl">
          <DevisForm />
        </div>
      </section>
    </>
  );
}
