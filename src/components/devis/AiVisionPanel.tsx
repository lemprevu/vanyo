"use client";

import { useMemo, useState } from "react";
import { Loader2, Download, Shuffle, Lock, Check } from "lucide-react";
import { buildVisionSvg, downloadVision, pickArchetype, type VisionInput } from "@/lib/vision";

/**
 * Aperçu du projet pour une demande de devis — OUTIL INTERNE.
 *
 * Généré intégralement ici, à partir des réponses du client : aucun service
 * extérieur, aucune clé d'API, aucun coût, et rien qui sorte du panel. Le
 * bouton « Autre proposition » change la graine du générateur, ce qui donne
 * une nouvelle structure de page, de nouveaux visuels et une autre composition
 * pour le même brief.
 */

const ARCHETYPE_LABELS: Record<string, string> = {
  classic: "Vitrine classique",
  centered: "Vitrine centrée",
  sidebar: "Portail avec barre latérale",
  magazine: "Mise en page magazine",
  fullbleed: "Grande image d'ouverture",
  catalog: "Grille catalogue",
  split: "Écran scindé",
};

export function AiVisionPanel({
  devisId,
  vision,
}: {
  devisId: string;
  /** Réponses du client. */
  vision: VisionInput;
}) {
  // Graine de départ dérivée de l'identifiant : la même demande rouvre
  // toujours sur le même aperçu, sans rien avoir à stocker.
  const baseSeed = useMemo(() => {
    let h = 2166136261;
    for (let i = 0; i < devisId.length; i++) {
      h ^= devisId.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
  }, [devisId]);

  const [variant, setVariant] = useState(0);
  const [saving, setSaving] = useState<"idle" | "loading" | "done">("idle");

  const input = useMemo<VisionInput>(() => ({ ...vision, seed: baseSeed + variant * 7919 }), [vision, baseSeed, variant]);
  const svg = useMemo(() => buildVisionSvg(input), [input]);
  const archetype = useMemo(() => pickArchetype(input), [input]);

  async function save() {
    setSaving("loading");
    try {
      const name = (vision.siteName || "projet").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      await downloadVision(svg, `apercu-${name}-${variant + 1}.png`);
      setSaving("done");
      setTimeout(() => setSaving("idle"), 2200);
    } catch {
      setSaving("idle");
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />
        <p className="text-[11px] leading-snug text-amber-200">
          <strong className="font-semibold">Usage interne uniquement.</strong> Cet aperçu ne sert qu&apos;à
          nous, pour visualiser ce que le client a en tête avant l&apos;échange. Il n&apos;est jamais
          affiché sur le site ni envoyé au client, et ne constitue pas une maquette validée.
        </p>
      </div>

      <div
        className="overflow-hidden rounded-2xl border border-white/10 [&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />

      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0 text-[11px] text-white/40">
          <span className="text-white/60">{ARCHETYPE_LABELS[archetype] ?? archetype}</span>
          {variant > 0 && ` · proposition ${variant + 1}`}
        </span>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => setVariant((v) => v + 1)}
            className="btn-premium btn-ghost px-3 py-2 text-xs"
            title="Génère une autre structure de page et d'autres visuels"
          >
            <Shuffle className="h-3.5 w-3.5" /> Autre proposition
          </button>
          <button onClick={save} disabled={saving === "loading"} className="btn-premium btn-ghost px-3 py-2 text-xs">
            {saving === "loading" ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> …</>
            ) : saving === "done" ? (
              <><Check className="h-3.5 w-3.5 text-emerald-400" /> Enregistré</>
            ) : (
              <><Download className="h-3.5 w-3.5" /> Image</>
            )}
          </button>
        </div>
      </div>

      <p className="text-[11px] leading-snug text-white/35">
        Généré sur votre machine à partir des réponses du client — métier, style, couleur, ambiance et
        fonctionnalités demandées. Aucun service extérieur, aucune limite d&apos;utilisation.
      </p>
    </div>
  );
}
