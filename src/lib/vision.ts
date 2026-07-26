/**
 * VANYO — Générateur d'aperçu « vision du client ».
 *
 * À partir des réponses du formulaire de devis, produit une maquette SVG
 * autonome (aucune police ni image externe) qui donne une intuition visuelle
 * du site.
 *
 * Point important : l'aperçu ne doit ressembler ni au site Vanyo, ni aux autres
 * aperçus. On ne se contente donc pas de recolorer un gabarit unique — on
 * choisit une VRAIE structure de page (archétype) parmi six mises en page
 * franchement différentes : barre latérale, hero plein cadre, écran scindé,
 * grille catalogue, mise en page magazine ou vitrine centrée. Le choix découle
 * du métier et des réponses, il est donc stable pour un même client mais
 * différent d'un client à l'autre.
 *
 * Le SVG est volontairement « pur » (rectangles, textes, dégradés) pour pouvoir
 * être rasterisé en PNG côté navigateur — voir `visionToPng`.
 */

export type VisionInput = {
  siteName?: string | null;
  /** Types de site retenus (multi-sélection). */
  typesSite?: string[] | null;
  /** Objectifs retenus (multi-sélection). */
  objectifs?: string[] | null;
  styleVisuel?: string | null;
  /** Texte libre (« bleu nuit & doré ») ou couleur hexadécimale. */
  couleurs?: string | null;
  pages?: number | null;
  modules?: string[] | null;
  /**
   * Graine de génération. Les mêmes réponses avec la même graine redonnent
   * exactement la même image ; changer la graine produit une autre variante
   * du même brief (c'est le bouton « Regénérer »).
   */
  seed?: number;
};

/* ------------------------------------------------------------------ */
/*  Moteur de variation                                                */
/* ------------------------------------------------------------------ */

/** Générateur pseudo-aléatoire déterministe (mulberry32). */
function makeRandom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rnd = {
  /** Réel dans [min, max[. */
  range: (min: number, max: number) => number;
  /** Entier dans [min, max]. */
  int: (min: number, max: number) => number;
  /** Un élément au hasard. */
  pick: <T>(list: readonly T[]) => T;
  /** Vrai avec la probabilité donnée. */
  chance: (p: number) => boolean;
};

function makeRnd(seed: number): Rnd {
  const r = makeRandom(seed);
  const range = (min: number, max: number) => min + r() * (max - min);
  return {
    range,
    int: (min, max) => Math.floor(range(min, max + 1)),
    pick: (list) => list[Math.floor(r() * list.length)],
    chance: (p) => r() < p,
  };
}

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
  /** Casse des titres de section (les styles « corporate » aiment les capitales). */
  upper: boolean;
};

const THEMES: Record<string, Theme> = {
  "Moderne & épuré": {
    bg: "#FFFFFF", surface: "#F4F5FA", surfaceAlt: "#EBEDF6", text: "#14142B",
    muted: "#8A8CA3", line: "#E3E5EF", radius: 14, font: "Helvetica, Arial, sans-serif",
    titleWeight: 700, dark: false, upper: false,
  },
  "Luxe & premium": {
    bg: "#0B0B10", surface: "#16161F", surfaceAlt: "#1E1E2A", text: "#FFFFFF",
    muted: "#8B8B9E", line: "#262633", radius: 20, font: "Georgia, 'Times New Roman', serif",
    titleWeight: 400, dark: true, upper: true,
  },
  "Coloré & créatif": {
    bg: "#FFFCF7", surface: "#FFF3E4", surfaceAlt: "#FFE7CE", text: "#1B1425",
    muted: "#8D7F94", line: "#F2E2CE", radius: 26, font: "Helvetica, Arial, sans-serif",
    titleWeight: 800, dark: false, upper: false,
  },
  "Corporate & sérieux": {
    bg: "#FFFFFF", surface: "#F1F4F9", surfaceAlt: "#E5EAF2", text: "#0F1B2D",
    muted: "#6B7A90", line: "#DCE3ED", radius: 6, font: "Helvetica, Arial, sans-serif",
    titleWeight: 700, dark: false, upper: true,
  },
  "Chaleureux & convivial": {
    bg: "#FDF8F3", surface: "#F7EDE2", surfaceAlt: "#EFE0D0", text: "#2B1D14",
    muted: "#957F6B", line: "#EADCCB", radius: 22, font: "Georgia, 'Times New Roman', serif",
    titleWeight: 700, dark: false, upper: false,
  },
  Minimaliste: {
    bg: "#FFFFFF", surface: "#FAFAFA", surfaceAlt: "#F2F2F2", text: "#111111",
    muted: "#9A9A9A", line: "#EAEAEA", radius: 2, font: "Helvetica, Arial, sans-serif",
    titleWeight: 500, dark: false, upper: false,
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

/** Déduit la couleur d'accent : hexadécimal explicite, sinon mot-clé, sinon bleu neutre. */
export function resolveAccent(input?: string | null): string {
  const raw = (input ?? "").trim();
  const hex = raw.match(/#[0-9a-fA-F]{6}\b/);
  if (hex) return hex[0];
  const lower = raw.toLowerCase();
  for (const [word, color] of COLOR_WORDS) {
    if (lower.includes(word)) return color;
  }
  // Volontairement PAS le violet Vanyo : l'aperçu ne doit pas ressembler
  // à notre propre site quand le client n'a pas encore choisi de couleur.
  return "#2563EB";
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
/*  Images procédurales                                                */
/* ------------------------------------------------------------------ */

function hexToHsl(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h =
    max === r ? ((g - b) / d + (g < b ? 6 : 0)) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, s, l];
}

const hsl = (h: number, s: number, l: number) =>
  `hsl(${((h % 360) + 360) % 360} ${Math.round(Math.max(0, Math.min(1, s)) * 100)}% ${Math.round(
    Math.max(0, Math.min(1, l)) * 100
  )}%)`;

/**
 * Fabrique un jeu de « photos » procédurales.
 *
 * Chaque visuel est un motif SVG composé de plusieurs taches de couleur
 * floutées : à l'échelle d'une maquette, l'œil le lit comme une photographie
 * abstraite plutôt que comme un aplat. Les teintes dérivent de la couleur du
 * client (harmonies analogues et complémentaires), la composition vient de la
 * graine — deux générations ne donnent donc jamais les mêmes visuels.
 */
function buildPhotos(count: number, rnd: Rnd, accent: string, dark: boolean): { defs: string; ids: string[] } {
  const [baseHue, baseSat] = hexToHsl(accent);
  const defs: string[] = [
    `<filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter>`,
  ];
  const ids: string[] = [];

  for (let i = 0; i < count; i++) {
    const id = `ph${i}`;
    ids.push(id);

    // Chaque visuel a sa propre dominante, proche de la couleur de marque.
    // L'écart reste volontairement faible : au-delà, les visuels jurent avec
    // la charte du client (du vert pomme sur un site bordeaux, par exemple).
    const hue = baseHue + rnd.range(-22, 22);
    const sat = Math.max(0.16, Math.min(0.7, baseSat * rnd.range(0.55, 1)));
    const light = dark ? rnd.range(0.16, 0.3) : rnd.range(0.5, 0.72);

    const shapes: string[] = [
      `<rect width="100" height="100" fill="${hsl(hue, sat * 0.75, light)}"/>`,
    ];

    // Trois à cinq taches floutées, en harmonie avec la dominante.
    const blobs = rnd.int(3, 5);
    for (let b = 0; b < blobs; b++) {
      const bh = hue + rnd.pick([-34, -18, -8, 12, 22, 36]) * rnd.range(0.5, 1);
      const bl = dark ? light + rnd.range(0.04, 0.26) : light + rnd.range(-0.24, 0.24);
      shapes.push(
        `<ellipse cx="${rnd.range(-10, 110).toFixed(1)}" cy="${rnd.range(-10, 110).toFixed(1)}" rx="${rnd
          .range(22, 62)
          .toFixed(1)}" ry="${rnd.range(20, 58).toFixed(1)}" fill="${hsl(bh, sat, bl)}" opacity="${rnd
          .range(0.45, 0.9)
          .toFixed(2)}" filter="url(#soft)"/>`
      );
    }

    // Voile de profondeur : évite l'effet « dégradé plat ».
    shapes.push(
      `<rect width="100" height="100" fill="${dark ? "#000" : "#fff"}" opacity="${rnd
        .range(0.04, 0.14)
        .toFixed(2)}"/>`
    );

    defs.push(
      `<pattern id="${id}" patternUnits="objectBoundingBox" width="1" height="1" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">${shapes.join(
        ""
      )}</pattern>`
    );
  }

  return { defs: defs.join(""), ids };
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

function stroke(x: number, y: number, w: number, h: number, color: string, r = 0, width = 1.5): string {
  return `<rect x="${x}" y="${y}" width="${Math.max(0, w)}" height="${Math.max(0, h)}" rx="${r}" fill="none" stroke="${color}" stroke-width="${width}"/>`;
}

function text(
  x: number, y: number, content: string, size: number, fill: string, font: string,
  weight: number | string = 400, anchor: "start" | "middle" | "end" = "start", letter = 0
): string {
  return `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${
    letter ? ` letter-spacing="${letter}"` : ""
  }>${esc(content)}</text>`;
}

/**
 * Coupe un texte sans casser un mot. Le SVG ne sait pas passer à la ligne
 * tout seul : sans cela on obtient des titres du genre « chaque jo ».
 */
function clip(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const space = cut.lastIndexOf(" ");
  let out = space > max * 0.5 ? cut.slice(0, space) : cut;
  // On évite aussi de terminer sur un mot-outil (« … mérite un site à »),
  // qui donne l'impression d'une phrase tronquée plutôt qu'un titre court.
  out = out.replace(/\s+(à|a|de|du|des|le|la|les|un|une|et|en|pour|sur|avec|qui|que|dans)$/i, "");
  return out.replace(/[,;:]$/, "");
}

/* ------------------------------------------------------------------ */
/*  Contenu adapté au métier                                           */
/* ------------------------------------------------------------------ */

type Blueprint = {
  nav: string[];
  headline: string;
  sub: string;
  sectionTitle: string;
  /** Cartes de la section principale : titre + ligne secondaire. */
  cards: [string, string][];
  /** Archétype de mise en page privilégié pour ce métier. */
  prefer: ArchetypeKey;
};

const BLUEPRINTS: Record<string, Blueprint> = {
  "E-commerce": {
    nav: ["Boutique", "Nouveautés", "À propos", "Livraison", "Contact"],
    headline: "La boutique qui vous ressemble",
    sub: "Des produits sélectionnés avec soin, expédiés sous 48 h.",
    sectionTitle: "Nos best-sellers",
    cards: [["Produit phare", "39 €"], ["Coffret découverte", "59 €"], ["Édition limitée", "79 €"], ["Accessoire", "19 €"], ["Nouveauté", "29 €"], ["Le classique", "45 €"]],
    prefer: "catalog",
  },
  Restaurant: {
    nav: ["La carte", "Réserver", "Le lieu", "Galerie", "Contact"],
    headline: "Une cuisine de saison, chaque jour",
    sub: "Réservez votre table en quelques secondes.",
    sectionTitle: "La carte du moment",
    cards: [["Entrée du jour", "9 €"], ["Plat signature", "24 €"], ["Suggestion", "22 €"], ["Dessert maison", "8 €"], ["Menu déjeuner", "19 €"], ["Accord mets & vins", "12 €"]],
    prefer: "fullbleed",
  },
  Immobilier: {
    nav: ["Acheter", "Louer", "Estimer", "L'agence", "Contact"],
    headline: "Trouvez le bien qui vous attend",
    sub: "Une sélection exclusive, accompagnée de A à Z.",
    sectionTitle: "Nos biens à la une",
    cards: [["Appartement 3 pièces", "349 000 €"], ["Maison avec jardin", "525 000 €"], ["Studio meublé", "620 €/mois"], ["Local commercial", "Sur demande"], ["Duplex terrasse", "412 000 €"], ["Terrain viabilisé", "138 000 €"]],
    prefer: "sidebar",
  },
  Portfolio: {
    nav: ["Projets", "À propos", "Services", "Contact"],
    headline: "Mon travail, en pleine lumière",
    sub: "Une sélection de projets récents.",
    sectionTitle: "Projets récents",
    cards: [["Projet 01", "Identité"], ["Projet 02", "Web"], ["Projet 03", "Photo"], ["Projet 04", "Édition"], ["Projet 05", "Direction artistique"], ["Projet 06", "Motion"]],
    prefer: "magazine",
  },
  Blog: {
    nav: ["Articles", "Catégories", "À propos", "Contact"],
    headline: "Des idées qui méritent d'être lues",
    sub: "Un nouvel article chaque semaine.",
    sectionTitle: "Derniers articles",
    cards: [["Article à la une", "5 min de lecture"], ["Guide pratique", "7 min"], ["Analyse", "4 min"], ["Conseils", "6 min"], ["Entretien", "9 min"], ["Revue de la semaine", "3 min"]],
    prefer: "magazine",
  },
  Association: {
    nav: ["Nos actions", "Adhérer", "Agenda", "Actualités", "Contact"],
    headline: "Agissons ensemble, près de chez vous",
    sub: "Rejoignez-nous en quelques clics.",
    sectionTitle: "Nos prochaines actions",
    cards: [["Journée bénévole", "14 sept."], ["Atelier découverte", "30 août"], ["Collecte annuelle", "12 oct."], ["Assemblée générale", "5 nov."], ["Marché solidaire", "22 nov."], ["Formation", "3 déc."]],
    prefer: "centered",
  },
  "Application Web": {
    nav: ["Fonctions", "Tarifs", "Ressources", "Connexion"],
    headline: "L'outil qui simplifie votre quotidien",
    sub: "Essayez gratuitement, sans carte bancaire.",
    sectionTitle: "Ce que vous pouvez faire",
    cards: [["Tableau de bord", "Vue d'ensemble"], ["Automatisations", "Gagnez du temps"], ["Collaboration", "En équipe"], ["Rapports", "Exportables"], ["Intégrations", "+30 outils"], ["Sécurité", "Chiffré"]],
    prefer: "split",
  },
  "Site vitrine": {
    nav: ["Accueil", "Services", "Réalisations", "À propos", "Contact"],
    headline: "Votre activité mérite un site à sa hauteur",
    sub: "Présentez votre savoir-faire et transformez vos visiteurs en clients.",
    sectionTitle: "Nos services",
    cards: [["Service principal", "En savoir plus"], ["Deuxième service", "En savoir plus"], ["Troisième service", "En savoir plus"], ["Accompagnement", "En savoir plus"], ["Conseil", "En savoir plus"], ["Suivi", "En savoir plus"]],
    prefer: "classic",
  },
};

const DEFAULT_BLUEPRINT = BLUEPRINTS["Site vitrine"];

function ctaLabel(objectifs: string[]): string {
  if (objectifs.includes("Vendre en ligne")) return "Commander";
  if (objectifs.includes("Prendre des rendez-vous")) return "Prendre rendez-vous";
  if (objectifs.includes("Obtenir des contacts / demandes")) return "Demander un devis";
  if (objectifs.includes("Me faire connaître (notoriété)")) return "Découvrir";
  return "Nous contacter";
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
/*  Choix de l'archétype                                               */
/* ------------------------------------------------------------------ */

export type ArchetypeKey = "classic" | "centered" | "sidebar" | "magazine" | "fullbleed" | "catalog" | "split";

const ARCHETYPES: ArchetypeKey[] = ["classic", "centered", "sidebar", "magazine", "fullbleed", "catalog", "split"];

/** Empreinte stable d'une chaîne — sert à varier la mise en page sans hasard. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Choisit la structure de page. Le métier principal donne une préférence
 * (une boutique n'a pas la même page qu'un cabinet), puis les autres réponses
 * font varier le résultat : deux clients du même secteur n'obtiennent pas
 * forcément la même base.
 */
export function pickArchetype(input: VisionInput): ArchetypeKey {
  const types = input.typesSite ?? [];
  const signature = [
    ...types,
    ...(input.objectifs ?? []),
    input.styleVisuel ?? "",
    String(input.pages ?? ""),
    (input.modules ?? []).slice().sort().join("|"),
    // La graine entre dans la signature : « Regénérer » peut donc changer la
    // structure de page, pas seulement les couleurs et les visuels.
    String(input.seed ?? ""),
  ].join("~");

  const preferred = types.map((t) => BLUEPRINTS[t]?.prefer).filter(Boolean) as ArchetypeKey[];
  const h = hash(signature);

  // Plusieurs métiers cochés : on alterne entre leurs mises en page favorites.
  if (preferred.length > 0) {
    // Une réponse sur quatre sort du cadre attendu, pour éviter que deux
    // clients du même secteur repartent avec exactement la même maquette.
    if (preferred.length === 1 && h % 4 === 0) {
      return ARCHETYPES[h % ARCHETYPES.length];
    }
    return preferred[h % preferred.length];
  }
  return ARCHETYPES[h % ARCHETYPES.length];
}

/* ------------------------------------------------------------------ */
/*  Contexte de dessin                                                 */
/* ------------------------------------------------------------------ */

type Ctx = {
  t: Theme;
  accent: string;
  accentSoft: string;
  f: string;
  r: number;
  siteName: string;
  cta: string;
  nav: string[];
  bp: Blueprint;
  badges: string[];
  /** Zone utile intérieure de la fenêtre du navigateur. */
  x: number; y: number; w: number; h: number;
  /** Variations pilotées par la graine. */
  rnd: Rnd;
  /** Visuel procédural n° i (bouclé sur le jeu disponible). */
  photo: (i?: number) => string;
};

const cap = (s: string, t: Theme) => (t.upper ? s.toUpperCase() : s);

/* ---------- Briques réutilisables ---------- */

/** Barre de navigation horizontale classique. */
function topNav(c: Ctx, y: number, variant: "solid" | "ghost" = "ghost"): string {
  const p: string[] = [];
  if (variant === "solid") p.push(rect(c.x - 24, y - 18, c.w + 48, 58, c.t.surface));
  p.push(rect(c.x, y - 2, 24, 24, c.accent, Math.min(c.r, 12)));
  p.push(text(c.x + 34, y + 15, c.siteName, 14, c.t.text, c.f, 700));
  let nx = c.x + 250;
  for (const item of c.nav) {
    p.push(text(nx, y + 15, item, 11.5, c.t.muted, c.f, 500));
    nx += item.length * 6.4 + 24;
  }
  const cw = Math.max(104, c.cta.length * 6.6 + 30);
  p.push(rect(c.x + c.w - cw, y - 4, cw, 30, c.accent, Math.min(c.r, 15)));
  p.push(text(c.x + c.w - cw / 2, y + 15, c.cta, 11.5, "#FFFFFF", c.f, 600, "middle"));
  return p.join("");
}

/** Bande des modules demandés. */
function moduleStrip(c: Ctx, y: number, width = c.w, x = c.x): string {
  if (c.badges.length === 0) return "";
  const p: string[] = [rect(x, y, width, 46, c.accentSoft, c.r)];
  let bx = x + 16;
  for (const b of c.badges) {
    const bw = b.length * 6 + 22;
    if (bx + bw > x + width - 16) break;
    p.push(rect(bx, y + 12, bw, 22, c.t.bg, Math.min(c.r, 11), c.t.dark ? 0.5 : 0.92));
    p.push(text(bx + bw / 2, y + 27, b, 10, c.t.text, c.f, 600, "middle"));
    bx += bw + 8;
  }
  return p.join("");
}

/** Titre de section avec filet d'accent. */
function sectionTitle(c: Ctx, x: number, y: number, label: string, anchor: "start" | "middle" = "start"): string {
  const p = [text(x, y, cap(label, c.t), 19, c.t.text, c.f, c.t.titleWeight, anchor, c.t.upper ? 1.2 : 0)];
  p.push(rect(anchor === "middle" ? x - 22 : x, y + 11, 44, 3, c.accent, 2));
  return p.join("");
}

/** Pied de page. */
function footer(c: Ctx, y: number, height = 44): string {
  return [
    rect(c.x - 24, y, c.w + 48, height, c.t.surface),
    rect(c.x - 24, y, c.w + 48, 1, c.t.line),
    rect(c.x, y + height / 2 - 6, 12, 12, c.accent, Math.min(c.r, 6)),
    text(c.x + 20, y + height / 2 + 4, `© ${c.siteName}`, 10.5, c.t.muted, c.f, 500),
    text(c.x + c.w, y + height / 2 + 4, "Mentions légales · Confidentialité · Contact", 10.5, c.t.muted, c.f, 400, "end"),
  ].join("");
}

/** Carte produit / service générique. */
function card(c: Ctx, x: number, y: number, w: number, h: number, title: string, meta: string, imageRatio = 0.55, photoIndex = 0): string {
  const imgH = Math.round(h * imageRatio);
  return [
    rect(x, y, w, h, c.t.surface, Math.min(c.r, 16)),
    rect(x, y, w, imgH, c.photo(photoIndex), Math.min(c.r, 16)),
    rect(x, y + imgH - Math.min(c.r, 16), w, Math.min(c.r, 16), c.photo(photoIndex)),
    text(x + 12, y + imgH + 22, clip(title, 26), 11.5, c.t.text, c.f, 600),
    text(x + 12, y + imgH + 40, meta, 12, c.accent, c.f, 700),
  ].join("");
}

/* ------------------------------------------------------------------ */
/*  Archétypes de mise en page                                         */
/* ------------------------------------------------------------------ */

/** 1. Classique : barre de nav, hero scindé texte/visuel, rangée de cartes. */
function renderClassic(c: Ctx): string {
  const p: string[] = [];
  let y = c.y + 26;
  p.push(topNav(c, y));
  y += 44;
  p.push(rect(c.x, y, c.w, 1, c.t.line));
  y += 28;

  const textW = Math.round(c.w * 0.5);
  p.push(text(c.x, y + 42, clip(c.bp.headline, 34), 32, c.t.text, c.f, c.t.titleWeight));
  p.push(text(c.x, y + 78, clip(c.bp.sub, 58), 13, c.t.muted, c.f, 400));
  const bw = Math.max(118, c.cta.length * 6.8 + 38);
  p.push(rect(c.x, y + 100, bw, 38, c.accent, Math.min(c.r, 19)));
  p.push(text(c.x + bw / 2, y + 124, c.cta, 12.5, "#FFFFFF", c.f, 600, "middle"));
  p.push(stroke(c.x + bw + 12, y + 100, 124, 38, c.t.line, Math.min(c.r, 19)));
  p.push(text(c.x + bw + 74, y + 124, "En savoir plus", 12.5, c.t.text, c.f, 500, "middle"));
  p.push(text(c.x, y + 172, "★★★★★", 12, c.accent, c.f, 600));
  p.push(text(c.x + 78, y + 172, "98 % de clients satisfaits", 11.5, c.t.muted, c.f, 400));

  const vx = c.x + textW + 24;
  const vw = c.w - textW - 24;
  p.push(rect(vx, y, vw, 208, c.photo(0), c.r));
  p.push(rect(vx + 20, y + 22, vw - 40, 11, "#FFFFFF", 5, 0.5));
  p.push(rect(vx + 20, y + 40, (vw - 40) * 0.6, 11, "#FFFFFF", 5, 0.32));
  p.push(rect(vx + 20, y + 74, vw - 40, 112, "#FFFFFF", Math.min(c.r, 12), c.t.dark ? 0.12 : 0.4));
  y += 230;

  p.push(moduleStrip(c, y));
  if (c.badges.length) y += 64;

  p.push(sectionTitle(c, c.x, y + 16, c.bp.sectionTitle));
  y += 46;

  const gap = 16;
  const cw = (c.w - gap * 3) / 4;
  const ch = Math.min(150, c.y + c.h - y - 60);
  c.bp.cards.slice(0, 4).forEach(([t2, m], i) => {
    p.push(card(c, c.x + i * (cw + gap), y, cw, ch, t2, m, 0.55, i + 1));
  });

  p.push(footer(c, c.y + c.h - 44));
  return p.join("");
}

/** 2. Vitrine centrée : tout est aligné au centre, très aéré. */
function renderCentered(c: Ctx): string {
  const p: string[] = [];
  const mid = c.x + c.w / 2;
  let y = c.y + 24;

  // Nav centrée, logo au milieu
  p.push(text(mid, y + 14, c.siteName, 15, c.t.text, c.f, 700, "middle"));
  let total = 0;
  const items = c.nav.slice(0, 5);
  items.forEach((i) => (total += i.length * 6.4 + 26));
  let nx = mid - total / 2;
  items.forEach((i) => {
    p.push(text(nx, y + 40, i, 11.5, c.t.muted, c.f, 500));
    nx += i.length * 6.4 + 26;
  });
  y += 58;
  p.push(rect(c.x, y, c.w, 1, c.t.line));
  y += 46;

  // Hero centré
  p.push(rect(mid - 60, y, 120, 22, c.accentSoft, 11));
  p.push(text(mid, y + 15, "Bienvenue", 11, c.accent, c.f, 700, "middle", 1));
  y += 44;
  p.push(text(mid, y + 30, clip(c.bp.headline, 36), 36, c.t.text, c.f, c.t.titleWeight, "middle"));
  p.push(text(mid, y + 62, clip(c.bp.sub, 64), 13.5, c.t.muted, c.f, 400, "middle"));
  const bw = Math.max(130, c.cta.length * 7 + 44);
  p.push(rect(mid - bw / 2, y + 84, bw, 40, c.accent, Math.min(c.r, 20)));
  p.push(text(mid, y + 109, c.cta, 13, "#FFFFFF", c.f, 600, "middle"));
  y += 150;

  p.push(moduleStrip(c, y));
  if (c.badges.length) y += 64;

  p.push(sectionTitle(c, mid, y + 16, c.bp.sectionTitle, "middle"));
  y += 48;

  // Trois colonnes larges, icône ronde au-dessus
  const gap = 20;
  const cw = (c.w - gap * 2) / 3;
  const ch = Math.min(150, c.y + c.h - y - 58);
  c.bp.cards.slice(0, 3).forEach(([t2, m], i) => {
    const x = c.x + i * (cw + gap);
    p.push(rect(x, y, cw, ch, c.t.surface, Math.min(c.r, 18)));
    p.push(`<circle cx="${x + cw / 2}" cy="${y + 38}" r="21" fill="${c.accent}" opacity="0.16"/>`);
    p.push(`<circle cx="${x + cw / 2}" cy="${y + 38}" r="8" fill="${c.accent}"/>`);
    p.push(text(x + cw / 2, y + 78, clip(t2, 26), 12.5, c.t.text, c.f, 600, "middle"));
    p.push(text(x + cw / 2, y + 98, m, 11, c.t.muted, c.f, 400, "middle"));
    p.push(text(x + cw / 2, y + ch - 16, "En savoir plus →", 11, c.accent, c.f, 600, "middle"));
  });

  p.push(footer(c, c.y + c.h - 44));
  return p.join("");
}

/** 3. Barre latérale : navigation verticale à gauche, contenu à droite. */
function renderSidebar(c: Ctx): string {
  const p: string[] = [];
  const SW = 190; // largeur de la colonne latérale
  const sx = c.x - 24;

  // Colonne latérale pleine hauteur
  p.push(rect(sx, c.y - 20, SW, c.h + 40, c.t.surface));
  p.push(rect(sx + SW - 1, c.y - 20, 1, c.h + 40, c.t.line));
  p.push(rect(sx + 22, c.y + 6, 22, 22, c.accent, Math.min(c.r, 11)));
  p.push(text(sx + 52, c.y + 22, clip(c.siteName, 18), 13, c.t.text, c.f, 700));

  let ny = c.y + 66;
  c.nav.forEach((item, i) => {
    if (i === 0) p.push(rect(sx + 14, ny - 15, SW - 28, 32, c.accent, Math.min(c.r, 10), 0.14));
    p.push(rect(sx + 26, ny - 5, 12, 12, i === 0 ? c.accent : c.t.muted, 3, i === 0 ? 1 : 0.4));
    p.push(text(sx + 48, ny + 5, item, 11.5, i === 0 ? c.t.text : c.t.muted, c.f, i === 0 ? 600 : 500));
    ny += 38;
  });

  const bw2 = SW - 44;
  p.push(rect(sx + 22, c.y + c.h - 66, bw2, 34, c.accent, Math.min(c.r, 17)));
  p.push(text(sx + 22 + bw2 / 2, c.y + c.h - 44, c.cta, 11.5, "#FFFFFF", c.f, 600, "middle"));

  // Zone de contenu
  const cx = sx + SW + 30;
  const cw = c.x + c.w - cx;
  let y = c.y + 18;

  // Barre de recherche + filtres
  p.push(rect(cx, y, cw - 150, 34, c.t.surfaceAlt, Math.min(c.r, 17)));
  p.push(text(cx + 16, y + 22, "Rechercher…", 11.5, c.t.muted, c.f, 400));
  p.push(rect(cx + cw - 138, y, 138, 34, c.t.surfaceAlt, Math.min(c.r, 17)));
  p.push(text(cx + cw - 69, y + 22, "Filtrer", 11.5, c.t.text, c.f, 600, "middle"));
  y += 54;

  p.push(text(cx, y + 20, clip(c.bp.headline, 32), 26, c.t.text, c.f, c.t.titleWeight));
  p.push(text(cx, y + 44, clip(c.bp.sub, 60), 12.5, c.t.muted, c.f, 400));
  y += 70;

  p.push(moduleStrip(c, y, cw, cx));
  if (c.badges.length) y += 62;

  // Liste de résultats détaillés — on répartit la hauteur restante sur les
  // lignes plutôt que de laisser un grand vide sous la dernière.
  const rows = c.bp.cards.slice(0, 5);
  const avail = c.y + c.h - y - 16;
  const rh = Math.max(56, (avail - (rows.length - 1) * 10) / rows.length);
  rows.forEach(([t2, m], i) => {
    const ry = y + i * (rh + 10);
    p.push(rect(cx, ry, cw, rh, c.t.surface, Math.min(c.r, 14)));
    p.push(rect(cx + 10, ry + 10, rh * 1.35, rh - 20, c.photo(i), Math.min(c.r, 10)));
    p.push(text(cx + rh * 1.35 + 24, ry + rh / 2 - 4, t2, 12.5, c.t.text, c.f, 600));
    p.push(text(cx + rh * 1.35 + 24, ry + rh / 2 + 14, "3 pièces · 78 m² · Bordeaux", 10.5, c.t.muted, c.f, 400));
    p.push(text(cx + cw - 16, ry + rh / 2 + 4, m, 13.5, c.accent, c.f, 700, "end"));
  });

  return p.join("");
}

/** 4. Magazine : un grand article à la une, puis une colonne de brèves. */
function renderMagazine(c: Ctx): string {
  const p: string[] = [];
  let y = c.y + 22;

  // En-tête éditorial : titre centré, filets au-dessus et en dessous
  p.push(rect(c.x, y, c.w, 1, c.t.line));
  p.push(text(c.x + c.w / 2, y + 30, cap(c.siteName, c.t), 24, c.t.text, c.f, c.t.titleWeight, "middle", c.t.upper ? 3 : 0));
  y += 46;
  p.push(rect(c.x, y, c.w, 1, c.t.line));
  let nx = c.x;
  const per = c.w / Math.max(1, c.nav.length);
  c.nav.forEach((item) => {
    p.push(text(nx + per / 2, y + 22, cap(item, c.t), 11, c.t.muted, c.f, 600, "middle", 0.8));
    nx += per;
  });
  y += 34;
  p.push(rect(c.x, y, c.w, 1, c.t.line));
  y += 24;

  // Une : grande image + titre par-dessus, à gauche
  const featW = Math.round(c.w * 0.58);
  const featH = 250;
  p.push(rect(c.x, y, featW, featH, c.photo(0), Math.min(c.r, 10)));
  p.push(rect(c.x, y + featH - 92, featW, 92, c.t.bg, 0, 0.86));
  p.push(rect(c.x + 16, y + featH - 76, 74, 20, c.accent, Math.min(c.r, 4)));
  p.push(text(c.x + 53, y + featH - 62, "À LA UNE", 9.5, "#FFFFFF", c.f, 700, "middle", 1));
  p.push(text(c.x + 16, y + featH - 32, clip(c.bp.headline, 32), 21, c.t.text, c.f, c.t.titleWeight));
  p.push(text(c.x + 16, y + featH - 12, clip(c.bp.sub, 50), 11, c.t.muted, c.f, 400));

  // Colonne de brèves à droite
  const sx = c.x + featW + 26;
  const sw = c.w - featW - 26;
  p.push(sectionTitle(c, sx, y + 12, c.bp.sectionTitle));
  let by = y + 36;
  c.bp.cards.slice(1, 5).forEach(([t2, m], bi) => {
    p.push(rect(sx, by, 54, 44, c.photo(bi + 1), Math.min(c.r, 8)));
    p.push(text(sx + 66, by + 18, clip(t2, 28), 11.5, c.t.text, c.f, 600));
    p.push(text(sx + 66, by + 34, m, 10, c.t.muted, c.f, 400));
    by += 54;
    p.push(rect(sx, by - 6, sw, 1, c.t.line));
  });
  y += featH + 24;

  p.push(moduleStrip(c, y));
  if (c.badges.length) y += 60;

  // Bandeau newsletter — il prend toute la hauteur restante avant le pied de
  // page, pour ne pas laisser un blanc au milieu de la maquette.
  const nlH = Math.max(0, c.y + c.h - y - 56);
  if (nlH > 40) {
    p.push(rect(c.x, y, c.w, nlH, c.accentSoft, Math.min(c.r, 12)));
    p.push(text(c.x + 20, y + 28, "Recevez nos articles par email", 13, c.t.text, c.f, 700));
    p.push(text(c.x + 20, y + 46, "Un envoi par semaine, désinscription en un clic.", 10.5, c.t.muted, c.f, 400));
    p.push(rect(c.x + c.w - 210, y + 16, 120, 32, c.t.bg, Math.min(c.r, 16), 0.9));
    p.push(text(c.x + c.w - 198, y + 36, "votre@email.fr", 10.5, c.t.muted, c.f, 400));
    p.push(rect(c.x + c.w - 84, y + 16, 74, 32, c.accent, Math.min(c.r, 16)));
    p.push(text(c.x + c.w - 47, y + 36, "OK", 11.5, "#FFFFFF", c.f, 700, "middle"));
  }

  p.push(footer(c, c.y + c.h - 44));
  return p.join("");
}

/** 5. Plein cadre : grande image d'ouverture avec texte incrusté. */
function renderFullbleed(c: Ctx): string {
  const p: string[] = [];
  const heroH = Math.round(c.h * 0.52);

  // Image plein cadre, débordant les marges
  p.push(rect(c.x - 24, c.y - 20, c.w + 48, heroH, c.photo(0)));
  p.push(rect(c.x - 24, c.y - 20, c.w + 48, heroH, "#000000", 0, c.t.dark ? 0.3 : 0.18));

  // Nav en surimpression
  p.push(rect(c.x, c.y + 6, 22, 22, "#FFFFFF", Math.min(c.r, 11), 0.95));
  p.push(text(c.x + 32, c.y + 22, c.siteName, 14, "#FFFFFF", c.f, 700));
  let nx = c.x + 250;
  for (const item of c.nav) {
    p.push(text(nx, c.y + 22, item, 11.5, "#FFFFFF", c.f, 500));
    nx += item.length * 6.4 + 24;
  }
  const cw0 = Math.max(104, c.cta.length * 6.6 + 30);
  p.push(stroke(c.x + c.w - cw0, c.y + 4, cw0, 28, "#FFFFFF", Math.min(c.r, 14), 1.5));
  p.push(text(c.x + c.w - cw0 / 2, c.y + 22, c.cta, 11.5, "#FFFFFF", c.f, 600, "middle"));

  // Titre incrusté, aligné en bas à gauche de l'image
  const hy = c.y - 20 + heroH;
  p.push(text(c.x, hy - 78, cap(c.bp.sectionTitle, c.t), 11, "#FFFFFF", c.f, 700, "start", 1.5));
  p.push(text(c.x, hy - 40, clip(c.bp.headline, 34), 38, "#FFFFFF", c.f, c.t.titleWeight));
  p.push(text(c.x, hy - 16, clip(c.bp.sub, 60), 13, "#FFFFFF", c.f, 400));

  let y = hy + 26;

  p.push(moduleStrip(c, y));
  if (c.badges.length) y += 62;

  // Rangée de cartes hautes, style « carte de menu »
  const gap = 14;
  const n = 4;
  const cw = (c.w - gap * (n - 1)) / n;
  const ch = Math.max(60, c.y + c.h - y - 56);
  c.bp.cards.slice(0, n).forEach(([t2, m], i) => {
    const x = c.x + i * (cw + gap);
    p.push(rect(x, y, cw, ch, c.t.surface, Math.min(c.r, 14)));
    p.push(rect(x, y, cw, 4, c.accent, 0));
    p.push(text(x + 14, y + 32, clip(t2, 24), 12.5, c.t.text, c.f, 600));
    p.push(text(x + 14, y + 52, "Description courte du plat", 10.5, c.t.muted, c.f, 400));
    p.push(text(x + cw - 14, y + 32, m, 14, c.accent, c.f, 700, "end"));
    // Visuel du plat : occupe la place restante sous le texte.
    if (ch > 110) p.push(rect(x + 14, y + 66, cw - 28, ch - 80, c.photo(i), Math.min(c.r, 10)));
  });

  p.push(footer(c, c.y + c.h - 44));
  return p.join("");
}

/** 6. Catalogue : barre de filtres puis grille dense de produits. */
function renderCatalog(c: Ctx): string {
  const p: string[] = [];
  let y = c.y + 24;
  p.push(topNav(c, y, "solid"));
  y += 52;

  // Barre d'annonce promo
  p.push(rect(c.x - 24, y, c.w + 48, 30, c.accent));
  p.push(text(c.x + c.w / 2, y + 20, "Livraison offerte dès 50 € d'achat", 11.5, "#FFFFFF", c.f, 600, "middle"));
  y += 46;

  // Filtres
  const filters = ["Tout", "Nouveautés", "Meilleures ventes", "Prix", "Taille"];
  let fx = c.x;
  filters.forEach((fl, i) => {
    const fw = fl.length * 6.4 + 26;
    p.push(
      i === 0
        ? rect(fx, y, fw, 28, c.accent, Math.min(c.r, 14))
        : stroke(fx, y, fw, 28, c.t.line, Math.min(c.r, 14), 1)
    );
    p.push(text(fx + fw / 2, y + 18, fl, 10.5, i === 0 ? "#FFFFFF" : c.t.muted, c.f, 600, "middle"));
    fx += fw + 8;
  });
  p.push(text(c.x + c.w, y + 18, `${c.bp.cards.length * 4} résultats`, 11, c.t.muted, c.f, 400, "end"));
  y += 44;

  // Grille 3 × 2
  const gap = 16;
  const cols = 3, rows = 2;
  const cw = (c.w - gap * (cols - 1)) / cols;
  const avail = c.y + c.h - y - 52;
  const ch = (avail - gap) / rows;
  c.bp.cards.slice(0, cols * rows).forEach(([t2, m], i) => {
    const x = c.x + (i % cols) * (cw + gap);
    const yy = y + Math.floor(i / cols) * (ch + gap);
    p.push(card(c, x, yy, cw, ch, t2, m, 0.62, i));
    // Pastille « nouveau » sur le premier
    if (i === 0) {
      p.push(rect(x + 10, yy + 10, 58, 18, c.accent, Math.min(c.r, 9)));
      p.push(text(x + 39, yy + 23, "NOUVEAU", 8.5, "#FFFFFF", c.f, 700, "middle", 0.5));
    }
  });

  p.push(footer(c, c.y + c.h - 44));
  return p.join("");
}

/** 7. Écran scindé : panneau coloré à gauche, contenu à droite. */
function renderSplit(c: Ctx): string {
  const p: string[] = [];
  const half = Math.round(c.w * 0.44);
  const px = c.x - 24;
  const pw = half + 24;

  // Panneau plein couleur
  p.push(rect(px, c.y - 20, pw, c.h + 40, "url(#g2)"));
  p.push(rect(px + 40, c.y + 18, 24, 24, "#FFFFFF", Math.min(c.r, 12), 0.95));
  p.push(text(px + 74, c.y + 35, c.siteName, 14, "#FFFFFF", c.f, 700));

  p.push(text(px + 40, c.y + 160, clip(c.bp.headline, 26), 34, "#FFFFFF", c.f, c.t.titleWeight));
  p.push(text(px + 40, c.y + 192, clip(c.bp.sub, 44), 13, "#FFFFFF", c.f, 400));
  const bw = Math.max(126, c.cta.length * 7 + 40);
  p.push(rect(px + 40, c.y + 218, bw, 40, "#FFFFFF", Math.min(c.r, 20)));
  p.push(text(px + 40 + bw / 2, c.y + 243, c.cta, 12.5, c.accent, c.f, 700, "middle"));

  // Trois arguments en bas du panneau
  ["Sans engagement", "Mise en route en 5 min", "Support inclus"].forEach((t2, i) => {
    const yy = c.y + c.h - 120 + i * 30;
    p.push(`<circle cx="${px + 50}" cy="${yy - 4}" r="7" fill="#FFFFFF" opacity="0.85"/>`);
    p.push(text(px + 68, yy, t2, 11.5, "#FFFFFF", c.f, 500));
  });

  // Colonne de droite
  const rx = c.x + half + 24;
  const rw = c.x + c.w - rx;
  let y = c.y + 26;

  let nx = rx;
  c.nav.forEach((item) => {
    p.push(text(nx, y + 14, item, 11.5, c.t.muted, c.f, 500));
    nx += item.length * 6.4 + 22;
  });
  y += 44;

  p.push(sectionTitle(c, rx, y + 14, c.bp.sectionTitle));
  y += 44;

  // Empilement de blocs « fonctionnalité » : on occupe toute la colonne.
  const items = c.bp.cards.slice(0, 5);
  const stripH = c.badges.length ? 58 : 0;
  const avail = c.y + c.h - y - stripH - 16;
  const bh = Math.max(52, (avail - (items.length - 1) * 10) / items.length);
  items.forEach(([t2, m], i) => {
    const by = y + i * (bh + 10);
    p.push(rect(rx, by, rw, bh, c.t.surface, Math.min(c.r, 14)));
    p.push(rect(rx + 12, by + (bh - 30) / 2, 30, 30, c.accent, Math.min(c.r, 8), 0.18));
    p.push(rect(rx + 22, by + bh / 2 - 5, 10, 10, c.accent, 2));
    p.push(text(rx + 54, by + bh / 2 - 2, t2, 12.5, c.t.text, c.f, 600));
    p.push(text(rx + 54, by + bh / 2 + 15, m, 10.5, c.t.muted, c.f, 400));
  });
  y += items.length * (bh + 10) + 8;

  p.push(moduleStrip(c, y, rw, rx));

  return p.join("");
}

const RENDERERS: Record<ArchetypeKey, (c: Ctx) => string> = {
  classic: renderClassic,
  centered: renderCentered,
  sidebar: renderSidebar,
  magazine: renderMagazine,
  fullbleed: renderFullbleed,
  catalog: renderCatalog,
  split: renderSplit,
};

/* ------------------------------------------------------------------ */
/*  Assemblage                                                         */
/* ------------------------------------------------------------------ */

export function buildVisionSvg(input: VisionInput): string {
  const rnd = makeRnd(input.seed ?? 1);
  const t = themeFor(input.styleVisuel);
  const accent = resolveAccent(input.couleurs);
  const accentSoft = shift(accent, t.dark ? -0.62 : 0.86);
  const types = input.typesSite ?? [];
  const bp = BLUEPRINTS[types[0] ?? ""] ?? DEFAULT_BLUEPRINT;
  const archetype = pickArchetype(input);

  const siteName = (input.siteName || "Votre marque").slice(0, 26);
  const domain =
    siteName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "votre-site";

  const navCount = Math.max(3, Math.min(bp.nav.length, input.pages ?? 4));

  const badges = (input.modules ?? [])
    .map((k) => MODULE_BADGES[k])
    .filter((b): b is string => !!b)
    .slice(0, 7);

  const parts: string[] = [];

  // Jeu de visuels procéduraux, propre à cette génération.
  const photos = buildPhotos(8, rnd, accent, t.dark);
  const photo = (i = 0) => `url(#${photos.ids[Math.abs(i) % photos.ids.length]})`;

  // ── Défs : visuels + dégradés ────────────────────────────────────
  parts.push(`<defs>
    ${photos.defs}
    <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${accent}" stop-opacity="${t.dark ? 0.5 : 0.85}"/>
      <stop offset="100%" stop-color="${shift(accent, 0.4)}" stop-opacity="${t.dark ? 0.18 : 0.5}"/>
    </linearGradient>
    <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${shift(accent, -0.25)}"/>
      <stop offset="100%" stop-color="${shift(accent, 0.3)}"/>
    </linearGradient>
    <linearGradient id="g3" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0.03"/>
    </linearGradient>
  </defs>`);

  // ── Fond de scène (neutre : l'aperçu n'est pas « du Vanyo ») ──────
  parts.push(rect(0, 0, VISION_WIDTH, VISION_HEIGHT, "#0E1016"));
  parts.push(rect(0, 0, VISION_WIDTH, VISION_HEIGHT, "url(#g3)"));

  // ── Fenêtre navigateur ────────────────────────────────────────────
  const WX = 40, WY = 36, WW = VISION_WIDTH - 80, WH = VISION_HEIGHT - 76;
  parts.push(rect(WX, WY, WW, WH, "#000000", 18, 0.35));
  parts.push(rect(WX, WY, WW, WH, t.bg, 18));

  const CHROME = 42;
  parts.push(rect(WX, WY, WW, CHROME, t.surface, 18));
  parts.push(rect(WX, WY + CHROME - 18, WW, 18, t.surface));
  parts.push(rect(WX, WY + CHROME - 1, WW, 1, t.line));
  parts.push(rect(WX + 20, WY + 17, 9, 9, "#FF5F57", 4.5));
  parts.push(rect(WX + 36, WY + 17, 9, 9, "#FEBC2E", 4.5));
  parts.push(rect(WX + 52, WY + 17, 9, 9, "#28C840", 4.5));
  parts.push(rect(WX + 80, WY + 11, WW - 160, 20, t.bg, 10));
  parts.push(text(WX + 94, WY + 25, `${domain}.fr`, 11, t.muted, t.font, 400));

  // ── Contenu de la page, selon l'archétype ─────────────────────────
  const ctx: Ctx = {
    t, accent, accentSoft, f: t.font, r: t.radius,
    siteName, cta: ctaLabel(input.objectifs ?? []), nav: bp.nav.slice(0, navCount), bp, badges,
    x: WX + 34, y: WY + CHROME + 8, w: WW - 68, h: WH - CHROME - 16,
    rnd, photo,
  };

  // Le contenu est découpé à la fenêtre, pour qu'un panneau plein cadre
  // ne déborde jamais des coins arrondis du navigateur.
  parts.push(
    `<clipPath id="win"><rect x="${WX}" y="${WY + CHROME}" width="${WW}" height="${WH - CHROME}" rx="0"/></clipPath>`
  );
  parts.push(`<g clip-path="url(#win)">${RENDERERS[archetype](ctx)}</g>`);

  parts.push(stroke(WX, WY, WW, WH, t.line, 18, 1));

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
