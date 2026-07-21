"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { PersonalizeWidget } from "@/components/PersonalizeWidget";
import { SiteThemeContext, type Theme } from "@/lib/theme-context";
import { shade } from "@/lib/color";

const THEME_KEY = "vanyo-theme";
const ACCENT_KEY = "vanyo-accent";

/**
 * Fournit le thème clair/sombre et la couleur d'accent CHOISIS PAR LE
 * VISITEUR (stockés uniquement dans son navigateur — jamais envoyés au
 * serveur, n'affecte que sa propre session). C'est une démonstration :
 * l'admin peut faire exactement la même chose pour TOUT LE MONDE depuis
 * /admin/parametres → Apparence.
 *
 * Scope volontairement limité au site public (ce composant n'enveloppe
 * jamais /admin) : voir la note dans globals.css sur `[data-theme="light"]`.
 */
export function SiteThemeProvider({
  children,
  defaultAccent,
}: {
  children: ReactNode;
  defaultAccent: string;
}) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [accent, setAccentState] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_KEY) as Theme | null;
    const storedAccent = localStorage.getItem(ACCENT_KEY);
    if (storedTheme === "light" || storedTheme === "dark") setThemeState(storedTheme);
    if (storedAccent) setAccentState(storedAccent);
    setMounted(true);
  }, []);

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem(THEME_KEY, t);
  }

  function setAccent(c: string | null) {
    setAccentState(c);
    if (c) localStorage.setItem(ACCENT_KEY, c);
    else localStorage.removeItem(ACCENT_KEY);
  }

  const style: CSSProperties = accent
    ? ({
        "--color-vanyo-300": shade(accent, 0.4),
        "--color-vanyo-400": shade(accent, 0.2),
        "--color-vanyo-500": accent,
        "--color-vanyo-600": shade(accent, -0.15),
        "--color-vanyo-700": shade(accent, -0.3),
        "--color-violet-mid": shade(accent, 0.12),
        "--color-violet-hi": shade(accent, 0.28),
      } as CSSProperties)
    : {};

  return (
    <SiteThemeContext.Provider value={{ theme, setTheme, accent, setAccent, defaultAccent }}>
      {/* display:contents : n'ajoute aucune boîte dans la mise en page, tout
          en laissant `data-theme` et les variables CSS se propager normalement
          aux enfants (fond, textes, cartes...). */}
      <div data-theme={theme} style={{ display: "contents", ...style }}>
        {children}
        {/* Le montage attend le client pour éviter un flash lié à un thème
            mémorisé différent du rendu serveur (toujours sombre par défaut). */}
        {mounted && <PersonalizeWidget />}
      </div>
    </SiteThemeContext.Provider>
  );
}
