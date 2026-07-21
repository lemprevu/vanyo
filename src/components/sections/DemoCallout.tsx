import Link from "next/link";
import {
  ArrowRight, LayoutDashboard, FileText, Star, Settings,
  Sparkles, MousePointerClick, ShieldCheck,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const POINTS = [
  { icon: Sparkles, text: "Modifiez textes, photos, tarifs et articles en quelques clics" },
  { icon: MousePointerClick, text: "Suivez vos demandes de devis et messages en temps réel" },
  { icon: ShieldCheck, text: "Aucune compétence technique — et aucun risque de casser le site" },
];

/** Bloc d'accueil qui invite à essayer le panel d'administration en démo. */
export function DemoCallout() {
  return (
    <section className="container-v py-14 sm:py-20">
      <SectionHeading
        eyebrow="Panel client"
        title={<>Gérez votre site <span className="text-gradient-violet">vous-même</span></>}
        subtitle="Chaque site Vanyo est livré avec un espace d'administration simple et puissant. Testez-le dès maintenant, sans inscription."
      />

      <div className="mt-12 grid items-center gap-8 lg:grid-cols-2">
        {/* Texte + arguments + CTA */}
        <Reveal direction="right">
          <div>
            <ul className="space-y-4">
              {POINTS.map((p) => (
                <li key={p.text} className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-vanyo-500/12 text-vanyo-300 ring-1 ring-vanyo-500/25">
                    <p.icon className="h-5 w-5" />
                  </span>
                  <span className="pt-1.5 text-sm leading-relaxed text-white/70 sm:text-base">{p.text}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/demo" className="btn-premium btn-primary px-6 py-3.5 text-sm">
                Essayer le panel en démo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="text-xs text-white/45">
                Démo interactive · aucune donnée réelle · rien à installer
              </span>
            </div>
          </div>
        </Reveal>

        {/* Mini-aperçu du panel */}
        <Reveal direction="left" delay={0.1}>
          <div className="gradient-border overflow-hidden rounded-3xl bg-ink-card/60 shadow-glow">
            {/* Barre de fenêtre */}
            <div className="flex items-center gap-1.5 border-b border-white/8 bg-ink-soft/80 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
              <span className="ml-3 truncate text-xs text-white/40">votresite.fr/admin</span>
            </div>

            <div className="flex">
              {/* Sidebar factice */}
              <div className="hidden w-40 shrink-0 space-y-1 border-r border-white/8 bg-ink-soft/50 p-3 sm:block">
                {[
                  { icon: LayoutDashboard, label: "Dashboard", active: true },
                  { icon: FileText, label: "Devis" },
                  { icon: Star, label: "Avis" },
                  { icon: Settings, label: "Paramètres" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs ${
                      item.active ? "bg-vanyo-500/15 text-white ring-1 ring-vanyo-500/30" : "text-white/55"
                    }`}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                  </div>
                ))}
              </div>

              {/* Contenu factice */}
              <div className="flex-1 space-y-3 p-4">
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { v: "142", l: "Demandes", a: "text-vanyo-200" },
                    { v: "34%", l: "Conversion", a: "text-emerald-300" },
                    { v: "8,2k", l: "Visiteurs", a: "text-amber-300" },
                  ].map((s) => (
                    <div key={s.l} className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
                      <div className={`text-lg font-bold ${s.a}`}>{s.v}</div>
                      <div className="text-[10px] text-white/45">{s.l}</div>
                    </div>
                  ))}
                </div>

                {/* Faux graphique */}
                <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
                  <div className="mb-2 flex items-end gap-1.5">
                    {[40, 60, 45, 80, 65, 90, 75].map((h, i) => (
                      <span
                        key={i}
                        className="flex-1 rounded-t bg-gradient-to-t from-vanyo-500/30 to-vanyo-500/80"
                        style={{ height: `${h * 0.5}px` }}
                      />
                    ))}
                  </div>
                  <div className="text-[10px] text-white/40">Évolution des demandes</div>
                </div>

                {/* Fausses lignes de tableau */}
                <div className="space-y-2">
                  {["Camille Laurent", "Thomas Nguyen", "Sarah Benali"].map((n, i) => (
                    <div key={n} className="flex items-center gap-2.5 rounded-lg border border-white/6 bg-white/[0.015] px-3 py-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-vanyo-500 to-violet-hi text-[9px] font-semibold text-white">
                        {n.split(" ").map((w) => w[0]).join("")}
                      </span>
                      <span className="flex-1 text-xs text-white/70">{n}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
                        i === 0 ? "bg-vanyo-500/15 text-vanyo-200" : i === 1 ? "bg-sky-500/15 text-sky-300" : "bg-emerald-500/15 text-emerald-300"
                      }`}>
                        {i === 0 ? "Nouveau" : i === 1 ? "Contacté" : "Accepté"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
