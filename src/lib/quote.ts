/**
 * Suggestion de prix automatique à partir d'une demande de devis.
 * Règles déterministes (pas d'IA) : base par type de site + coût par
 * fonctionnalité + pages/options supplémentaires. Sert de point de départ
 * pour l'échange avec le client, pas un prix figé à annoncer tel quel.
 */
import type { Devis } from "@/lib/devis";

export type QuoteLine = { label: string; amount: number };
export type QuoteEstimate = {
  total: number;
  lines: QuoteLine[];
  /** Signalé si le budget annoncé par le client est nettement sous l'estimation. */
  belowClientBudget: boolean;
};

const BASE_BY_TYPE: Record<string, number> = {
  "Site vitrine": 500,
  "Portfolio": 500,
  "Blog": 500,
  "Association": 450,
  "Restaurant": 650,
  "Immobilier": 900,
  "E-commerce": 1200,
  "Application Web": 1800,
  "Autre": 600,
};

const FEATURE_PRICE: Record<string, number> = {
  "Connexion": 200,
  "Paiement": 350,
  "Blog": 150,
  "Galerie": 80,
  "Contact": 0,
  "Agenda": 200,
  "Réservation": 250,
  "Espace Client": 400,
  "Dashboard": 400,
  "Newsletter": 100,
  "Chat": 150,
  "Multilingue": 300,
  "Animations": 150,
  "SEO": 150,
  "Autre": 100,
};

/** Nombre de pages estimé à partir du texte libre/segment choisi dans le formulaire. */
function pagesCount(nombrePages?: string | null): number {
  if (!nombrePages) return 3;
  const digits = nombrePages.match(/\d+/g);
  if (!digits) return 3;
  // "5-8" -> on retient la borne haute (plus prudent pour l'estimation).
  return Math.max(...digits.map(Number));
}

function pagesSurcharge(count: number): number {
  if (count <= 3) return 0;
  if (count <= 5) return 150;
  if (count <= 8) return 350;
  if (count <= 12) return 600;
  return 900;
}

/** Le budget annoncé par le client, en euros (borne basse de la tranche). */
function clientBudgetFloor(budget?: string | null): number | null {
  if (!budget) return null;
  const digits = budget.match(/\d+/g);
  if (!digits) return null;
  return Number(digits[0]);
}

export function suggestQuote(devis: Devis): QuoteEstimate {
  const lines: QuoteLine[] = [];

  const base = BASE_BY_TYPE[devis.type_site ?? ""] ?? BASE_BY_TYPE["Autre"];
  lines.push({ label: `Base — ${devis.type_site || "Site"}`, amount: base });

  const pages = pagesCount(devis.nombre_pages);
  const pagesExtra = pagesSurcharge(pages);
  if (pagesExtra > 0) lines.push({ label: `Volume de pages (${devis.nombre_pages})`, amount: pagesExtra });

  for (const f of devis.fonctionnalites ?? []) {
    const price = FEATURE_PRICE[f] ?? 100;
    if (price > 0) lines.push({ label: `Fonctionnalité — ${f}`, amount: price });
  }

  if (devis.pages_supplementaires && devis.pages_supplementaires > 0) {
    lines.push({ label: `${devis.pages_supplementaires} page(s) supplémentaire(s)`, amount: devis.pages_supplementaires * 50 });
  }

  for (const o of devis.options ?? []) {
    if (o === "Livraison prioritaire (72 h)") lines.push({ label: o, amount: 100 });
    // Maintenance mensuelle / logo / rédaction : "sur devis", non chiffrés ici.
  }

  if (devis.contenu_type === "Je veux que vous rédigiez tout") {
    lines.push({ label: "Rédaction de contenu", amount: 200 });
  }
  if (devis.logo === "À créer") {
    lines.push({ label: "Création de logo", amount: 150 });
  }

  const total = Math.round(lines.reduce((sum, l) => sum + l.amount, 0) / 10) * 10;
  const clientFloor = clientBudgetFloor(devis.budget);
  const belowClientBudget = clientFloor !== null && total > clientFloor * 1.5;

  return { total, lines, belowClientBudget };
}
