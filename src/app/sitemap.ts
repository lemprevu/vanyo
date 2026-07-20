import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { ARTICLES } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "", "/creation-sites", "/services", "/realisations", "/tarifs",
    "/processus", "/pourquoi-vanyo", "/avis", "/blog", "/faq",
    "/contact", "/devis",
  ].map((path) => ({
    url: `${SITE.domain}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const articles = ARTICLES.map((a) => ({
    url: `${SITE.domain}/blog/${a.slug}`,
    lastModified: new Date(a.date),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...routes, ...articles];
}
