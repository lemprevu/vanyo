import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";

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
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${geist.variable} h-full`}>
      <body
        className="min-h-full flex flex-col font-sans"
        style={{ fontFamily: "var(--font-geist-sans)" }}
      >
        {children}
      </body>
    </html>
  );
}
