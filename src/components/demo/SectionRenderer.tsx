"use client";

import { AvisManager } from "@/app/admin/(panel)/avis/AvisManager";
import { SettingsTabs } from "@/app/admin/(panel)/parametres/SettingsTabs";
import { ArticlesManager } from "@/app/admin/(panel)/blog/ArticlesManager";
import { UsersManager } from "@/app/admin/(panel)/utilisateurs/UsersManager";
import { SignatureBuilder } from "@/app/admin/(panel)/signature/SignatureBuilder";
import type { Avis, Article, AdminProfile } from "@/lib/types";
import { useBiz } from "@/lib/demo/BizProvider";
import type { Row, Section } from "@/lib/demo/types";
import type { RequestsSection } from "@/lib/demo/types";
import { CollectionManager } from "./CollectionManager";
import { RequestsManager } from "./RequestsManager";
import { MessagesManager } from "./MessagesManager";
import { PlanningManager } from "./PlanningManager";
import { PerformancePanel } from "./PerformancePanel";
import { ActivityJournal } from "./ActivityJournal";

/** Affiche le bon manager selon le type de section. */
export function SectionRenderer({ section }: { section: Section }) {
  const { config, state, setCollection, setSettings } = useBiz();

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

  if (section.type === "signature") return <SignatureBuilder settings={state.settings} />;
  if (section.type === "performance") return <PerformancePanel config={config} state={state} />;
  if (section.type === "journal") return <ActivityJournal config={config} state={state} />;

  // Le planning partage les données de sa section « demandes » source.
  if (section.type === "planning") {
    const source = config.sections.find((s) => s.id === section.sourceId) as RequestsSection | undefined;
    if (!source) return null;
    return (
      <PlanningManager
        section={section}
        source={source}
        rows={state.collections[section.sourceId] ?? []}
        onChange={(r) => setCollection(section.sourceId, r)}
      />
    );
  }

  const rows = state.collections[section.id] ?? [];
  const onChange = (r: Row[]) => setCollection(section.id, r);

  if (section.type === "collection") return <CollectionManager section={section} rows={rows} onChange={onChange} />;
  if (section.type === "requests") return <RequestsManager section={section} rows={rows} onChange={onChange} />;
  if (section.type === "messages") return <MessagesManager label={section.label} rows={rows} onChange={onChange} />;
  if (section.type === "blog") {
    return (
      <ArticlesManager
        initial={rows as unknown as Article[]}
        live={false}
        onChange={(r) => setCollection(section.id, r as unknown as Row[])}
      />
    );
  }
  if (section.type === "users") {
    return (
      <UsersManager
        initial={rows as unknown as AdminProfile[]}
        currentUserId={String(rows[0]?.id ?? "demo-owner")}
        live={false}
        onChange={(r) => setCollection(section.id, r as unknown as Row[])}
      />
    );
  }
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
