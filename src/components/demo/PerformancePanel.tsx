"use client";

import { useMemo } from "react";
import { FileText, Star, MessageSquare, ImageIcon, Eye, Smartphone, Globe2, Gauge, CheckCircle2, ExternalLink } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { AreaChart } from "@/components/admin/Charts";
import type { MetierConfig, BizState, RequestsSection, ReviewsSection, CollectionSection } from "@/lib/demo/types";

/** Petit générateur pseudo-aléatoire déterministe (même métier = mêmes chiffres). */
function seededRandom(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
    return ((h >>> 0) % 1000) / 1000;
  };
}

const CHECKS = [
  "HTTPS actif et certificat valide",
  "Site responsive (mobile, tablette, bureau)",
  "Balises meta title & description renseignées",
  "Sitemap.xml et robots.txt accessibles",
  "Temps de chargement optimisé (images compressées)",
];

/**
 * Version démo de « Performance & SEO » : mêmes indicateurs que le panel réel,
 * mais calculés à partir des données saisies dans le simulateur plutôt que
 * d'un vrai audit réseau (le site de démonstration n'existe pas en ligne).
 */
export function PerformancePanel({ config, state }: { config: MetierConfig; state: BizState }) {
  const rand = useMemo(() => seededRandom(config.id), [config.id]);

  const requestsSections = config.sections.filter((s): s is RequestsSection => s.type === "requests");
  const requestsTotal = requestsSections.reduce((n, s) => n + (state.collections[s.id]?.length ?? 0), 0);

  const reviewsSection = config.sections.find((s): s is ReviewsSection => s.type === "reviews");
  const ratings = (reviewsSection ? state.collections[reviewsSection.id] ?? [] : []).map((r) => Number(r.rating) || 0);
  const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "—";

  const messagesSection = config.sections.find((s) => s.type === "messages");
  const messagesTotal = messagesSection ? (state.collections[messagesSection.id] ?? []).length : 0;

  const galleryLike = config.sections.filter((s): s is CollectionSection => s.type === "collection");
  const pagesCount = 6 + galleryLike.length * 2;

  const trend = Array.from({ length: 7 }, () => Math.round(30 + rand() * 90));
  const labels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const total = trend.reduce((a, b) => a + b, 0);
  const mobileShare = Math.round(55 + rand() * 25);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Performance & SEO</h1>
        <p className="mt-1 text-sm text-white/50">
          Aperçu de ce que verrait {config.businessName} sur son vrai site · démonstration illustrative
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText} label="Demandes reçues" value={requestsTotal} accent="vanyo" />
        <StatCard icon={Star} label="Note moyenne avis" value={avgRating === "—" ? "—" : `${avgRating}/5`} accent="amber" />
        <StatCard icon={MessageSquare} label="Messages reçus" value={messagesTotal} accent="sky" />
        <StatCard icon={ImageIcon} label="Pages publiées (sitemap)" value={pagesCount} accent="emerald" />
      </div>

      <div className="gradient-border rounded-2xl bg-ink-card/60 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white">Trafic du site</h2>
            <p className="text-xs text-white/45">7 derniers jours · exemple illustratif</p>
          </div>
          <Eye className="h-6 w-6 text-vanyo-300" />
        </div>
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard icon={Eye} label="Vues de page (7j)" value={total} accent="vanyo" />
            <StatCard icon={Globe2} label="Sources différentes" value={4} accent="sky" />
            <StatCard icon={Smartphone} label="Part mobile" value={`${mobileShare}%`} accent="amber" />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-white/70">Évolution quotidienne</p>
            <AreaChart data={trend} labels={labels} height={180} />
          </div>
        </div>
      </div>

      <div className="gradient-border rounded-2xl bg-ink-card/60 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white">Contrôle technique du site</h2>
            <p className="text-xs text-white/45">{CHECKS.length}/{CHECKS.length} vérifications au vert · exemple</p>
          </div>
          <Gauge className="h-6 w-6 text-vanyo-300" />
        </div>
        <div className="space-y-2">
          {CHECKS.map((c) => (
            <div key={c} className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/[0.02] px-4 py-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
              <div className="text-sm font-medium text-white">{c}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="gradient-border rounded-2xl bg-ink-card/60 p-5">
        <h2 className="mb-4 font-semibold text-white">Sur votre vrai site</h2>
        <div className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3.5 text-sm text-white/60">
          <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-vanyo-300" />
          <p>
            Cette page reprend, une fois votre site en ligne, de vraies mesures (Google Search Console,
            PageSpeed Insights, trafic réel) — pas des exemples.
          </p>
        </div>
      </div>
    </div>
  );
}
