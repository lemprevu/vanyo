"use client";

import { AvisManager } from "@/app/admin/(panel)/avis/AvisManager";
import { SettingsTabs } from "@/app/admin/(panel)/parametres/SettingsTabs";
import type { Avis } from "@/lib/types";
import { useBiz } from "@/lib/demo/BizProvider";
import type { Row, Section } from "@/lib/demo/types";
import { CollectionManager } from "./CollectionManager";
import { RequestsManager } from "./RequestsManager";
import { MessagesManager } from "./MessagesManager";

/** Affiche le bon manager selon le type de section. */
export function SectionRenderer({ section }: { section: Section }) {
  const { state, setCollection, setSettings } = useBiz();

  if (section.type === "settings") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Paramètres</h1>
          <p className="mt-1 text-sm text-white/50">Configurez votre site : nom, couleurs, coordonnées, référencement…</p>
        </div>
        <SettingsTabs initial={state.settings} live={false} onChange={setSettings} />
      </div>
    );
  }

  const rows = state.collections[section.id] ?? [];
  const onChange = (r: Row[]) => setCollection(section.id, r);

  if (section.type === "collection") return <CollectionManager section={section} rows={rows} onChange={onChange} />;
  if (section.type === "requests") return <RequestsManager section={section} rows={rows} onChange={onChange} />;
  if (section.type === "messages") return <MessagesManager label={section.label} rows={rows} onChange={onChange} />;
  if (section.type === "reviews") {
    return (
      <AvisManager
        initial={rows as unknown as Avis[]}
        live={false}
        onChange={(r) => setCollection(section.id, r as unknown as Row[])}
      />
    );
  }
  return null;
}
