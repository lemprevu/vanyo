/**
 * État de démo par métier : réglages + collections de chaque section.
 * Persisté dans le navigateur, namespacé par métier, versionné.
 */
import { SETTINGS_FALLBACK } from "@/lib/data";
import type { SiteSettingsFull } from "@/lib/types";
import type { BizState, MetierConfig, Row } from "./types";

const VERSION = "v1";
const key = (metier: string) => `vanyo-demo-${metier}-${VERSION}`;

/** Construit un état neuf à partir de la config (seed initial). */
export function buildSeed(config: MetierConfig): BizState {
  const settings: SiteSettingsFull = {
    ...SETTINGS_FALLBACK,
    turnstile_secret: null,
    smtp_host: null,
    smtp_port: 587,
    smtp_user: null,
    smtp_password: null,
    smtp_from: null,
    notify_email: null,
    site_name: config.businessName,
    brand_color: config.accent,
    ...config.settings,
  };

  const collections: Record<string, Row[]> = {};
  for (const section of config.sections) {
    // Réglages et planning n'ont pas de données propres.
    if (section.type === "settings" || section.type === "planning") continue;
    collections[section.id] = (section.seed ?? []).map((r) => ({ ...r }));
  }

  return { settings, collections };
}

export function loadBizState(config: MetierConfig): BizState {
  if (typeof window === "undefined") return buildSeed(config);
  try {
    const raw = window.localStorage.getItem(key(config.id));
    if (!raw) return buildSeed(config);
    const parsed = JSON.parse(raw) as Partial<BizState>;
    const seed = buildSeed(config);
    return {
      settings: { ...seed.settings, ...(parsed.settings ?? {}) },
      collections: { ...seed.collections, ...(parsed.collections ?? {}) },
    };
  } catch {
    return buildSeed(config);
  }
}

export function saveBizState(metier: string, state: BizState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key(metier), JSON.stringify(state));
  } catch {
    /* quota / navigation privée : la démo reste fonctionnelle en mémoire */
  }
}

export function clearBizState(metier: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key(metier));
  } catch {
    /* ignore */
  }
}
