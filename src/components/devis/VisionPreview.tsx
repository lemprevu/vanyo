"use client";

import { useMemo, useState } from "react";
import { Download, Loader2, Check } from "lucide-react";
import { buildVisionSvg, downloadVision, type VisionInput } from "@/lib/vision";

/**
 * Aperçu « vision du client » : une maquette générée à partir des réponses du
 * formulaire, téléchargeable en image. Utilisé côté public (étape Style) et
 * côté panel admin (fiche d'une demande).
 */
export function VisionPreview({
  vision,
  className = "",
  downloadable = true,
}: {
  vision: VisionInput;
  className?: string;
  downloadable?: boolean;
}) {
  const svg = useMemo(() => buildVisionSvg(vision), [vision]);
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  async function save() {
    setState("loading");
    try {
      const name = (vision.siteName || "votre-site").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      await downloadVision(svg, `vision-${name}.png`);
      setState("done");
      setTimeout(() => setState("idle"), 2200);
    } catch {
      setState("idle");
    }
  }

  return (
    <div className={className}>
      {/* Le SVG est fluide : il occupe la largeur disponible et garde son ratio. */}
      <div
        className="overflow-hidden rounded-2xl border border-white/10 [&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />

      {downloadable && (
        <button
          type="button"
          onClick={save}
          disabled={state === "loading"}
          className="btn-premium btn-ghost mt-3 w-full px-4 py-2.5 text-sm sm:w-auto"
        >
          {state === "loading" ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Génération…</>
          ) : state === "done" ? (
            <><Check className="h-4 w-4 text-emerald-400" /> Image enregistrée</>
          ) : (
            <><Download className="h-4 w-4" /> Télécharger l&apos;aperçu en image</>
          )}
        </button>
      )}
    </div>
  );
}
