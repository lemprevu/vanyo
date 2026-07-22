/**
 * Configuration globale du site Vanyo.
 * Centralise les informations réutilisées (nav, coordonnées, SEO).
 */

export const SITE = {
  name: "Vanyo",
  tagline: "Agence web premium",
  // vanyo.fr redirige (308) vers www.vanyo.fr côté Vercel : c'est ce dernier
  // qui doit être la référence partout (canonical, sitemap, JSON-LD). Une
  // URL canonique qui pointe vers un domaine qui redirige ailleurs crée une
  // incohérence que Google (et Search Console) n'aime pas.
  domain: "https://www.vanyo.fr",
  description:
    "Vanyo conçoit des sites internet modernes, rapides et pensés pour convertir vos visiteurs en clients. Sites vitrines, e-commerce, restaurants, immobilier, portfolios et applications web sur mesure.",
  email: "contact@vanyo.fr",
  phone: "+33 6 00 00 00 00",
  phoneHref: "tel:+33600000000",
  // Agence 100% à distance : aucune adresse physique, on ne doit jamais en
  // afficher une fictive (trompeur pour les visiteurs, pénalisant pour le
  // référencement local si l'adresse ne correspond à rien de réel).
  address: "France entière — 100% à distance",
  hours: "Lun – Ven · 9h – 19h",
  // Vides tant qu'aucun vrai profil n'existe : un lien vers la page
  // d'accueil générique d'un réseau (ex. instagram.com) plutôt que vers un
  // vrai profil Vanyo est pire que pas de lien du tout — trompeur pour les
  // visiteurs et sans valeur pour Google. Renseigner les vraies URLs ici
  // (ou via /admin/parametres) dès que les comptes existent.
  socials: {
    instagram: "",
    linkedin: "",
    twitter: "",
    dribbble: "",
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
