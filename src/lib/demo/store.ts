/**
 * Persistance locale de l'état de démo (route /demo).
 * Tout reste dans le navigateur du visiteur (localStorage), isolé de
 * Supabase et des autres visiteurs. Versionné pour pouvoir invalider un
 * ancien schéma sans casser la démo.
 */
import { makeSeed, type DemoState } from "./seed";

export type { DemoState } from "./seed";
export type DemoEntity = Exclude<keyof DemoState, "settings">;

const KEY = "vanyo-demo-v1";

/** Charge l'état persisté, ou un seed neuf si absent/corrompu. */
export function loadDemoState(): DemoState {
  if (typeof window === "undefined") return makeSeed();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return makeSeed();
    const parsed = JSON.parse(raw) as Partial<DemoState>;
    // Fusion avec un seed neuf : garantit que toute clé ajoutée depuis la
    // dernière visite existe, sans écraser les modifications du visiteur.
    return { ...makeSeed(), ...parsed };
  } catch {
    return makeSeed();
  }
}

export function saveDemoState(state: DemoState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Quota plein ou navigation privée : la démo reste fonctionnelle en mémoire.
  }
}

export function clearDemoState(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
