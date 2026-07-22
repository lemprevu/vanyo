/**
 * Auto-diagnostic technique du site, calculé en direct en interrogeant
 * vanyo.fr lui-même (aucune clé API requise). Sert de base fiable à la
 * section /admin/performance : ce sont de vraies mesures, pas des chiffres
 * de démonstration.
 */
import { SITE } from "@/lib/site";

export type AuditCheck = {
  label: string;
  status: "ok" | "warn" | "error";
  detail: string;
};

export type SiteAudit = {
  checks: AuditCheck[];
  sitemapUrlCount: number;
  fetchedAt: string;
};

async function safeFetch(path: string): Promise<{ ok: boolean; status: number; text: string }> {
  try {
    const res = await fetch(`${SITE.domain}${path}`, { cache: "no-store" });
    const text = await res.text();
    return { ok: res.ok, status: res.status, text };
  } catch {
    return { ok: false, status: 0, text: "" };
  }
}

export async function runSiteAudit(): Promise<SiteAudit> {
  const checks: AuditCheck[] = [];

  const [robots, sitemap, home] = await Promise.all([
    safeFetch("/robots.txt"),
    safeFetch("/sitemap.xml"),
    safeFetch("/"),
  ]);

  // HTTPS + réponse de la page d'accueil
  checks.push(
    home.ok
      ? { label: "Page d'accueil accessible (HTTPS)", status: "ok", detail: `Réponse ${home.status}` }
      : { label: "Page d'accueil accessible (HTTPS)", status: "error", detail: `Réponse ${home.status || "aucune"}` }
  );

  // robots.txt
  if (robots.ok && /allow:\s*\//i.test(robots.text) && !/disallow:\s*\/\s*$/im.test(robots.text)) {
    checks.push({ label: "robots.txt autorise l'indexation", status: "ok", detail: "Allow: / détecté" });
  } else if (robots.ok) {
    checks.push({ label: "robots.txt autorise l'indexation", status: "warn", detail: "Règles présentes mais à vérifier manuellement" });
  } else {
    checks.push({ label: "robots.txt autorise l'indexation", status: "error", detail: "Fichier introuvable" });
  }

  // sitemap.xml
  const urlCount = (sitemap.text.match(/<loc>/g) ?? []).length;
  if (sitemap.ok && urlCount > 0) {
    checks.push({ label: "Sitemap valide et référencé", status: "ok", detail: `${urlCount} URL déclarées` });
  } else {
    checks.push({ label: "Sitemap valide et référencé", status: "error", detail: "Sitemap introuvable ou vide" });
  }

  // Canonical sur la homepage
  if (/<link[^>]+rel="canonical"[^>]+>/i.test(home.text)) {
    checks.push({ label: "Balise canonical présente", status: "ok", detail: "Détectée sur la page d'accueil" });
  } else {
    checks.push({ label: "Balise canonical présente", status: "error", detail: "Absente de la page d'accueil" });
  }

  // JSON-LD
  const jsonLdCount = (home.text.match(/application\/ld\+json/g) ?? []).length;
  if (jsonLdCount > 0) {
    checks.push({ label: "Données structurées (Schema.org)", status: "ok", detail: `${jsonLdCount} bloc(s) JSON-LD détecté(s)` });
  } else {
    checks.push({ label: "Données structurées (Schema.org)", status: "error", detail: "Aucun JSON-LD détecté" });
  }

  // Meta description
  if (/<meta[^>]+name="description"[^>]+content="[^"]{20,}"/i.test(home.text)) {
    checks.push({ label: "Meta description renseignée", status: "ok", detail: "Présente et non vide" });
  } else {
    checks.push({ label: "Meta description renseignée", status: "warn", detail: "Absente ou très courte" });
  }

  // Image de partage (OG)
  if (/property="og:image"/i.test(home.text)) {
    checks.push({ label: "Image de partage (OpenGraph)", status: "ok", detail: "og:image détectée" });
  } else {
    checks.push({ label: "Image de partage (OpenGraph)", status: "warn", detail: "Aucune og:image détectée" });
  }

  return { checks, sitemapUrlCount: urlCount, fetchedAt: new Date().toISOString() };
}

export type PageSpeedResult = {
  strategy: "mobile" | "desktop";
  scores: { performance: number; accessibility: number; bestPractices: number; seo: number };
  lcp: string | null;
  cls: string | null;
  tbt: string | null;
};

/** Score Lighthouse réel via l'API PageSpeed Insights (nécessite une clé API — voir /admin/parametres). */
export async function runPageSpeed(apiKey: string, strategy: "mobile" | "desktop"): Promise<PageSpeedResult | null> {
  try {
    const url = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(SITE.domain)}&key=${apiKey}&strategy=${strategy}&category=performance&category=seo&category=accessibility&category=best-practices`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    const cats = data?.lighthouseResult?.categories;
    const audits = data?.lighthouseResult?.audits;
    if (!cats) return null;
    return {
      strategy,
      scores: {
        performance: Math.round((cats.performance?.score ?? 0) * 100),
        accessibility: Math.round((cats.accessibility?.score ?? 0) * 100),
        bestPractices: Math.round((cats["best-practices"]?.score ?? 0) * 100),
        seo: Math.round((cats.seo?.score ?? 0) * 100),
      },
      lcp: audits?.["largest-contentful-paint"]?.displayValue ?? null,
      cls: audits?.["cumulative-layout-shift"]?.displayValue ?? null,
      tbt: audits?.["total-blocking-time"]?.displayValue ?? null,
    };
  } catch {
    return null;
  }
}
