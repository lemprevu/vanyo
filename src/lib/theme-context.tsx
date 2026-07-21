"use client";

import { createContext, useContext } from "react";

export type Theme = "dark" | "light";

export type SiteThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  accent: string | null;
  setAccent: (c: string | null) => void;
  defaultAccent: string;
};

export const SiteThemeContext = createContext<SiteThemeContextValue | null>(null);

/** Accès au thème/couleur choisis par le visiteur (voir SiteThemeProvider). */
export function useSiteTheme() {
  const ctx = useContext(SiteThemeContext);
  if (!ctx) {
    // Valeurs neutres si utilisé hors du site public (ex. panel admin) :
    // évite un crash, le composant appelant reste simplement inerte.
    return {
      theme: "dark" as Theme,
      setTheme: () => {},
      accent: null,
      setAccent: () => {},
      defaultAccent: "#6D4AFF",
    } satisfies SiteThemeContextValue;
  }
  return ctx;
}
