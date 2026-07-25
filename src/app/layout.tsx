import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/seo/schema";
import { getSiteSettings } from "@/lib/data";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.domain),
  title: {
    default: `${SITE.name} — Création de sites internet premium`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "création site internet",
    "agence web premium",
    "site vitrine",
    "site e-commerce",
    "site restaurant",
    "refonte site",
    "Next.js",
    "SEO",
    "Vanyo",
  ],
  authors: [{ name: SITE.name }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE.domain,
    siteName: SITE.name,
    title: `${SITE.name} — Création de sites internet premium`,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — Création de sites internet premium`,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/icon-180.png", sizes: "180x180" }],
  },
  // Permet à un client d'ajouter le site (ou son panel admin) à l'écran
  // d'accueil de son téléphone : icône Vanyo, ouverture en plein écran
  // sans barre d'adresse, comme une vraie application.
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: SITE.name,
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSiteSettings();
  return (
    // Pas de `h-full` sur <html> : une hauteur fixe de 100 % sur la racine
    // empêche le défilement programmatique du document (window.scrollTo,
    // scrollIntoView, ancres #…) — le contenu déborde visuellement et se fait
    // bien faire défiler au doigt, mais plus aucun script ne peut remonter la
    // page. C'est ce qui faisait rester le formulaire de devis au milieu de
    // l'étape suivante sur mobile. `min-h-dvh` sur <body> donne le même rendu
    // (pied de page collé en bas) sans casser le défilement, et suit la barre
    // d'adresse mobile qui se rétracte.
    <html lang="fr" className={geist.variable}>
      <body
        className="flex min-h-dvh flex-col font-sans"
        style={{ fontFamily: "var(--font-geist-sans)" }}
      >
        <JsonLd data={organizationSchema(settings)} />
        <JsonLd data={websiteSchema()} />
        {children}
      </body>
    </html>
  );
}
