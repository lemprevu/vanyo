/**
 * VANYO — Générateur d'aperçu « vision du client ».
 *
 * À partir des réponses du formulaire de devis, produit une maquette SVG
 * autonome (aucune police ni image externe) qui donne une intuition visuelle
 * du site : couleur d'accent, style, mise en page propre au type d'activité et
 * blocs correspondant aux modules demandés.
 *
 * Le SVG est volontairement « pur » (rectangles, textes, dégradés) pour pouvoir
 * être rasterisé en PNG côté navigateur — voir `visionToPng`.
 */

export type VisionInput = {
  siteName?: string | null;
  typeSite?: string | null;
  objectif?: string | null;
  styleVisuel?: string | null;
  /** Texte libre (« bleu nuit & doré ») ou couleur hexadécimale. */
  couleurs?: string | null;
  pages?: number | null;
  modules?: string[] | null;
};

export const VISION_WIDTH = 1200;
export const VISION_HEIGHT = 820;

/* ------------------------------------------------------------------ */
/*  Palette & style                                                    */
/* ------------------------------------------------------------------ */

type Theme = {
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  muted: string;
  line: string;
  radius: number;
  font: string;
  titleWeight: number;
  dark: boolean;
};

const THEMES: Record<string, Theme> = {
  "Moderne & épuré": {
    bg: "#FFFFFF", surface: "#F4F5FA", surfaceAlt: "#EBEDF6", text: "#14142B",
    muted: "#8A8CA3", line: "#E3E5EF", radius: 14, font: "Helvetica, Arial, sans-serif", titleWeight: 700, dark: false,
  },
  "Luxe & premium": {
    bg: "#0B0B10", surface: "#16161F", surfaceAlt: "#1E1E2A", text: "#FFFFFF",
    muted: "#8B8B9E", line: "#262633", radius: 20, font: "Georgia, 'Times New Roman', serif", titleWeight: 400, dark: true,
  },
  "Coloré & créatif": {
    bg: "#FFFCF7", surface: "#FFF3E4", surfaceAlt: "#FFE7CE", text: "#1B1425",
    muted: "#8D7F94", line: "#F2E2CE", radius: 26, font: "Helvetica, Arial, sans-serif", titleWeight: 800, dark: false,
  },
  "Corporate & sérieux": {
    bg: "#FFFFFF", surface: "#F1F4F9", surfaceAlt: "#E5EAF2", text: "#0F1B2D",
    muted: "#6B7A90", line: "#DCE3ED", radius: 6, font: "Helvetica, Arial, sans-serif", titleWeight: 700, dark: false,
  },
  "Chaleureux & convivial": {
    bg: "#FDF8F3", surface: "#F7EDE2", surfaceAlt: "#EFE0D0", text: "#2B1D14",
    muted: "#957F6B", line: "#EADCCB", radius: 22, font: "Georgia, 'Times New Roman', serif", titleWeight: 700, dark: false,
  },
  Minimaliste: {
    bg: "#FFFFFF", surface: "#FAFAFA", surfaceAlt: "#F2F2F2", text: "#111111",
    muted: "#9A9A9A", line: "#EAEAEA", radius: 2, font: "Helvetica, Arial, sans-serif", titleWeight: 500, dark: false,
  },
};

const DEFAULT_THEME = THEMES["Moderne & épuré"];

/** Couleurs nommées reconnues dans le texte libre « couleurs souhaitées ». */
const COLOR_WORDS: [string, string][] = [
  ["bleu nuit", "#1E3A8A"], ["bleu ciel", "#38BDF8"], ["bleu", "#2563EB"],
  ["vert sapin", "#166534"], ["vert", "#16A34A"], ["rouge", "#DC2626"],
  ["bordeaux", "#7F1D1D"], ["rose", "#EC4899"], ["orange", "#EA580C"],
  ["jaune", "#EAB308"], ["violet", "#7C3AED"], ["mauve", "#A855F7"],
  ["turquoise", "#14B8A6"], ["émeraude", "#059669"], ["emeraude", "#059669"],
  ["doré", "#C9A227"], ["dore", "#C9A227"], ["or", "#C9A227"],
  ["argent", "#94A3B8"], ["marron", "#92400E"], ["beige", "#C8B393"],
  ["gris", "#64748B"], ["noir", "#1F2937"], ["blanc", "#94A3B8"],
];

/** Déduit la couleur d'accent : hexadécimal explicite, sinon mot-clé, sinon violet Vanyo. */
export function resolveAccent(input?: string | null): string {
  const raw = (input ?? "").trim();
  const hex = raw.match(/#[0-9a-fA-F]{6}\b/);
  if (hex) return hex[0];
  const lower = raw.toLowerCase();
  for (const [word, color] of COLOR_WORDS) {
    if (lower.includes(word)) return color;
  }
  return "#6D4AFF";
}

function themeFor(style?: string | null): Theme {
  return (style && THEMES[style]) || DEFAULT_THEME;
}

/** Éclaircit/assombrit une couleur hexadécimale (ratio entre -1 et 1). */
function shift(hex: string, ratio: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) =>
    Math.max(0, Math.min(255, Math.round(ratio >= 0 ? c + (255 - c) * ratio : c * (1 + ratio))))
  );
  return "#" + ch.map((c) => c.toString(16).padStart(2, "0")).join("");
}

/* ------------------------------------------------------------------ */
/*  Primitives SVG                                                     */
/* ------------------------------------------------------------------ */

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rect(x: number, y: number, w: number, h: number, fill: string, r = 0, opacity = 1): string {
  return `<rect x="${x}" y="${y}" width="${Math.max(0, w)}" height="${Math.max(0, h)}" rx="${r}" fill="${fill}"${
    opacity !== 1 ? ` opacity="${opacity}"` : ""
  }/>`;
}

function text(
  x: number, y: number, content: string, size: number, fill: string, font: string,
  weight: number | string = 400, anchor: "start" | "middle" | "end" = "start"
): string {
  return `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${esc(
    content
  )}</text>`;
}

/** Barre grise figurant une ligne de texte non lisible (placeholder). */
const bar = (x: number, y: number, w: number, h: number, fill: string, r: number) => rect(x, y, w, h, fill, r);

/* ------------------------------------------------------------------ */
/*  Contenu adapté au métier                                           */
/* ------------------------------------------------------------------ */

type Blueprint = {
  /** Libellés des entrées de menu. */
  nav: string[];
  /** Titre affiché dans le hero. */
  headline: string;
  /** Sous-titre. */
  sub: string;
  /** Intitulé de la section principale sous le hero. */
  sectionTitle: string;
  /** Cartes de la section principale : titre + ligne secondaire. */
  cards: [string, string][];
  /** Disposition de la section principale. */
  layout: "cards" | "list" | "gallery";
};

const BLUEPRINTS: Record<string, Blueprint> = {
  "E-commerce": {
    nav: ["Boutique", "Nouveautés", "À propos", "Livraison", "Contact"],
    headline: "La boutique qui vous ressemble",
    sub: "Des produits sélectionnés avec soin, expédiés sous 48 h.",
    sectionTitle: "Nos best-sellers",
    cards: [["Produit phare", "39 €"], ["Coffret découverte", "59 €"], ["Édition limitée", "79 €"], ["Accessoire", "19 €"]],
    layout: "cards",
  },
  Restaurant: {
    nav: ["La carte", "Réserver", "Le lieu", "Galerie", "Contact"],
    headline: "Une cuisine de saison, chaque jour",
    sub: "Réservez votre table en quelques secondes.",
    sectionTitle: "La carte du moment",
    cards: [["Entrée du jour", "9 €"], ["Plat signature", "24 €"], ["Suggestion", "22 €"], ["Dessert maison", "8 €"]],
    layout: "list",
  },
  Immobilier: {
    nav: ["Acheter", "Louer", "Estimer", "L'agence", "Contact"],
    headline: "Trouvez le bien qui vous attend",
    sub: "Une sélection exclusive, accompagnée de A à Z.",
    sectionTitle: "Nos biens à la une",
    cards: [["Appartement 3 pièces", "349 000 €"], ["Maison avec jardin", "525 000 €"], ["Studio meublé", "620 €/mois"], ["Local commercial", "Sur demande"]],
    layout: "cards",
  },
  Portfolio: {
    nav: ["Projets", "À propos", "Services", "Contact"],
    headline: "Mon travail, en pleine lumière",
    sub: "Une sélection de projets récents.",
    sectionTitle: "Projets récents",
    cards: [["Projet 01", "Identité"], ["Projet 02", "Web"], ["Projet 03", "Photo"], ["Projet 04", "Édition"]],
    layout: "gallery",
  },
  Blog: {
    nav: ["Articles", "Catégories", "À propos", "Contact"],
    headline: "Des idées qui méritent d'être lues",
    sub: "Un nouvel article chaque semaine.",
    sectionTitle: "Derniers articles",
    cards: [["Article à la une", "5 min de lecture"], ["Guide pratique", "7 min"], ["Analyse", "4 min"], ["Conseils", "6 min"]],
    layout: "list",
  },
  Association: {
    nav: ["Nos actions", "Adhérer", "Agenda", "Actualités", "Contact"],
    headline: "Agissons ensemble, près de chez vous",
    sub: "Rejoignez-nous en quelques clics.",
    sectionTitle: "Nos prochaines actions",
    cards: [["Journée bénévole", "14 sept."], ["Atelier découverte", "30 août"], ["Collecte annuelle", "12 oct."], ["Assemblée générale", "5 nov."]],
    layout: "cards",
  },
  "Application Web": {
    nav: ["Fonctions", "Tarifs", "Ressources", "Connexion"],
    headline: "L'outil qui simplifie votre quotidien",
    sub: "Essayez gratuitement, sans carte bancaire.",
    sectionTitle: "Ce que vous pouvez faire",
    cards: [["Tableau de bord", "Vue d'ensemble"], ["Automatisations", "Gagnez du temps"], ["Collaboration", "En équipe"], ["Rapports", "Exportables"]],
    layout: "cards",
  },
};

const DEFAULT_BLUEPRINT: Blueprint = {
  nav: ["Accueil", "Services", "Réalisations", "À propos", "Contact"],
  headline: "Votre activité mérite un site à sa hauteur",
  sub: "Présentez votre savoir-faire et transformez vos visiteurs en clients.",
  sectionTitle: "Nos services",
  cards: [["Service principal", "En savoir plus"], ["Deuxième service", "En savoir plus"], ["Troisième service", "En savoir plus"], ["Accompagnement", "En savoir plus"]],
  layout: "cards",
};

function ctaLabel(objectif?: string | null): string {
  switch (objectif) {
    case "Vendre en ligne": return "Commander";
    case "Prendre des rendez-vous": return "Prendre rendez-vous";
    case "Obtenir des contacts / demandes": return "Demander un devis";
    case "Me faire connaître (notoriété)": return "Découvrir";
    default: return "Nous contacter";
  }
}

/** Étiquettes courtes des modules, pour la bande « fonctionnalités ». */
const MODULE_BADGES: Record<string, string> = {
  galerie: "Galerie", blog: "Blog", multilingue: "Multilingue", redaction: "Contenu rédigé",
  logo: "Logo", charte: "Charte graphique", contact: "Contact", formulaire_avance: "Formulaire avancé",
  rdv: "Rendez-vous", reservation: "Réservation", newsletter: "Newsletter", chat: "Chat",
  avis: "Avis clients", paiement: "Paiement", boutique: "Boutique", espace_client: "Espace client",
  devis_ligne: "Devis en ligne", admin: "Panel admin", dashboard: "Statistiques", planning: "Planning",
  utilisateurs: "Comptes", journal: "Journal", seo_base: "SEO", seo_avance: "SEO avancé",
  seo_local: "SEO local", analytics: "Analytics", animations: "Animations", perf: "Performances",
};

/* ------------------------------------------------------------------ */
/*  Construction du SVG                                                */
/* ------------------------------------------------------------------ */

export function buildVisionSvg(input: VisionInput): string {
  const theme = themeFor(input.styleVisuel);
  const accent = resolveAccent(input.couleurs);
  const accentSoft = shift(accent, theme.dark ? -0.55 : 0.82);
  const blueprint = BLUEPRINTS[input.typeSite ?? ""] ?? DEFAULT_BLUEPRINT;
  const r = theme.radius;
  const f = theme.font;

  const siteName = (input.siteName || "Votre marque").slice(0, 28);
  const domain =
    siteName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "votre-site";

  const navCount = Math.max(3, Math.min(blueprint.nav.length, input.pages ?? 4));
  const nav = blueprint.nav.slice(0, navCount);

  const badges = (input.modules ?? [])
    .map((k) => MODULE_BADGES[k])
    .filter((b): b is string => !!b)
    .slice(0, 7);

  const parts: string[] = [];

  // ── Défs : dégradés ───────────────────────────────────────────────
  parts.push(`<defs>
    <linearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${accent}" stop-opacity="${theme.dark ? 0.55 : 0.9}"/>
      <stop offset="100%" stop-color="${shift(accent, 0.35)}" stop-opacity="${theme.dark ? 0.2 : 0.55}"/>
    </linearGradient>
    <linearGradient id="ctaGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${accent}"/>
      <stop offset="100%" stop-color="${shift(accent, 0.25)}"/>
    </linearGradient>
    <linearGradient id="softGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0.04"/>
    </linearGradient>
  </defs>`);

  // ── Fond de scène ─────────────────────────────────────────────────
  parts.push(rect(0, 0, VISION_WIDTH, VISION_HEIGHT, "#0A0A0F"));
  parts.push(rect(0, 0, VISION_WIDTH, VISION_HEIGHT, "url(#softGrad)"));

  // ── Fenêtre navigateur ────────────────────────────────────────────
  const WX = 40, WY = 36, WW = VISION_WIDTH - 80, WH = VISION_HEIGHT - 76;
  parts.push(rect(WX, WY, WW, WH, "#000000", 18, 0.35));
  parts.push(rect(WX, WY, WW, WH, theme.bg, 18));

  // Barre de navigateur
  const CHROME = 44;
  parts.push(rect(WX, WY, WW, CHROME, theme.surface, 18));
  parts.push(rect(WX, WY + CHROME - 18, WW, 18, theme.surface));
  parts.push(rect(WX, WY + CHROME - 1, WW, 1, theme.line));
  parts.push(rect(WX + 20, WY + 18, 9, 9, "#FF5F57", 4.5));
  parts.push(rect(WX + 36, WY + 18, 9, 9, "#FEBC2E", 4.5));
  parts.push(rect(WX + 52, WY + 18, 9, 9, "#28C840", 4.5));
  parts.push(rect(WX + 80, WY + 12, WW - 160, 20, theme.bg, 10));
  parts.push(text(WX + 94, WY + 26, `${domain}.fr`, 11, theme.muted, f, 400));

  // ── En-tête du site ───────────────────────────────────────────────
  const CX = WX + 36;                 // marge intérieure gauche
  const CW = WW - 72;                 // largeur de contenu
  let y = WY + CHROME + 30;

  parts.push(rect(CX, y - 2, 26, 26, "url(#ctaGrad)", Math.min(r, 13)));
  parts.push(text(CX + 36, y + 16, siteName, 15, theme.text, f, 700));

  // Menu
  let navX = CX + 250;
  for (const item of nav) {
    parts.push(text(navX, y + 16, item, 12, theme.muted, f, 500));
    navX += item.length * 6.6 + 26;
  }
  // Bouton d'appel à l'action
  const cta = ctaLabel(input.objectif);
  const ctaW = Math.max(110, cta.length * 7 + 34);
  parts.push(rect(CX + CW - ctaW, y - 4, ctaW, 32, "url(#ctaGrad)", Math.min(r, 16)));
  parts.push(text(CX + CW - ctaW / 2, y + 16, cta, 12, "#FFFFFF", f, 600, "middle"));

  y += 46;
  parts.push(rect(CX, y, CW, 1, theme.line));
  y += 30;

  // ── Hero ──────────────────────────────────────────────────────────
  const HERO_H = 236;
  const heroTextW = Math.round(CW * 0.52);

  parts.push(text(CX, y + 46, blueprint.headline.slice(0, 34), 34, theme.text, f, theme.titleWeight));
  parts.push(text(CX, y + 84, blueprint.sub.slice(0, 52), 14, theme.muted, f, 400));

  // Deux boutons
  const btnW = Math.max(120, cta.length * 7 + 40);
  parts.push(rect(CX, y + 108, btnW, 40, "url(#ctaGrad)", Math.min(r, 20)));
  parts.push(text(CX + btnW / 2, y + 133, cta, 13, "#FFFFFF", f, 600, "middle"));
  parts.push(rect(CX + btnW + 14, y + 108, 130, 40, "none", Math.min(r, 20)));
  parts.push(
    `<rect x="${CX + btnW + 14}" y="${y + 108}" width="130" height="40" rx="${Math.min(r, 20)}" fill="none" stroke="${theme.line}" stroke-width="1.5"/>`
  );
  parts.push(text(CX + btnW + 79, y + 133, "En savoir plus", 13, theme.text, f, 500, "middle"));

  // Preuve sociale
  parts.push(text(CX, y + 182, "★ ★ ★ ★ ★", 13, accent, f, 600));
  parts.push(text(CX + 92, y + 182, "98 % de clients satisfaits", 12, theme.muted, f, 400));

  // Visuel du hero
  const visX = CX + heroTextW + 24;
  const visW = CW - heroTextW - 24;
  parts.push(rect(visX, y, visW, HERO_H - 20, "url(#heroGrad)", r));
  parts.push(rect(visX + 22, y + 24, visW - 44, 12, "#FFFFFF", Math.min(r, 6), 0.55));
  parts.push(rect(visX + 22, y + 44, (visW - 44) * 0.62, 12, "#FFFFFF", Math.min(r, 6), 0.35));
  parts.push(rect(visX + 22, y + 82, visW - 44, HERO_H - 130, "#FFFFFF", Math.min(r, 12), theme.dark ? 0.12 : 0.42));

  y += HERO_H + 8;

  // ── Bande « fonctionnalités demandées » ───────────────────────────
  if (badges.length > 0) {
    parts.push(rect(CX, y, CW, 54, accentSoft, r));
    let bx = CX + 20;
    for (const b of badges) {
      const bw = b.length * 6.4 + 26;
      if (bx + bw > CX + CW - 20) break;
      parts.push(rect(bx, y + 15, bw, 24, theme.bg, Math.min(r, 12), theme.dark ? 0.5 : 0.9));
      parts.push(text(bx + bw / 2, y + 31, b, 11, theme.text, f, 600, "middle"));
      bx += bw + 10;
    }
    y += 74;
  }

  // ── Section principale, selon le métier ───────────────────────────
  parts.push(text(CX, y + 18, blueprint.sectionTitle, 20, theme.text, f, theme.titleWeight));
  parts.push(rect(CX, y + 30, 46, 3, accent, 2));
  y += 54;

  const remaining = WY + WH - y - 62; // place restante avant le pied de page

  if (blueprint.layout === "list") {
    // Hauteur calculée pour que les 4 lignes tiennent exactement dans la place restante.
    const gap = 8;
    const rowH = Math.min(52, Math.max(34, (remaining - gap * 3) / 4));
    blueprint.cards.slice(0, 4).forEach(([title, meta], i) => {
      const ry = y + i * (rowH + gap);
      parts.push(rect(CX, ry, CW, rowH, theme.surface, Math.min(r, 14)));
      parts.push(rect(CX + 12, ry + 10, rowH - 20, rowH - 20, "url(#heroGrad)", Math.min(r, 10)));
      parts.push(text(CX + rowH + 8, ry + rowH / 2 - 2, title, 13, theme.text, f, 600));
      parts.push(text(CX + rowH + 8, ry + rowH / 2 + 14, "Description courte de la ligne", 11, theme.muted, f, 400));
      parts.push(text(CX + CW - 18, ry + rowH / 2 + 4, meta, 14, accent, f, 700, "end"));
    });
  } else if (blueprint.layout === "gallery") {
    const gap = 14;
    const cellW = (CW - gap * 3) / 4;
    const cellH = Math.min(150, remaining - 10);
    blueprint.cards.slice(0, 4).forEach(([title, meta], i) => {
      const gx = CX + i * (cellW + gap);
      parts.push(rect(gx, y, cellW, cellH, "url(#heroGrad)", Math.min(r, 16)));
      parts.push(rect(gx, y + cellH - 42, cellW, 42, theme.bg, 0, 0.82));
      parts.push(text(gx + 12, y + cellH - 22, title, 12, theme.text, f, 600));
      parts.push(text(gx + 12, y + cellH - 8, meta, 10, theme.muted, f, 400));
    });
  } else {
    const gap = 16;
    const cellW = (CW - gap * 3) / 4;
    const cellH = Math.min(158, remaining - 10);
    blueprint.cards.slice(0, 4).forEach(([title, meta], i) => {
      const gx = CX + i * (cellW + gap);
      parts.push(rect(gx, y, cellW, cellH, theme.surface, Math.min(r, 16)));
      parts.push(rect(gx + 12, y + 12, cellW - 24, cellH - 76, "url(#heroGrad)", Math.min(r, 12)));
      parts.push(text(gx + 12, y + cellH - 40, title.slice(0, 22), 12, theme.text, f, 600));
      parts.push(text(gx + 12, y + cellH - 22, meta, 12, accent, f, 700));
      parts.push(bar(gx + 12, y + cellH - 14, cellW - 60, 5, theme.line, 3));
    });
  }

  // ── Pied de page ──────────────────────────────────────────────────
  const footY = WY + WH - 48;
  parts.push(rect(WX, footY, WW, 48, theme.surface));
  parts.push(rect(WX, footY, WW, 1, theme.line));
  parts.push(rect(WX + 36, footY + 18, 14, 14, "url(#ctaGrad)", Math.min(r, 7)));
  parts.push(text(WX + 58, footY + 29, `© ${siteName}`, 11, theme.muted, f, 500));
  parts.push(text(WX + WW - 36, footY + 29, "Mentions légales · Confidentialité · Contact", 11, theme.muted, f, 400, "end"));
  // Coins arrondis du bas de la fenêtre
  parts.push(
    `<rect x="${WX}" y="${WY}" width="${WW}" height="${WH}" rx="18" fill="none" stroke="${theme.line}" stroke-width="1"/>`
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${VISION_WIDTH}" height="${VISION_HEIGHT}" viewBox="0 0 ${VISION_WIDTH} ${VISION_HEIGHT}" role="img" aria-label="Aperçu de votre futur site">${parts.join(
    ""
  )}</svg>`;
}

/* ------------------------------------------------------------------ */
/*  Export image (navigateur uniquement)                               */
/* ------------------------------------------------------------------ */

/**
 * Rasterise le SVG en PNG (data URL). À n'appeler que côté client.
 * `scale` = 2 produit une image nette pour l'impression ou l'e-mail.
 */
export function visionToPng(svg: string, scale = 2): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Pas de crossOrigin : le SVG est inline, aucune ressource externe.
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = VISION_WIDTH * scale;
      canvas.height = VISION_HEIGHT * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas indisponible"));
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, VISION_WIDTH, VISION_HEIGHT);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("Impossible de générer l'image"));
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  });
}

/** Déclenche le téléchargement du PNG de l'aperçu. */
export async function downloadVision(svg: string, filename = "vision-de-votre-site.png") {
  const url = await visionToPng(svg);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
