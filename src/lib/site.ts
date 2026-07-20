/**
 * Configuration globale du site Vanyo.
 * Centralise les informations réutilisées (nav, coordonnées, SEO).
 */

export const SITE = {
  name: "Vanyo",
  tagline: "Agence web premium",
  domain: "https://vanyo.fr",
  description:
    "Vanyo conçoit des sites internet modernes, rapides et pensés pour convertir vos visiteurs en clients. Sites vitrines, e-commerce, restaurants, immobilier, portfolios et applications web sur mesure.",
  email: "contact@vanyo.fr",
  phone: "+33 6 00 00 00 00",
  phoneHref: "tel:+33600000000",
  address: "12 rue de l'Innovation, 75008 Paris",
  hours: "Lun – Ven · 9h – 19h",
  socials: {
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
    twitter: "https://x.com",
    dribbble: "https://dribbble.com",
  },
} as const;

export const NAV_LINKS = [
  { label: "Accueil", href: "/" },
  { label: "Création de sites", href: "/creation-sites" },
  { label: "Services", href: "/services" },
  { label: "Réalisations", href: "/realisations" },
  { label: "Tarifs", href: "/tarifs" },
  { label: "Processus", href: "/processus" },
  { label: "Pourquoi Vanyo", href: "/pourquoi-vanyo" },
  { label: "Avis", href: "/avis" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
] as const;
