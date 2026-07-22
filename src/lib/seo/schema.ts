/**
 * Générateurs de données structurées Schema.org (JSON-LD).
 * Vanyo est une agence 100% à distance (pas d'adresse physique) : on utilise
 * `Organization` + `areaServed: France`, jamais `LocalBusiness` avec une
 * fausse adresse — un NAP (Nom/Adresse/Téléphone) inventé nuit au SEO local
 * plus qu'il n'aide, et induirait les visiteurs en erreur.
 */
import { SITE } from "@/lib/site";
import type { SiteSettingsFull } from "@/lib/types";

const sameAs = Object.values(SITE.socials).filter(Boolean);

/** Écarte les numéros manifestement factices (ex. "+33 6 00 00 00 00") des données structurées. */
function realPhone(phone?: string) {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, "");
  return /^(\d)\1+$/.test(digits.slice(-8)) ? undefined : phone;
}

/** Organisation : utilisée sur toutes les pages (injectée une fois, dans le layout racine). */
export function organizationSchema(settings?: Pick<SiteSettingsFull, "email" | "phone">) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE.domain}/#organization`,
    name: SITE.name,
    url: SITE.domain,
    logo: `${SITE.domain}/icon.svg`,
    description: SITE.description,
    email: settings?.email || SITE.email,
    telephone: realPhone(settings?.phone),
    areaServed: { "@type": "Country", name: "France" },
    knowsAbout: [
      "Création de site internet", "Développement web", "SEO", "Référencement local",
      "Site vitrine", "Site e-commerce", "Refonte de site", "Performance web",
    ],
    sameAs,
  };
}

/** Site web : active le sitelinks searchbox et rattache l'auteur des pages. */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.domain}/#website`,
    url: SITE.domain,
    name: SITE.name,
    description: SITE.description,
    publisher: { "@id": `${SITE.domain}/#organization` },
    inLanguage: "fr-FR",
  };
}

export type Crumb = { label: string; href: string };

/** Fil d'Ariane : à injecter sur toute page à plus d'un niveau de profondeur. */
export function breadcrumbSchema(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      item: `${SITE.domain}${c.href}`,
    })),
  };
}

/** FAQ : reprend les Q/R affichées à l'écran — permet un rich result Google et facilite la citation par les IA. */
export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

/** Catalogue de services proposés par l'agence. */
export function serviceSchema(services: { title: string; description: string; slug: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: services.map((s, i) => ({
      "@type": "Service",
      position: i + 1,
      name: s.title,
      description: s.description,
      url: `${SITE.domain}/services#${s.slug}`,
      provider: { "@id": `${SITE.domain}/#organization` },
      areaServed: { "@type": "Country", name: "France" },
    })),
  };
}

/** Article de blog : nécessaire pour Google Discover et pour être cité correctement par les IA génératives. */
export function articleSchema(article: {
  title: string; excerpt: string; slug: string; date: string; category: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    dateModified: article.date,
    articleSection: article.category,
    inLanguage: "fr-FR",
    author: { "@id": `${SITE.domain}/#organization` },
    publisher: { "@id": `${SITE.domain}/#organization` },
    mainEntityOfPage: `${SITE.domain}/blog/${article.slug}`,
  };
}

/** Avis clients agrégés : agrémente Organization d'une note globale (rich result étoiles). */
export function aggregateRatingSchema(ratings: number[]) {
  if (ratings.length === 0) return null;
  const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE.domain}/#organization`,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: avg.toFixed(1),
      reviewCount: ratings.length,
      bestRating: 5,
    },
  };
}

/** Ville ciblée par le référencement local (page /villes/[slug]). */
export function cityServiceSchema(city: { name: string; region: string; slug: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Création de site internet à ${city.name}`,
    provider: { "@id": `${SITE.domain}/#organization` },
    areaServed: { "@type": "City", name: city.name, containedInPlace: { "@type": "AdministrativeArea", name: city.region } },
    url: `${SITE.domain}/villes/${city.slug}`,
  };
}
