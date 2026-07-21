/** Utilitaires de calcul sur les prix affichés (ex : "1 490€"). */

/** Extrait le montant numérique d'un prix ("1 490€" → 1490). null si non chiffré (ex : "Sur devis"). */
export function parsePrice(price: string): number | null {
  const digits = price.replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : null;
}

export const formatPrice = (n: number) => Math.round(n).toLocaleString("fr-FR") + "€";

/** Pourcentage de réduction entre un prix conseillé et un prix affiché. */
export function discountPercent(original: number, current: number): number {
  if (original <= 0 || current >= original) return 0;
  return Math.round((1 - current / original) * 100);
}

export function applyPercent(amount: number, percent: number): number {
  return Math.max(0, Math.round(amount * (1 - percent / 100)));
}
