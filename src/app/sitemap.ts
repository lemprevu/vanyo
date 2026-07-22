import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { CITIES } from "@/lib/cities";
import { getArticles } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articleList = await getArticles();

  const routes = [
    "", "/creation-sites", "/services", "/realisations", "/tarifs",
    "/processus", "/pourquoi-vanyo", "/avis", "/blog", "/faq",
    "/contact", "/devis", "/villes",
  ].map((path) => ({
    url: `${SITE.domain}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const articles = articleList.map((a) => ({
    url: `${SITE.domain}/blog/${a.slug}`,
    lastModified: new Date(a.date),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const cities = CITIES.map((c) => ({
    url: `${SITE.domain}/villes/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...routes, ...cities, ...articles];
}
