/**
 * Construit la description envoyée au modèle d'image à partir des réponses
 * du formulaire de devis.
 *
 * Objectif : obtenir une maquette qui reflète CE QUE LE CLIENT A DEMANDÉ, et
 * surtout pas notre propre charte. On décrit donc explicitement son secteur,
 * son style, sa couleur et ses fonctionnalités, et on interdit au modèle de
 * partir sur un rendu « agence web sombre et violette ».
 */
import type { Devis } from "@/lib/devis";
import { devisTypes, devisObjectifs, selectionFromDevis } from "@/lib/quote";
import { resolveAccent } from "@/lib/vision";
import { DEFAULT_CATALOG, type Catalog } from "@/lib/catalog";

/** Ambiance visuelle associée à chaque style proposé dans le formulaire. */
const STYLE_BRIEF: Record<string, string> = {
  "Moderne & épuré": "clean modern minimalism, generous white space, crisp sans-serif typography, subtle soft shadows, light background",
  "Luxe & premium": "refined luxury aesthetic, dark elegant background, elegant serif headlines, gold or metallic accents, lots of negative space",
  "Coloré & créatif": "playful and colourful, bold rounded shapes, large expressive typography, warm off-white background, energetic layout",
  "Corporate & sérieux": "corporate and trustworthy, structured grid, restrained palette, sharp rectangular cards, professional business look",
  "Chaleureux & convivial": "warm and welcoming, soft beige and cream tones, rounded corners, friendly serif headlines, lifestyle photography",
  Minimaliste: "extreme minimalism, mostly white, thin hairline rules, very small restrained typography, almost no decoration",
};

/** Type de page à représenter selon le métier principal. */
const LAYOUT_BRIEF: Record<string, string> = {
  "E-commerce": "an online shop homepage with a product grid, price labels, filter chips and an announcement bar",
  Restaurant: "a restaurant homepage with a large appetising food hero image, a menu section with dish names and prices, and a reservation button",
  Immobilier: "a real-estate agency homepage with a property search bar and a list of property cards showing photos, prices and surface areas",
  Portfolio: "a creative portfolio homepage with a large editorial gallery of project thumbnails and minimal navigation",
  Blog: "a magazine style blog homepage with one large featured article and a column of smaller article previews",
  Association: "a non-profit association homepage with a centred hero, an events list and a prominent donate or join button",
  "Application Web": "a SaaS product landing page with a split-screen hero, feature blocks with icons and a pricing hint",
  "Site vitrine": "a small business homepage with a hero section, a services row and a contact call to action",
};

const OBJECTIF_BRIEF: Record<string, string> = {
  "Vendre en ligne": "the layout is built to drive online purchases",
  "Prendre des rendez-vous": "a booking / appointment call to action is prominent",
  "Obtenir des contacts / demandes": "a clear contact or quote request call to action is prominent",
  "Présenter mon activité": "the layout showcases the business and its expertise",
  "Me faire connaître (notoriété)": "the layout is designed to build brand awareness",
};

/** Traduit une couleur en formulation exploitable par le modèle. */
function colourBrief(devis: Devis): string {
  const raw = (devis.couleurs_souhaitees ?? "").trim();
  const hex = resolveAccent(raw);
  // On donne l'hexadécimal ET la formulation libre du client : le modèle suit
  // mieux une intention nommée (« bleu nuit & doré ») qu'un code seul.
  const words = raw.replace(/#[0-9a-fA-F]{6}/g, "").replace(/[()]/g, "").trim();
  return words ? `${words} (dominant accent colour ${hex})` : `dominant accent colour ${hex}`;
}

export function buildVisionPrompt(devis: Devis, catalog: Catalog = DEFAULT_CATALOG): string {
  const types = devisTypes(devis);
  const objectifs = devisObjectifs(devis);
  const sel = selectionFromDevis(devis);
  const pack = sel.pack ? catalog.packsByKey[sel.pack] : undefined;

  const layout = LAYOUT_BRIEF[types[0] ?? ""] ?? LAYOUT_BRIEF["Site vitrine"];
  const style = STYLE_BRIEF[devis.style_visuel ?? ""] ?? STYLE_BRIEF["Moderne & épuré"];

  const modules = [...new Set([...(sel.modules ?? []), ...(pack?.includes ?? [])])]
    .map((k) => catalog.modulesByKey[k]?.label)
    .filter(Boolean)
    .slice(0, 8);

  const brand = devis.entreprise || `${devis.prenom} ${devis.nom}`.trim() || "the business";

  const parts = [
    `A realistic website design mockup shown on a desktop browser window, for ${brand}.`,
    `The page is ${layout}.`,
    `Visual style: ${style}.`,
    `Colour direction: ${colourBrief(devis)}.`,
  ];

  const goals = objectifs.map((o) => OBJECTIF_BRIEF[o]).filter(Boolean);
  if (goals.length) parts.push(`Purpose: ${goals.join("; ")}.`);

  if (types.length > 1) {
    parts.push(`The business combines several activities: ${types.join(", ")} — the page reflects that mix.`);
  }
  if (modules.length) parts.push(`Visible sections or features: ${modules.join(", ")}.`);
  if (devis.ambiance) parts.push(`Overall feeling: ${devis.ambiance}.`);
  if (devis.public_cible) parts.push(`Target audience: ${devis.public_cible}.`);
  if (sel.pages) parts.push(`The navigation has about ${Math.min(7, sel.pages)} menu entries.`);

  parts.push(
    "Rendered as a clean UI design mockup: readable layout blocks, placeholder photography, realistic French interface labels.",
    // Garde-fous : on écarte explicitement notre propre identité visuelle.
    "Do NOT use a dark purple or violet web-agency aesthetic. Do NOT include any logo, watermark, brand name of a web agency, or lorem ipsum. No text gibberish in large headings.",
    "Front view, straight on, full page visible, high quality, no people looking at a screen, no desk, no mockup hands."
  );

  return parts.join(" ");
}
