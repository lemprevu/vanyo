import { ArrowRight, Sparkles, Star } from "lucide-react";
import { BrowserMockup } from "./BrowserMockup";
import { Magnetic } from "@/components/ui/Magnetic";
import Link from "next/link";

/**
 * Hero. Les apparitions utilisent des classes CSS pures (voir `.reveal-css`
 * dans globals.css), pas Framer Motion : sur Safari iOS, les animations
 * pilotées en JS peuvent rester bloquées à l'état invisible et casser le
 * contenu au-dessus de la ligne de flottaison. Le CSS déclaratif garantit
 * que le contenu reste visible même si l'animation elle-même a un souci.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="container-v grid items-center gap-14 py-10 lg:grid-cols-[1.05fr_1fr] lg:py-20">
        {/* Colonne gauche */}
        <div>
          <div
            className="reveal-css inline-flex items-center gap-2 rounded-full border border-vanyo-500/30 bg-vanyo-500/10 px-4 py-1.5 text-xs font-medium text-vanyo-200"
            style={{ animationDelay: "0.05s" }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Agence web premium · Sites qui convertissent
          </div>

          <h1
            className="reveal-css mt-6 text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl"
            style={{ animationDelay: "0.12s" }}
          >
            Votre présence en ligne mérite bien plus qu&apos;un{" "}
            <span className="text-gradient-violet">simple site.</span>
          </h1>

          <p
            className="reveal-css mt-6 max-w-xl text-pretty text-lg leading-relaxed text-white/60"
            style={{ animationDelay: "0.22s" }}
          >
            Nous concevons des sites internet modernes, rapides et pensés pour
            convertir vos visiteurs en clients.
          </p>

          <div
            className="reveal-css mt-9 flex flex-wrap items-center gap-3"
            style={{ animationDelay: "0.3s" }}
          >
            <Magnetic strength={0.4}>
              <Link href="/devis" className="btn-premium btn-primary px-7 py-3.5 text-[0.98rem]">
                Demander un devis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Magnetic>
            <Link href="/realisations" className="btn-premium btn-ghost px-7 py-3.5 text-[0.98rem]">
              Voir nos réalisations
            </Link>
          </div>

          <div
            className="reveal-css mt-9 flex items-center gap-4"
            style={{ animationDelay: "0.38s" }}
          >
            <div className="flex -space-x-2.5">
              {["CL", "TN", "SB", "JM"].map((n) => (
                <span
                  key={n}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink bg-gradient-to-br from-vanyo-500 to-violet-hi text-[10px] font-semibold text-white"
                >
                  {n}
                </span>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs text-white/50">180+ clients accompagnés</p>
            </div>
          </div>
        </div>

        {/* Colonne droite : maquette */}
        <div className="relative reveal-css" style={{ animationDelay: "0.15s" }}>
          <BrowserMockup />
        </div>
      </div>
    </section>
  );
}
