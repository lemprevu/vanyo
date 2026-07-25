"use client";

import { useState } from "react";
import { Sparkles, Loader2, Download, RefreshCw, Lock, AlertTriangle } from "lucide-react";
import { VisionPreview } from "@/components/devis/VisionPreview";
import type { VisionInput } from "@/lib/vision";

/**
 * Aperçu du projet pour une demande de devis — OUTIL INTERNE.
 *
 * Deux niveaux :
 *  1. un schéma de mise en page généré localement (toujours disponible,
 *     gratuit, instantané) ;
 *  2. une vraie image générée par IA à partir des réponses du client, à la
 *     demande, si une clé d'API est configurée.
 *
 * Rien de tout cela n'est montré au client : c'est un support pour se faire
 * une idée de ce qu'il a en tête avant l'échange.
 */
export function AiVisionPanel({
  devisId,
  vision,
  initialImage,
  live,
}: {
  devisId: string;
  /** Réponses du client, pour le schéma de secours. */
  vision: VisionInput;
  /** Image déjà générée et enregistrée, le cas échéant. */
  initialImage?: string | null;
  /** Faux en mode démonstration : la génération n'est pas disponible. */
  live: boolean;
}) {
  const [image, setImage] = useState<string | null>(initialImage ?? null);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function generate() {
    setState("loading");
    setError("");
    try {
      const res = await fetch("/api/admin/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ devisId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "La génération a échoué.");
      setImage(data.image);
      setState("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "La génération a échoué.");
      setState("error");
    }
  }

  function download() {
    if (!image) return;
    const a = document.createElement("a");
    a.href = image;
    a.download = `apercu-projet-${devisId.slice(0, 8)}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
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

      {image ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt="Aperçu du projet généré par IA"
            className="w-full rounded-2xl border border-white/10"
          />
          <div className="flex flex-wrap gap-2">
            <button onClick={download} className="btn-premium btn-ghost px-3 py-2 text-xs">
              <Download className="h-3.5 w-3.5" /> Télécharger
            </button>
            {live && (
              <button
                onClick={generate}
                disabled={state === "loading"}
                className="btn-premium btn-ghost px-3 py-2 text-xs disabled:opacity-60"
              >
                {state === "loading" ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Génération…</>
                ) : (
                  <><RefreshCw className="h-3.5 w-3.5" /> Regénérer</>
                )}
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Schéma local : disponible tout de suite, sans clé ni coût. */}
          <VisionPreview vision={vision} downloadable={false} />
          <p className="text-[11px] text-white/35">
            Schéma de mise en page déduit des réponses. Pour une vraie image, lancez la génération par IA.
          </p>

          {live ? (
            <button
              onClick={generate}
              disabled={state === "loading"}
              className="btn-premium btn-primary w-full px-4 py-2.5 text-sm disabled:opacity-70"
            >
              {state === "loading" ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Génération en cours…</>
              ) : (
                <><Sparkles className="h-4 w-4" /> Générer une image par IA</>
              )}
            </button>
          ) : (
            <p className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-[11px] text-white/45">
              La génération par IA nécessite Supabase et une clé d&apos;API — indisponible en mode démonstration.
            </p>
          )}
        </>
      )}

      {state === "loading" && (
        <p className="text-[11px] text-white/40">
          La génération prend généralement 15 à 40 secondes.
        </p>
      )}

      {state === "error" && (
        <p className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
