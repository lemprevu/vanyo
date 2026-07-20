/** Petites fonctions de validation / assainissement sans dépendance externe. */

export const isEmail = (v: unknown): v is string =>
  typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254;

export const str = (v: unknown, max = 2000): string | null =>
  typeof v === "string" ? v.trim().slice(0, max) : null;

export const req = (v: unknown, max = 500): string | null => {
  const s = str(v, max);
  return s && s.length > 0 ? s : null;
};

/** Neutralise les balises pour éviter le XSS stocké côté affichage brut. */
export const clean = (v: string): string =>
  v.replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const strArray = (v: unknown, maxItems = 40): string[] =>
  Array.isArray(v)
    ? v.filter((x) => typeof x === "string").slice(0, maxItems).map((x) => (x as string).slice(0, 100))
    : [];
