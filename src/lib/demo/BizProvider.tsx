"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { SiteSettingsFull } from "@/lib/types";
import type { BizState, MetierConfig, Row } from "./types";
import { buildSeed, loadBizState, saveBizState, clearBizState } from "./biz-store";

type BizContextValue = {
  config: MetierConfig;
  state: BizState;
  /** Remplace les lignes d'une section. */
  setCollection: (sectionId: string, rows: Row[]) => void;
  /** Met à jour les réglages du site. */
  setSettings: (settings: SiteSettingsFull) => void;
  /** Réinitialise ce métier au contenu d'origine. */
  reset: () => void;
};

const BizContext = createContext<BizContextValue | null>(null);

export function BizProvider({ config, children }: { config: MetierConfig; children: React.ReactNode }) {
  const [state, setState] = useState<BizState | null>(null);

  useEffect(() => {
    // Hydratation client (localStorage indisponible côté serveur).
    setState(loadBizState(config)); // eslint-disable-line react-hooks/set-state-in-effect
  }, [config]);

  const setCollection = useCallback((sectionId: string, rows: Row[]) => {
    setState((prev) => {
      if (!prev) return prev;
      const next = { ...prev, collections: { ...prev.collections, [sectionId]: rows } };
      saveBizState(config.id, next);
      return next;
    });
  }, [config.id]);

  const setSettings = useCallback((settings: SiteSettingsFull) => {
    setState((prev) => {
      if (!prev) return prev;
      const next = { ...prev, settings };
      saveBizState(config.id, next);
      return next;
    });
  }, [config.id]);

  const reset = useCallback(() => {
    clearBizState(config.id);
    setState(buildSeed(config));
  }, [config]);

  if (!state) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink text-sm text-white/50">
        Chargement de la démonstration…
      </div>
    );
  }

  return (
    <BizContext.Provider value={{ config, state, setCollection, setSettings, reset }}>
      {children}
    </BizContext.Provider>
  );
}

export function useBiz(): BizContextValue {
  const ctx = useContext(BizContext);
  if (!ctx) throw new Error("useBiz doit être utilisé dans un <BizProvider>.");
  return ctx;
}
