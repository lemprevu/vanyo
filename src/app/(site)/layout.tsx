import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CustomCursor } from "@/components/fx/CustomCursor";
import { ScrollProgress } from "@/components/fx/ScrollProgress";
import { LoadingScreen } from "@/components/fx/LoadingScreen";
import { AuroraBackground, MouseGlow } from "@/components/fx/Backgrounds";
import { SiteRuntime } from "@/components/SiteRuntime";
import { getSiteSettings } from "@/lib/data";

export const revalidate = 60;

/** Métadonnées SEO dynamiques (mots-clés, OpenGraph, visibilité moteurs). */
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return {
    keywords: s.seo_keywords
      ? s.seo_keywords.split(",").map((k) => k.trim()).filter(Boolean)
      : undefined,
    openGraph: {
      title: s.og_title || undefined,
      description: s.og_description || s.description || undefined,
    },
    twitter: {
      title: s.og_title || undefined,
      description: s.og_description || s.description || undefined,
    },
    robots: s.search_visible ? { index: true, follow: true } : { index: false, follow: false },
  };
}

/** Layout du site public : chrome premium + effets globaux. */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings();
  return (
    <>
      <SiteRuntime settings={settings} />
      <LoadingScreen />
      <AuroraBackground />
      <MouseGlow />
      <ScrollProgress />
      <CustomCursor />
      <Navbar />
      <main className="relative z-10 flex-1 pt-24">{children}</main>
      <Footer settings={settings} />
    </>
  );
}
