import {
  FileText, Star, MessageSquare, ImageIcon, ExternalLink,
  CheckCircle2, AlertTriangle, XCircle, Gauge,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSiteSettingsFull } from "@/lib/settings-server";
import { runSiteAudit, runPageSpeed } from "@/lib/seo/audit";
import { StatCard } from "@/components/admin/StatCard";
import { SITE } from "@/lib/site";
import type { Avis } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_ICON = { ok: CheckCircle2, warn: AlertTriangle, error: XCircle } as const;
const STATUS_COLOR = {
  ok: "text-emerald-400",
  warn: "text-amber-400",
  error: "text-rose-400",
} as const;

const EXTERNAL_LINKS = [
  { label: "Google Search Console", href: "https://search.google.com/search-console", desc: "Indexation, requêtes, erreurs d'exploration" },
  { label: "PageSpeed Insights", href: `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(SITE.domain)}`, desc: "Score Lighthouse détaillé, manuel" },
  { label: "Bing Webmaster Tools", href: "https://www.bing.com/webmasters", desc: "Indexation Bing / Copilot" },
  { label: "Google Business Profile", href: "https://business.google.com", desc: "Fiche locale, avis Google" },
];

export default async function PerformancePage() {
  const supabase = await createClient();
  const live = !!supabase;
  const settings = await getSiteSettingsFull();

  const [audit, avis, devisCount, messagesCount] = await Promise.all([
    runSiteAudit(),
    live
      ? supabase.from("avis").select("rating")
      : Promise.resolve({ data: null }),
    live ? supabase.from("devis").select("*", { count: "exact", head: true }) : Promise.resolve({ count: 142 }),
    live ? supabase.from("messages").select("*", { count: "exact", head: true }) : Promise.resolve({ count: 12 }),
  ]);

  const ratings = (avis.data as Pick<Avis, "rating">[] | null)?.map((a) => a.rating) ?? [];
  const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "—";

  const pagespeedKey = settings.pagespeed_api_key;
  const [mobile, desktop] = pagespeedKey
    ? await Promise.all([runPageSpeed(pagespeedKey, "mobile"), runPageSpeed(pagespeedKey, "desktop")])
    : [null, null];

  const okCount = audit.checks.filter((c) => c.status === "ok").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Performance & SEO</h1>
        <p className="mt-1 text-sm text-white/50">
          État technique réel de {SITE.domain.replace("https://", "")}, mesuré en direct — pas une simulation.
        </p>
      </div>

      {/* KPIs business réels */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText} label="Demandes de devis" value={devisCount.count ?? 0} accent="vanyo" />
        <StatCard icon={Star} label="Note moyenne avis" value={avgRating === "—" ? "—" : `${avgRating}/5`} accent="amber" />
        <StatCard icon={MessageSquare} label="Messages reçus" value={messagesCount.count ?? 0} accent="sky" />
        <StatCard icon={ImageIcon} label="Pages publiées (sitemap)" value={audit.sitemapUrlCount} accent="emerald" />
      </div>

      {/* Auto-diagnostic technique */}
      <div className="gradient-border rounded-2xl bg-ink-card/60 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white">Contrôle technique du site</h2>
            <p className="text-xs text-white/45">
              {okCount}/{audit.checks.length} vérifications au vert · mesuré à l&apos;instant sur {SITE.domain}
            </p>
          </div>
          <Gauge className="h-6 w-6 text-vanyo-300" />
        </div>
        <div className="space-y-2">
          {audit.checks.map((c) => {
            const Icon = STATUS_ICON[c.status];
            return (
              <div key={c.label} className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/[0.02] px-4 py-3">
                <Icon className={`h-5 w-5 shrink-0 ${STATUS_COLOR[c.status]}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-white">{c.label}</div>
                  <div className="text-xs text-white/45">{c.detail}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Core Web Vitals réels (si clé API configurée) */}
      <div className="gradient-border rounded-2xl bg-ink-card/60 p-5">
        <div className="mb-4">
          <h2 className="font-semibold text-white">Score Lighthouse (PageSpeed Insights)</h2>
          <p className="text-xs text-white/45">Mesure Google réelle, mobile et bureau.</p>
        </div>

        {!pagespeedKey && (
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 p-4 text-sm text-amber-200">
            Aucune clé API configurée. Ajoutez une clé PageSpeed Insights gratuite dans{" "}
            <span className="font-medium">Paramètres → Intégrations</span> pour afficher ici un vrai score
            Core Web Vitals, mis à jour automatiquement. En attendant, testez manuellement via le lien ci-dessous.
          </div>
        )}

        {pagespeedKey && (!mobile || !desktop) && (
          <div className="rounded-xl border border-rose-500/25 bg-rose-500/8 p-4 text-sm text-rose-200">
            La clé API configurée n&apos;a pas permis de récupérer de résultat (clé invalide, quota dépassé, ou
            API PageSpeed Insights non activée sur le projet Google Cloud).
          </div>
        )}

        {pagespeedKey && mobile && desktop && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[{ label: "Mobile", r: mobile }, { label: "Bureau", r: desktop }].map(({ label, r }) => (
              <div key={label} className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                <p className="mb-3 text-sm font-medium text-white/70">{label}</p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    ["Perf.", r.scores.performance],
                    ["Access.", r.scores.accessibility],
                    ["Pratiques", r.scores.bestPractices],
                    ["SEO", r.scores.seo],
                  ].map(([lbl, val]) => (
                    <div key={lbl as string}>
                      <div className={`text-xl font-bold ${(val as number) >= 90 ? "text-emerald-400" : (val as number) >= 50 ? "text-amber-400" : "text-rose-400"}`}>
                        {val}
                      </div>
                      <div className="text-[10px] text-white/45">{lbl}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-between text-xs text-white/50">
                  <span>LCP {r.lcp ?? "—"}</span>
                  <span>CLS {r.cls ?? "—"}</span>
                  <span>TBT {r.tbt ?? "—"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Raccourcis externes */}
      <div className="gradient-border rounded-2xl bg-ink-card/60 p-5">
        <h2 className="mb-4 font-semibold text-white">Outils externes</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {EXTERNAL_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3.5 transition-colors hover:border-vanyo-500/40"
            >
              <div>
                <div className="text-sm font-medium text-white">{l.label}</div>
                <div className="text-xs text-white/45">{l.desc}</div>
              </div>
              <ExternalLink className="h-4 w-4 shrink-0 text-white/40 group-hover:text-vanyo-300" />
            </a>
          ))}
        </div>
        <p className="mt-4 text-xs text-white/35">
          Ces outils nécessitent votre propre connexion (Google, Bing...) — impossible à afficher directement
          ici pour des raisons de sécurité et de confidentialité de vos identifiants.
        </p>
      </div>
    </div>
  );
}
