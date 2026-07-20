import Link from "next/link";
import { Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";
import { InstagramIcon, LinkedinIcon, TwitterIcon, DribbbleIcon } from "@/components/ui/SocialIcons";
import { Logo } from "@/components/Logo";
import { SITE, NAV_LINKS } from "@/lib/site";

const services = [
  { label: "Site vitrine", href: "/creation-sites" },
  { label: "Site e-commerce", href: "/creation-sites" },
  { label: "Site restaurant", href: "/creation-sites" },
  { label: "Refonte de site", href: "/creation-sites" },
  { label: "SEO & Référencement", href: "/services" },
];

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/8 bg-ink-soft">
      <div className="container-v py-16">
        {/* CTA final */}
        <div className="gradient-border glass relative mb-16 overflow-hidden rounded-3xl p-8 text-center sm:p-14">
          <div className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-vanyo-500/25 blur-[110px]" />
          <h2 className="relative text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Prêt à donner vie à votre <span className="text-gradient-violet">projet&nbsp;?</span>
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-white/60">
            Parlons de votre site. Devis gratuit, sans engagement, réponse sous quelques heures.
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/devis" className="btn-premium btn-primary px-7 py-3.5">
              Demander un devis
            </Link>
            <Link href="/realisations" className="btn-premium btn-ghost px-7 py-3.5">
              Voir nos réalisations
            </Link>
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/55">
              {SITE.name} conçoit des sites internet haut de gamme, rapides et pensés
              pour convertir. Design, développement, SEO et accompagnement.
            </p>
            <div className="mt-5 flex gap-2">
              {[
                { Icon: InstagramIcon, href: SITE.socials.instagram },
                { Icon: LinkedinIcon, href: SITE.socials.linkedin },
                { Icon: TwitterIcon, href: SITE.socials.twitter },
                { Icon: DribbbleIcon, href: SITE.socials.dribbble },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition-colors hover:border-vanyo-500/50 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Navigation</h3>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.slice(1, 8).map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-white/55 transition-colors hover:text-vanyo-200"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Services</h3>
            <ul className="mt-4 space-y-2.5">
              {services.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-white/55 transition-colors hover:text-vanyo-200"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/55">
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-vanyo-400" />
                <a href={`mailto:${SITE.email}`} className="hover:text-white">{SITE.email}</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-vanyo-400" />
                <a href={SITE.phoneHref} className="hover:text-white">{SITE.phone}</a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 text-vanyo-400" />
                <span>{SITE.address}</span>
              </li>
            </ul>
            <Link
              href="/contact"
              className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-vanyo-200 hover:text-white"
            >
              Nous écrire <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-6 text-xs text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} {SITE.name}. Tous droits réservés.</p>
          <div className="flex gap-5">
            <Link href="/mentions-legales" className="hover:text-white/70">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-white/70">Confidentialité</Link>
            <Link href="/admin" className="hover:text-white/70">Espace admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
