"use client";

import { useMemo, useState } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import {
  DEFAULT_CATALOG, resolveCatalog, PAGES_UNLIMITED,
  type CatalogOverrides,
} from "@/lib/catalog";
import { Input, Label } from "@/components/ui/Field";

/**
 * Édition de tous les tarifs depuis le panel admin.
 *
 * On n'enregistre que les ÉCARTS au catalogue par défaut : un champ laissé tel
 * quel n'est pas stocké, et bénéficiera donc automatiquement d'une future mise
 * à jour du catalogue. Chaque champ modifié affiche sa valeur d'origine et un
 * bouton pour y revenir.
 */

type Group = { key: string; title: string; hint: string };

const GROUPS: Group[] = [
  { key: "packs", title: "Formules", hint: "Prix de base, prix barré et nombre de pages compris." },
  { key: "modules", title: "Fonctionnalités", hint: "Prix de chaque module quand il n'est pas compris dans la formule." },
  { key: "deploiements", title: "Mise en ligne", hint: "Installation, nom de domaine et e-mails professionnels." },
  { key: "maintenancePlans", title: "Maintenance", hint: "Formules d'abonnement mensuel." },
  { key: "maintenanceOptions", title: "Suppléments mensuels", hint: "Options ajoutées à l'abonnement." },
  { key: "delais", title: "Délais", hint: "Supplément pour une livraison prioritaire." },
];

export function PricingSettings({
  value,
  onChange,
}: {
  value: CatalogOverrides | null;
  onChange: (v: CatalogOverrides) => void;
}) {
  const [open, setOpen] = useState<string>("packs");
  const catalog = useMemo(() => resolveCatalog(value), [value]);
  const overrides = value ?? {};

  /** Écrit une personnalisation, ou la retire si on revient à la valeur d'origine. */
  function setField(group: keyof CatalogOverrides, key: string, field: string, raw: string | number, original: unknown) {
    const next: CatalogOverrides = { ...overrides };
    const section = { ...((next[group] as Record<string, Record<string, unknown>>) ?? {}) };
    const item = { ...(section[key] ?? {}) };

    if (raw === original || raw === "") delete item[field];
    else item[field] = raw;

    if (Object.keys(item).length === 0) delete section[key];
    else section[key] = item;

    if (Object.keys(section).length === 0) delete next[group];
    else (next as Record<string, unknown>)[group] = section;

    onChange(next);
  }

  function resetGroup(group: keyof CatalogOverrides) {
    const next = { ...overrides };
    delete next[group];
    onChange(next);
  }

  function resetAll() {
    onChange({});
  }

  const isCustom = (group: keyof CatalogOverrides, key: string, field: string) =>
    Boolean((overrides[group] as Record<string, Record<string, unknown>> | undefined)?.[key]?.[field] !== undefined);

  /** Champ numérique avec rappel de la valeur d'origine. */
  function PriceField({
    group, itemKey, field, label, current, original, suffix = "€",
  }: {
    group: keyof CatalogOverrides;
    itemKey: string;
    field: string;
    label: string;
    current: number | null;
    original: number | null;
    suffix?: string;
  }) {
    const custom = isCustom(group, itemKey, field);
    return (
      <div>
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <span className="text-xs text-white/50">{label}</span>
          {custom && (
            <button
              type="button"
              onClick={() => setField(group, itemKey, field, original ?? 0, original)}
              className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white/70"
              title={`Revenir à ${original ?? 0} ${suffix}`}
            >
              <RotateCcw className="h-3 w-3" /> {original ?? 0}
            </button>
          )}
        </div>
        <div className="relative">
          <Input
            type="number"
            min={0}
            value={current ?? ""}
            onChange={(e) =>
              setField(group, itemKey, field, e.target.value === "" ? "" : Number(e.target.value), original)
            }
            className={`pr-9 ${custom ? "border-vanyo-500/60" : ""}`}
          />
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-white/35">
            {suffix}
          </span>
        </div>
      </div>
    );
  }

  const customCount = Object.values(overrides).reduce<number>(
    (n, section) => n + (typeof section === "object" && section ? Object.keys(section).length : 1),
    0
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-white/50">
          Vos prix s&apos;appliquent partout : page Tarifs, comparatif et estimation du formulaire de devis.
          Les champs non modifiés suivent le catalogue Vanyo.
        </p>
        {customCount > 0 && (
          <button onClick={resetAll} className="btn-premium btn-ghost shrink-0 px-4 py-2 text-sm">
            <RotateCcw className="h-4 w-4" /> Tout réinitialiser
          </button>
        )}
      </div>

      {GROUPS.map((g) => {
        const expanded = open === g.key;
        const groupKey = g.key as keyof CatalogOverrides;
        const modified = Boolean(overrides[groupKey]);

        return (
          <div key={g.key} className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02]">
            <button
              type="button"
              onClick={() => setOpen(expanded ? "" : g.key)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
            >
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{g.title}</span>
                  {modified && (
                    <span className="rounded-full bg-vanyo-500/20 px-2 py-0.5 text-[10px] font-medium text-vanyo-200">
                      modifié
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-xs text-white/45">{g.hint}</span>
              </span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-white/45 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>

            {expanded && (
              <div className="space-y-3 border-t border-white/8 p-4">
                {modified && (
                  <button
                    onClick={() => resetGroup(groupKey)}
                    className="text-xs text-white/45 hover:text-white/75"
                  >
                    <RotateCcw className="mr-1 inline h-3 w-3" />
                    Réinitialiser cette section
                  </button>
                )}

                {/* ---------- Formules ---------- */}
                {g.key === "packs" &&
                  catalog.packs.map((p) => {
                    const orig = DEFAULT_CATALOG.packsByKey[p.key];
                    return (
                      <div key={p.key} className="rounded-xl border border-white/8 bg-white/[0.02] p-3.5">
                        <Label>{p.name}</Label>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <PriceField
                            group="packs" itemKey={p.key} field="base" label="Prix de base"
                            current={p.base} original={orig?.base ?? null}
                          />
                          <PriceField
                            group="packs" itemKey={p.key} field="originalPrice" label="Prix barré"
                            current={p.originalPrice ?? null} original={orig?.originalPrice ?? null}
                          />
                          <PriceField
                            group="packs" itemKey={p.key} field="pagesIncluded" label="Pages comprises"
                            current={p.pagesIncluded >= PAGES_UNLIMITED ? null : p.pagesIncluded}
                            original={orig?.pagesIncluded ?? null}
                            suffix="p."
                          />
                        </div>
                        {p.base === null && (
                          <p className="mt-2 text-xs text-white/35">
                            Laissez le prix vide pour afficher « Sur devis ».
                          </p>
                        )}
                      </div>
                    );
                  })}

                {/* ---------- Listes simples (prix unique par ligne) ---------- */}
                {g.key !== "packs" && (
                  <div className="space-y-2">
                    {(g.key === "modules"
                      ? catalog.modules
                      : g.key === "deploiements"
                        ? catalog.deploiements
                        : g.key === "maintenancePlans"
                          ? catalog.maintenancePlans
                          : g.key === "maintenanceOptions"
                            ? catalog.maintenanceOptions
                            : catalog.delais
                    ).map((item) => {
                      const defaults =
                        g.key === "modules"
                          ? DEFAULT_CATALOG.modulesByKey
                          : g.key === "deploiements"
                            ? DEFAULT_CATALOG.deploiementsByKey
                            : g.key === "maintenancePlans"
                              ? DEFAULT_CATALOG.maintenancePlansByKey
                              : g.key === "maintenanceOptions"
                                ? DEFAULT_CATALOG.maintenanceOptionsByKey
                                : DEFAULT_CATALOG.delaisByKey;
                      const orig = defaults[item.key];
                      const monthly = g.key === "maintenancePlans" || g.key === "maintenanceOptions";
                      return (
                        <div
                          key={item.key}
                          className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-3"
                        >
                          <span className="min-w-0 flex-1 text-sm text-white/80">{item.label}</span>
                          <div className="w-32 shrink-0">
                            <PriceField
                              group={groupKey}
                              itemKey={item.key}
                              field="price"
                              label=""
                              current={item.price}
                              original={orig?.price ?? 0}
                              suffix={monthly ? "€/m" : "€"}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Prix de la page supplémentaire, hors groupes */}
      <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-white">Page supplémentaire</span>
          <span className="mt-0.5 block text-xs text-white/45">
            Facturée pour chaque page au-delà de ce que comprend la formule.
          </span>
        </span>
        <div className="w-32 shrink-0">
          <div className="relative">
            <Input
              type="number"
              min={0}
              value={catalog.extraPagePrice}
              onChange={(e) => {
                const n = Number(e.target.value);
                const next = { ...overrides };
                if (n === DEFAULT_CATALOG.extraPagePrice) delete next.extraPagePrice;
                else next.extraPagePrice = n;
                onChange(next);
              }}
              className={`pr-9 ${overrides.extraPagePrice !== undefined ? "border-vanyo-500/60" : ""}`}
            />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-white/35">
              €
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
