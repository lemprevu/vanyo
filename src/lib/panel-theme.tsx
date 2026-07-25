"use client";

import {
  createContext, useContext, useEffect, useState, type ReactNode,
} from "react";
import { shade, rgbChannels } from "@/lib/color";

export type PanelTheme = "dark" | "light";

type PanelThemeValue = {
  theme: PanelTheme;
  setTheme: (t: PanelTheme) => void;
  /** Accent choisi par l'utilisateur, ou null s'il garde celui par défaut. */
  accent: string | null;
  setAccent: (c: string | null) => void;
  /** Accent d'origine (couleur de marque du site ou du métier de démo). */
  defaultAccent: string;
  /** Vrai si l'utilisateur a personnalisé quelque chose. */
  customized: boolean;
  reset: () => void;
};

const PanelThemeContext = createContext<PanelThemeValue | null>(null);

export function usePanelTheme(): PanelThemeValue {
  const ctx = useContext(PanelThemeContext);
  if (!ctx) {
    return {
      theme: "dark", setTheme: () => {}, accent: null, setAccent: () => {},
      defaultAccent: "#6D4AFF", customized: false, reset: () => {},
    };
  }
  return ctx;
}

const themeKey = (scope: string) => `vanyo-panel-theme-${scope}`;
const accentKey = (scope: string) => `vanyo-panel-accent-${scope}`;

/** Lecture synchrone du choix mémorisé (évite un setState dans un effet). */
function readStored(scope: string): { theme: PanelTheme; accent: string | null } {
  if (typeof window === "undefined") return { theme: "dark", accent: null };
  try {
    const t = window.localStorage.getItem(themeKey(scope));
    const a = window.localStorage.getItem(accentKey(scope));
    return { theme: t === "light" ? "light" : "dark", accent: a };
  } catch {
    return { theme: "dark", accent: null };
  }
}

/**
 * Apparence du PANEL (clair/sombre + couleur), indépendante du site public.
 *
 * Le choix est mémorisé dans le navigateur et cloisonné par `scope` : le vrai
 * panel admin et chaque démo métier gardent leur propre préférence.
 *
 * Techniquement, on pose `data-theme` et on redéfinit les variables de la
 * palette d'accent : toutes les classes du panel (bg-ink*, text-white,
 * border-white/8, bg-vanyo-500…) les lisent déjà, il n'y a donc rien à changer
 * dans les écrans eux-mêmes.
 */
export function PanelThemeProvider({
  children,
  defaultAccent,
  scope = "admin",
}: {
  children: ReactNode;
  defaultAccent: string;
  scope?: string;
}) {
  // Lecture directe au premier rendu client. Le rendu serveur part du thème
  // sombre ; `suppressHydrationWarning` sur le conteneur absorbe l'écart.
  const [stored] = useState(() => readStored(scope));
  const [theme, setThemeState] = useState<PanelTheme>(stored.theme);
  const [accent, setAccentState] = useState<string | null>(stored.accent);

  function setTheme(t: PanelTheme) {
    setThemeState(t);
    try { window.localStorage.setItem(themeKey(scope), t); } catch { /* navigation privée */ }
  }

  function setAccent(c: string | null) {
    setAccentState(c);
    try {
      if (c) window.localStorage.setItem(accentKey(scope), c);
      else window.localStorage.removeItem(accentKey(scope));
    } catch { /* navigation privée */ }
  }

  function reset() {
    setTheme("dark");
    setAccent(null);
  }

  const active = accent ?? defaultAccent;

  /**
   * On écrit thème et palette sur <html> plutôt que sur un conteneur.
   *
   * Deux raisons : les utilitaires Tailwind à opacité (`bg-vanyo-500/15`)
   * compilent en `color-mix(… var(--color-vanyo-500) …)`, et Chromium
   * n'invalide pas toujours ces valeurs quand la variable change sur un style
   * en ligne — sur la racine, si. Et le panel occupe toute la page : aucun
   * risque de déborder sur le site public, qui a son propre fournisseur.
   */
  useEffect(() => {
    const root = document.documentElement;
    const previousTheme = root.dataset.theme;
    const vars: Record<string, string> = {
      "--color-vanyo-200": shade(active, 0.6),
      "--color-vanyo-300": shade(active, 0.4),
      "--color-vanyo-400": shade(active, 0.2),
      "--color-vanyo-500": active,
      "--color-vanyo-600": shade(active, -0.15),
      "--color-vanyo-700": shade(active, -0.3),
      "--color-violet-mid": shade(active, 0.12),
      "--color-violet-hi": shade(active, 0.28),
      // Canaux r,g,b utilisés par les variantes à opacité (voir globals.css).
      "--accent-rgb": rgbChannels(active),
      "--accent-hi-rgb": rgbChannels(shade(active, 0.28)),
      "--accent-mid-rgb": rgbChannels(shade(active, 0.12)),
    };

    root.dataset.theme = theme;
    for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);

    return () => {
      if (previousTheme) root.dataset.theme = previousTheme;
      else delete root.dataset.theme;
      for (const k of Object.keys(vars)) root.style.removeProperty(k);
    };
  }, [theme, active]);

  const value: PanelThemeValue = {
    theme, setTheme, accent, setAccent, defaultAccent,
    customized: accent !== null || theme !== "dark",
    reset,
  };

  return <PanelThemeContext.Provider value={value}>{children}</PanelThemeContext.Provider>;
}
