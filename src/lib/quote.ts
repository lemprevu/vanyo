/**
 * Estimation automatique d'un projet.
 *
 * Règles déterministes (pas d'IA) lisant le catalogue commercial : formule de
 * base + pages supplémentaires + modules non compris + mise en ligne + délai,
 * puis la maintenance mensuelle à part.
 *
 * La même fonction alimente le compteur en direct du formulaire public et le
 * prix suggéré du panel admin : le client et vous voyez donc exactement le
 * même chiffre.
 */
import {
  PACKS_BY_KEY, PACK_UNDECIDED, MODULES_BY_KEY, EXTRA_PAGE_PRICE, PAGES_UNLIMITED,
  DEPLOIEMENTS_BY_KEY, MAINTENANCE_PLANS_BY_KEY, MAINTENANCE_OPTIONS_BY_KEY, DELAIS_BY_KEY,
} from "@/lib/catalog";
import type { Devis } from "@/lib/devis";

export type QuoteLine = { label: string; amount: number; note?: string };

export type QuoteEstimate = {
  /** Lignes du montant ponctuel (création du site). */
  lines: QuoteLine[];
  /** Total ponctuel, arrondi à la dizaine. */
  total: number;
  /** Lignes de l'abonnement mensuel. */
  monthlyLines: QuoteLine[];
  /** Total mensuel (maintenance). */
  monthly: number;
  /** Vrai si la formule choisie est « Sur Mesure » : pas de prix ferme. */
  surDevis: boolean;
  /** Formule retenue pour le calcul (celle choisie, ou celle conseillée). */
  packKey: string;
  /** Vrai si la formule a été déduite parce que le client n'a pas choisi. */
  packSuggested: boolean;
  /** Signalé si le budget annoncé est nettement sous l'estimation. */
  belowClientBudget: boolean;
};

export type QuoteSelection = {
  pack?: string | null;
  typeSite?: string | null;
  pages?: number | null;
  modules?: string[] | null;
  deploiement?: string | null;
  maintenance?: string | null;
  maintenanceOptions?: string[] | null;
  delai?: string | null;
  budget?: string | null;
};

/* ------------------------------------------------------------------ */
/*  Recommandation de formule                                          */
/* ------------------------------------------------------------------ */

const HEAVY_MODULES = ["boutique", "paiement", "espace_client", "dashboard", "utilisateurs", "multilingue"];
const MID_MODULES = ["admin", "blog", "rdv", "reservation", "planning", "seo_avance", "avis"];

/** Déduit la formule la plus adaptée quand le client n'en a pas choisi. */
export function recommendPack(sel: QuoteSelection): string {
  const modules = sel.modules ?? [];
  const pages = sel.pages ?? 3;

  if (sel.typeSite === "Application Web") return "surmesure";
  if (modules.filter((m) => HEAVY_MODULES.includes(m)).length >= 2) return "premium";
  if (modules.some((m) => m === "boutique") || sel.typeSite === "E-commerce") return "premium";
  if (pages > 8 || modules.some((m) => HEAVY_MODULES.includes(m))) return "premium";
  if (pages > 3 || modules.some((m) => MID_MODULES.includes(m))) return "business";
  return "starter";
}

/* ------------------------------------------------------------------ */
/*  Estimation                                                         */
/* ------------------------------------------------------------------ */

/** Borne basse de la tranche de budget annoncée par le client, en euros. */
function clientBudgetFloor(budget?: string | null): number | null {
  if (!budget) return null;
  const digits = budget.match(/\d+/g);
  if (!digits) return null;
  return Number(digits[0]);
}

export function estimate(sel: QuoteSelection): QuoteEstimate {
  const chosen = sel.pack && sel.pack !== PACK_UNDECIDED ? sel.pack : null;
  const packKey = chosen ?? recommendPack(sel);
  const pack = PACKS_BY_KEY[packKey] ?? PACKS_BY_KEY.business;
  const surDevis = pack.base === null;

  const lines: QuoteLine[] = [];
  const monthlyLines: QuoteLine[] = [];

  // ── Base ────────────────────────────────────────────────────────
  if (!surDevis) {
    lines.push({
      label: `Formule ${pack.name}`,
      amount: pack.base ?? 0,
      note: `${pack.pagesLabel} page(s), ${pack.includes.length} module(s) compris`,
    });
  }

  // ── Pages au-delà de ce que la formule comprend ─────────────────
  const pages = Math.max(1, sel.pages ?? pack.pagesIncluded);
  const extraPages = pack.pagesIncluded >= PAGES_UNLIMITED ? 0 : Math.max(0, pages - pack.pagesIncluded);
  if (extraPages > 0) {
    lines.push({
      label: `${extraPages} page${extraPages > 1 ? "s" : ""} au-delà de la formule`,
      amount: extraPages * EXTRA_PAGE_PRICE,
      note: `${EXTRA_PAGE_PRICE} € par page`,
    });
  }

  // ── Modules non compris dans la formule ─────────────────────────
  for (const key of sel.modules ?? []) {
    const mod = MODULES_BY_KEY[key];
    if (!mod || mod.price === 0) continue;
    if (pack.includes.includes(key)) continue; // déjà compris : facturé 0
    lines.push({ label: mod.label, amount: mod.price });
  }

  // ── Mise en ligne ───────────────────────────────────────────────
  const deploiement = sel.deploiement ? DEPLOIEMENTS_BY_KEY[sel.deploiement] : undefined;
  if (deploiement && deploiement.price > 0) {
    lines.push({ label: deploiement.label, amount: deploiement.price });
  }

  // ── Délai ───────────────────────────────────────────────────────
  const delai = sel.delai ? DELAIS_BY_KEY[sel.delai] : undefined;
  if (delai && delai.price > 0) {
    lines.push({ label: delai.label, amount: delai.price });
  }

  // ── Maintenance mensuelle ───────────────────────────────────────
  const plan = sel.maintenance ? MAINTENANCE_PLANS_BY_KEY[sel.maintenance] : undefined;
  if (plan && plan.price > 0) {
    monthlyLines.push({
      label: `Maintenance ${plan.label}`,
      amount: plan.price,
      note: pack.maintenanceOfferte > 0 ? `${pack.maintenanceOfferte} mois offerts` : undefined,
    });
    for (const key of sel.maintenanceOptions ?? []) {
      const opt = MAINTENANCE_OPTIONS_BY_KEY[key];
      if (opt) monthlyLines.push({ label: opt.label, amount: opt.price });
    }
  }

  const rawTotal = lines.reduce((sum, l) => sum + l.amount, 0);
  const total = Math.round(rawTotal / 10) * 10;
  const monthly = monthlyLines.reduce((sum, l) => sum + l.amount, 0);

  const floor = clientBudgetFloor(sel.budget);
  const belowClientBudget = !surDevis && floor !== null && total > floor * 1.5;

  return {
    lines, total, monthlyLines, monthly, surDevis,
    packKey, packSuggested: !chosen, belowClientBudget,
  };
}

/* ------------------------------------------------------------------ */
/*  Adaptation depuis une ligne `devis` (y compris anciennes lignes)   */
/* ------------------------------------------------------------------ */

/** Correspondance entre les anciens libellés de fonctionnalités et les modules. */
const LEGACY_FEATURES: Record<string, string> = {
  Connexion: "espace_client",
  Paiement: "paiement",
  Blog: "blog",
  Galerie: "galerie",
  Contact: "contact",
  Agenda: "planning",
  Réservation: "reservation",
  "Espace Client": "espace_client",
  Dashboard: "dashboard",
  Newsletter: "newsletter",
  Chat: "chat",
  Multilingue: "multilingue",
  Animations: "animations",
  SEO: "seo_avance",
};

/** Nombre de pages déduit d'un ancien champ texte (« 5-8 » → 8). */
function legacyPages(nombrePages?: string | null): number | null {
  if (!nombrePages) return null;
  const digits = nombrePages.match(/\d+/g);
  if (!digits) return null;
  return Math.max(...digits.map(Number));
}

/** Convertit une demande enregistrée en sélection chiffrable. */
export function selectionFromDevis(d: Devis): QuoteSelection {
  const modules =
    d.modules && d.modules.length > 0
      ? d.modules
      : (d.fonctionnalites ?? [])
          .map((f) => LEGACY_FEATURES[f])
          .filter((k): k is string => !!k);

  return {
    pack: d.formule ?? null,
    typeSite: d.type_site,
    pages: d.pages_total ?? legacyPages(d.nombre_pages),
    modules,
    deploiement: d.deploiement ?? null,
    maintenance: d.maintenance ?? null,
    maintenanceOptions: d.maintenance_options ?? null,
    delai: d.delai ?? null,
    budget: d.budget,
  };
}

export function suggestQuote(d: Devis): QuoteEstimate {
  return estimate(selectionFromDevis(d));
}
