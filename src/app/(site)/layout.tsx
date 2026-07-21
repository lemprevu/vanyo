import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CustomCursor } from "@/components/fx/CustomCursor";
import { ScrollProgress } from "@/components/fx/ScrollProgress";
import { AuroraBackground, MouseGlow } from "@/components/fx/Backgrounds";
import { SiteRuntime } from "@/components/SiteRuntime";
import { SiteThemeProvider } from "@/components/SiteThemeProvider";
import { getSiteSettings } from "@/lib/data";

export const revalidate = 60;

/** Métadonnées SEO dynamiques (titre, description, mots-clés, OpenGraph, robots). */
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const ogDesc = s.og_description || s.meta_description || s.description || undefined;
  const ogImages = s.og_image ? [{ url: s.og_image }] : undefined;

  return {
    title: s.og_title || undefined,
    description: s.meta_description || s.description || undefined,
    keywords: s.seo_keywords
      ? s.seo_keywords.split(",").map((k) => k.trim()).filter(Boolean)
      : undefined,
    openGraph: {
      title: s.og_title || undefined,
      description: ogDesc,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      site: s.twitter_handle || undefined,
      title: s.og_title || undefined,
      description: ogDesc,
      images: ogImages,
    },
    verification: s.google_verification
      ? { google: s.google_verification }
      : undefined,
    robots: s.search_visible ? { index: true, follow: true } : { index: false, follow: false },
  };
}

/** Layout du site public : chrome premium + effets globaux. */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings();
  return (
    <>
      <SiteRuntime settings={settings} />
      <SiteThemeProvider defaultAccent={settings.brand_color}>
        <AuroraBackground />
        <MouseGlow />
        <ScrollProgress />
        <CustomCursor />
        <Navbar />
        <main className="relative z-10 flex-1 pt-24">{children}</main>
        <Footer settings={settings} />
      </SiteThemeProvider>
    </>
  );
}
