import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { getSiteSettings } from "@/lib/data";

export const revalidate = 60;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const s = await getSiteSettings();

  // Si la visibilité moteurs est désactivée dans l'admin, on bloque tout.
  if (!s.search_visible) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/", disallow: "/admin" },
    sitemap: `${SITE.domain}/sitemap.xml`,
  };
}
