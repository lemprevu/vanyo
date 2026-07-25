/**
 * Estimation automatique d'un projet.
 *
 * Règles déterministes (pas d'IA) lisant le catalogue commercial : formule de
 * base + pages supplémentaires + modules non compris + mise en ligne + délai,
 * puis la maintenance mensuelle à part, et enfin la remise en cours.
 *
 * La même fonction alimente le compteur en direct du formulaire public et le
 * prix suggéré du panel admin : le client et vous voyez donc exactement le
 * même chiffre. Le catalogue est passé en paramètre pour que les tarifs
 * personnalisés depuis Paramètres → Tarifs soient pris en compte partout.
 */
import {
  DEFAULT_CATALOG, PACK_UNDECIDED, PAGES_UNLIMITED, applyDiscount,
  type Catalog,
} from "@/lib/catalog";
import type { Devis } from "@/lib/devis";

export type QuoteLine = { label: string; amount: number; note?: string };

export type QuoteEstimate = {
  /** Lignes du montant ponctuel (création du site). */
  lines: QuoteLine[];
  /** Total ponctuel avant remise, arrondi à la dizaine. */
  subtotal: number;
  /** Total ponctuel après remise. */
  total: number;
  /** Remise appliquée, en pourcentage (0 si aucune). */
  discountPercent: number;
  /** Libellé de la remise (« Offre de lancement »…). */
  discountLabel: string | null;
  /** Montant économisé grâce à la remise. */
  saved: number;
  /** Lignes de l'abonnement mensuel. */
  monthlyLines: QuoteLine[];
  /** Total mensuel (maintenance). */
  monthly: number;
  /** Nombre de mois de maintenance offerts par la formule. */
  monthsFree: number;
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
  /** Types de site retenus (multi-sélection). */
  typesSite?: string[] | null;
  pages?: number | null;
  modules?: string[] | null;
  deploiement?: string | null;
  maintenance?: string | null;
  maintenanceOptions?: string[] | null;
  delai?: string | null;
  budget?: string | null;
  /** Remise en cours (promo globale ou code), en pourcentage. */
  discountPercent?: number | null;
  discountLabel?: string | null;
};

/* ------------------------------------------------------------------ */
/*  Recommandation de formule                                          */
/* ------------------------------------------------------------------ */

const HEAVY_MODULES = ["boutique", "paiement", "espace_client", "dashboard", "utilisateurs", "multilingue"];
const MID_MODULES = ["admin", "blog", "rdv", "reservation", "planning", "seo_avance", "avis"];

/** Déduit la formule la plus adaptée quand le client n'en a pas choisi. */
export function recommendPack(sel: QuoteSelection): string {
  const modules = sel.modules ?? [];
  const types = sel.typesSite ?? [];
  const pages = sel.pages ?? 3;

  if (types.includes("Application Web")) return "surmesure";
  // Plusieurs métiers très différents dans un même site : c'est du sur-mesure.
  if (types.length >= 3) return "premium";
  if (modules.filter((m) => HEAVY_MODULES.includes(m)).length >= 2) return "premium";
  if (modules.includes("boutique") || types.includes("E-commerce")) return "premium";
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

export function estimate(sel: QuoteSelection, catalog: Catalog = DEFAULT_CATALOG): QuoteEstimate {
  const chosen = sel.pack && sel.pack !== PACK_UNDECIDED ? sel.pack : null;
  const packKey = chosen ?? recommendPack(sel);
  const pack = catalog.packsByKey[packKey] ?? catalog.packsByKey.business ?? catalog.packs[0];
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
      amount: extraPages * catalog.extraPagePrice,
      note: `${catalog.extraPagePrice} € par page`,
    });
  }

  // ── Modules non compris dans la formule ─────────────────────────
  for (const key of sel.modules ?? []) {
    const mod = catalog.modulesByKey[key];
    if (!mod || mod.price === 0) continue;
    if (pack.includes.includes(key)) continue; // déjà compris : facturé 0
    lines.push({ label: mod.label, amount: mod.price });
  }

  // ── Mise en ligne ───────────────────────────────────────────────
  const deploiement = sel.deploiement ? catalog.deploiementsByKey[sel.deploiement] : undefined;
  if (deploiement && deploiement.price > 0) {
    lines.push({ label: deploiement.label, amount: deploiement.price });
  }

  // ── Délai ───────────────────────────────────────────────────────
  const delai = sel.delai ? catalog.delaisByKey[sel.delai] : undefined;
  if (delai && delai.price > 0) {
    lines.push({ label: delai.label, amount: delai.price });
  }

  // ── Maintenance mensuelle ───────────────────────────────────────
  const plan = sel.maintenance ? catalog.maintenancePlansByKey[sel.maintenance] : undefined;
  if (plan && plan.price > 0) {
    monthlyLines.push({
      label: `Maintenance ${plan.label}`,
      amount: plan.price,
      note: pack.maintenanceOfferte > 0 ? `${pack.maintenanceOfferte} mois offerts` : undefined,
    });
    for (const key of sel.maintenanceOptions ?? []) {
      const opt = catalog.maintenanceOptionsByKey[key];
      if (opt) monthlyLines.push({ label: opt.label, amount: opt.price });
    }
  }

  // ── Totaux et remise ────────────────────────────────────────────
  const subtotal = Math.round(lines.reduce((sum, l) => sum + l.amount, 0) / 10) * 10;
  const discountPercent = Math.max(0, Math.min(90, sel.discountPercent ?? 0));
  const total = surDevis ? 0 : applyDiscount(subtotal, discountPercent);
  const saved = subtotal - total;
  const monthly = monthlyLines.reduce((sum, l) => sum + l.amount, 0);

  const floor = clientBudgetFloor(sel.budget);
  const belowClientBudget = !surDevis && floor !== null && total > floor * 1.5;

  return {
    lines, subtotal, total,
    discountPercent, discountLabel: discountPercent > 0 ? (sel.discountLabel ?? "Remise en cours") : null, saved,
    monthlyLines, monthly, monthsFree: pack.maintenanceOfferte,
    surDevis, packKey, packSuggested: !chosen, belowClientBudget,
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

/** Types de site d'une demande, qu'elle vienne de la v1 (texte) ou de la v2 (liste). */
export function devisTypes(d: Devis): string[] {
  if (d.types_site && d.types_site.length > 0) return d.types_site;
  return d.type_site ? [d.type_site] : [];
}

/** Objectifs d'une demande, v1 (texte) ou v2 (liste). */
export function devisObjectifs(d: Devis): string[] {
  if (d.objectifs && d.objectifs.length > 0) return d.objectifs;
  return d.objectif ? [d.objectif] : [];
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
    typesSite: devisTypes(d),
    pages: d.pages_total ?? legacyPages(d.nombre_pages),
    modules,
    deploiement: d.deploiement ?? null,
    maintenance: d.maintenance ?? null,
    maintenanceOptions: d.maintenance_options ?? null,
    delai: d.delai ?? null,
    budget: d.budget,
    discountPercent: d.remise_percent ?? 0,
    discountLabel: d.remise_label ?? null,
  };
}

export function suggestQuote(d: Devis, catalog: Catalog = DEFAULT_CATALOG): QuoteEstimate {
  return estimate(selectionFromDevis(d), catalog);
}
