import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { InstagramIcon, LinkedinIcon, TwitterIcon } from "@/components/ui/SocialIcons";
import { PageHeader } from "@/components/sections/PageHeader";
import { ContactForm } from "./ContactForm";
import { Reveal } from "@/components/ui/Reveal";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez Vanyo pour parler de votre projet de site internet. Réponse sous quelques heures. Devis gratuit et sans engagement.",
};

const infos = [
  { Icon: Mail, label: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
  { Icon: Phone, label: "Téléphone", value: SITE.phone, href: SITE.phoneHref },
  { Icon: MapPin, label: "Adresse", value: SITE.address },
  { Icon: Clock, label: "Horaires", value: SITE.hours },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title={<>Parlons de <span className="text-gradient-violet">votre projet</span></>}
        subtitle="Une question, une idée, un devis ? Écrivez-nous, on adore les nouveaux projets."
      />

      <section className="container-v grid gap-8 py-8 pb-20 lg:grid-cols-[1fr_1.1fr]">
        {/* Infos */}
        <Reveal direction="right">
          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {infos.map(({ Icon, label, value, href }) => (
                <div key={label} className="gradient-border rounded-2xl bg-ink-card/60 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vanyo-500/12 text-vanyo-300 ring-1 ring-vanyo-500/25">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-3 text-xs uppercase tracking-wide text-white/40">{label}</div>
                  {href ? (
                    <a href={href} className="text-sm font-medium text-white hover:text-vanyo-200">{value}</a>
                  ) : (
                    <div className="text-sm font-medium text-white">{value}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Carte (embed) */}
            <div className="overflow-hidden rounded-2xl border border-white/8">
              <iframe
                title="Localisation Vanyo"
                src="https://www.openstreetmap.org/export/embed.html?bbox=2.29%2C48.86%2C2.34%2C48.885&layer=mapnik"
                className="h-64 w-full grayscale-[0.3]"
                loading="lazy"
              />
            </div>

            <div className="flex gap-2">
              {[
                { Icon: InstagramIcon, href: SITE.socials.instagram },
                { Icon: LinkedinIcon, href: SITE.socials.linkedin },
                { Icon: TwitterIcon, href: SITE.socials.twitter },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass flex h-11 w-11 items-center justify-center rounded-xl text-white/70 hover:border-vanyo-500/50 hover:text-white"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Formulaire */}
        <Reveal direction="left">
          <div className="gradient-border rounded-3xl bg-ink-card/60 p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-white">Envoyez-nous un message</h2>
            <p className="mt-1 text-sm text-white/50">Nous répondons généralement sous 2 heures.</p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
