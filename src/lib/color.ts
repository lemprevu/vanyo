/** Petites fonctions couleur pour dériver une palette d'accent à partir d'un hex. */

function clamp(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function parseHex(hex: string): [number, number, number] | null {
  const m = hex.trim().replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(m)) return null;
  return [parseInt(m.slice(0, 2), 16), parseInt(m.slice(2, 4), 16), parseInt(m.slice(4, 6), 16)];
}

function toHex([r, g, b]: [number, number, number]) {
  return "#" + [r, g, b].map((v) => clamp(v).toString(16).padStart(2, "0")).join("");
}

/** Éclaircit (amount > 0) ou assombrit (amount < 0) une couleur hex. */
export function shade(hex: string, amount: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  const factor = amount >= 0 ? 255 : 0;
  const t = Math.abs(amount);
  return toHex([
    rgb[0] + (factor - rgb[0]) * t,
    rgb[1] + (factor - rgb[1]) * t,
    rgb[2] + (factor - rgb[2]) * t,
  ]);
}

/** Convertit un hex en "r, g, b" pour les rgba(...) dans les styles. */
export function rgbChannels(hex: string): string {
  const rgb = parseHex(hex);
  return rgb ? rgb.join(", ") : "109, 74, 255";
}
