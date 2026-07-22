"use client";

import dynamic from "next/dynamic";

/**
 * Effets purement décoratifs (halo, lueur souris, curseur personnalisé,
 * barre de progression) — chargés en différé, hors du chemin critique.
 * Ils ne portent aucun contenu ; les charger de façon synchrone avec le
 * reste du site ralentissait inutilement le premier affichage, surtout
 * sur mobile où le curseur personnalisé est de toute façon désactivé.
 */
const AuroraBackground = dynamic(() => import("./Backgrounds").then((m) => m.AuroraBackground), { ssr: false });
const MouseGlow = dynamic(() => import("./Backgrounds").then((m) => m.MouseGlow), { ssr: false });
const ScrollProgress = dynamic(() => import("./ScrollProgress").then((m) => m.ScrollProgress), { ssr: false });
const CustomCursor = dynamic(() => import("./CustomCursor").then((m) => m.CustomCursor), { ssr: false });

export function DeferredEffects() {
  return (
    <>
      <AuroraBackground />
      <MouseGlow />
      <ScrollProgress />
      <CustomCursor />
    </>
  );
}
