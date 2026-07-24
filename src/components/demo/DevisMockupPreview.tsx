"use client";

import {
  CreditCard, LogIn, Newspaper, Image as ImageIcon, Mail, Calendar,
  CalendarCheck, User, LayoutDashboard, MessageCircle, Globe, Sparkles, Search,
} from "lucide-react";
import type { Devis } from "@/lib/devis";

const FEATURE_ICON: Record<string, typeof Mail> = {
  Connexion: LogIn,
  Paiement: CreditCard,
  Blog: Newspaper,
  Galerie: ImageIcon,
  Contact: Mail,
  Agenda: Calendar,
  Réservation: CalendarCheck,
  "Espace Client": User,
  Dashboard: LayoutDashboard,
  Newsletter: Mail,
  Chat: MessageCircle,
  Multilingue: Globe,
  Animations: Sparkles,
  SEO: Search,
};

/** Devine une couleur d'accent à partir du texte libre "couleurs souhaitées". */
function guessAccent(text?: string | null): string {
  const t = (text ?? "").toLowerCase();
  const map: [string, string][] = [
    ["bleu", "#3B82F6"], ["vert", "#22C55E"], ["rouge", "#EF4444"],
    ["rose", "#EC4899"], ["orange", "#F97316"], ["jaune", "#EAB308"],
    ["violet", "#8B5CF6"], ["mauve", "#A855F7"], ["noir", "#525252"],
    ["doré", "#D4AF37"], ["or ", "#D4AF37"], ["marron", "#92400E"],
    ["turquoise", "#14B8A6"], ["gris", "#64748B"],
  ];
  for (const [word, hex] of map) if (t.includes(word)) return hex;
  return "#6D4AFF"; // violet Vanyo par défaut, si rien n'est précisé
}

/** Le style visuel choisi influence les arrondis, pour donner une vraie intuition. */
function radiusFor(style?: string | null): string {
  if (style === "Minimaliste" || style === "Corporate & sérieux") return "rounded-md";
  if (style === "Luxe & premium") return "rounded-2xl";
  return "rounded-xl";
}

/** Aperçu généré à partir des réponses du formulaire de devis — pas une maquette finale, un point de départ visuel. */
export function DevisMockupPreview({ devis }: { devis: Devis }) {
  const accent = guessAccent(devis.couleurs_souhaitees);
  const radius = radiusFor(devis.style_visuel);
  const pages = Math.max(1, ...( (devis.nombre_pages?.match(/\d+/g) ?? ["3"]).map(Number) ));
  const navCount = Math.min(pages, 5);
  const features = (devis.fonctionnalites ?? []).slice(0, 6);
  const siteName = devis.entreprise || `${devis.prenom} ${devis.nom}`.trim() || "Votre site";

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-card/80 shadow-lg">
      {/* Barre navigateur */}
      <div className="flex items-center gap-2 border-b border-white/8 bg-white/[0.03] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        <div className="ml-3 flex-1 truncate rounded-md bg-white/5 px-3 py-1 text-[11px] text-white/40">
          {siteName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.fr
        </div>
      </div>

      <div className="p-4">
        {/* Nav */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`h-5 w-5 ${radius}`} style={{ background: accent }} />
            <div className="h-2.5 w-16 rounded bg-white/25" />
          </div>
          <div className="hidden gap-3 sm:flex">
            {Array.from({ length: navCount }).map((_, i) => (
              <div key={i} className="h-2 w-10 rounded bg-white/12" />
            ))}
          </div>
          <div className={`h-6 w-16 ${radius}`} style={{ background: `linear-gradient(90deg, ${accent}, ${accent}aa)` }} />
        </div>

        {/* Hero */}
        <div className={`relative overflow-hidden ${radius} p-5`} style={{ background: `linear-gradient(135deg, ${accent}33, transparent)` }}>
          <div className="h-3 w-2/3 rounded bg-white/70" />
          <div className="mt-2 h-3 w-2/5 rounded" style={{ background: accent }} />
          <div className="mt-3 space-y-1.5">
            <div className="h-2 w-full max-w-sm rounded bg-white/12" />
            <div className="h-2 w-4/5 max-w-xs rounded bg-white/12" />
          </div>
          <div className={`mt-4 inline-flex h-7 w-28 items-center justify-center ${radius} text-[10px] font-medium text-white`} style={{ background: accent }}>
            {devis.objectif === "Vendre en ligne" ? "Commander" : devis.objectif === "Prendre des rendez-vous" ? "Réserver" : "En savoir plus"}
          </div>
        </div>

        {/* Fonctionnalités demandées, illustrées */}
        {features.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {features.map((f) => {
              const Icon = FEATURE_ICON[f] ?? Sparkles;
              return (
                <div key={f} className={`flex flex-col items-center gap-1.5 border border-white/8 bg-white/[0.02] p-3 text-center ${radius}`}>
                  <Icon className="h-4 w-4" style={{ color: accent }} />
                  <span className="text-[9px] leading-tight text-white/60">{f}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
