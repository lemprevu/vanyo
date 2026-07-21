"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { SiteSettingsFull } from "@/lib/types";
import { makeSeed, type DemoState } from "./seed";
import { loadDemoState, saveDemoState, clearDemoState, type DemoEntity } from "./store";

type DemoContextValue = {
  state: DemoState;
  /** Remplace la liste complète d'une entité (réalisations, avis, devis…). */
  setEntity: <K extends DemoEntity>(key: K, rows: DemoState[K]) => void;
  /** Met à jour les paramètres du site. */
  setSettings: (settings: SiteSettingsFull) => void;
  /** Réinitialise toute la démo au contenu d'origine. */
  reset: () => void;
};

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  // `null` tant que le client n'a pas hydraté : évite tout décalage
  // serveur/client (localStorage n'existe pas côté serveur).
  const [state, setState] = useState<DemoState | null>(null);

  useEffect(() => {
    // Hydratation client : localStorage n'existe pas côté serveur, on charge
    // donc l'état une fois monté (motif standard pour un état client-only).
    setState(loadDemoState()); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const setEntity = useCallback(<K extends DemoEntity>(key: K, rows: DemoState[K]) => {
    setState((prev) => {
      if (!prev) return prev;
      const next = { ...prev, [key]: rows };
      saveDemoState(next);
      return next;
    });
  }, []);

  const setSettings = useCallback((settings: SiteSettingsFull) => {
    setState((prev) => {
      if (!prev) return prev;
      const next = { ...prev, settings };
      saveDemoState(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    clearDemoState();
    setState(makeSeed());
  }, []);

  if (!state) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink text-sm text-white/50">
        Chargement de la démonstration…
      </div>
    );
  }

  return (
    <DemoContext.Provider value={{ state, setEntity, setSettings, reset }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo doit être utilisé dans un <DemoProvider>.");
  return ctx;
}
