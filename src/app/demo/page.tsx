import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { METIERS } from "@/lib/demo/metiers";

export const metadata: Metadata = {
  title: "Démo du panel client — choisissez votre secteur | Vanyo",
  description: "Testez un panel d'administration adapté à votre métier : restaurant, immobilier, boutique, artisan et plus.",
  robots: { index: false, follow: false },
};

export default function DemoChooserPage() {
  return (
    <div className="min-h-screen bg-ink text-white">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:py-16">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark size={28} />
            <span className="text-lg font-semibold">Van<span className="text-gradient-violet">yo</span></span>
          </Link>
          <Link href="/" className="glass inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-white/70 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Retour au site
          </Link>
        </div>

        <div className="mt-12 max-w-2xl">
          <span className="inline-flex items-center rounded-full border border-vanyo-500/30 bg-vanyo-500/10 px-3 py-1 text-xs font-medium text-vanyo-200">
            Démonstration interactive
          </span>
          <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
            Choisissez votre <span className="text-gradient-violet">secteur</span>
          </h1>
          <p className="mt-3 text-white/60">
            Découvrez le panel d&apos;administration que vous auriez avec Vanyo, adapté à votre métier.
            Tout est réel et modifiable — aucune donnée réelle, rien à installer.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {METIERS.map((m) => (
            <Link
              key={m.id}
              href={`/demo/${m.id}`}
              className="group gradient-border relative flex flex-col rounded-2xl bg-ink-card/60 p-5 transition-transform duration-300 hover:-translate-y-1"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl ring-1 ring-white/10"
                style={{ backgroundColor: `${m.accent}22`, color: m.accent }}
              >
                <m.icon className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-white">{m.label}</h2>
              <p className="mt-1 flex-1 text-sm text-white/55">{m.tagline}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-white/40">Ex. « {m.businessName} »</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/60 transition-colors group-hover:bg-vanyo-500 group-hover:text-white">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-white/35">
          Vous ne trouvez pas votre activité ? Nous adaptons chaque panel sur mesure — <Link href="/contact" className="text-vanyo-200 hover:text-white">parlons-en</Link>.
        </p>
      </div>
    </div>
  );
}
