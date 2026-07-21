"use client";

import { SettingsTabs } from "@/app/admin/(panel)/parametres/SettingsTabs";
import { PlansManager } from "@/app/admin/(panel)/parametres/PlansManager";
import { useDemo } from "@/lib/demo/DemoProvider";

export default function DemoParametresPage() {
  const { state, setEntity, setSettings } = useDemo();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Paramètres</h1>
        <p className="mt-1 text-sm text-white/50">Configurez l'ensemble de votre site depuis un seul endroit.</p>
      </div>

      <SettingsTabs initial={state.settings} live={false} onChange={setSettings} />

      <div>
        <h2 className="mb-3 text-lg font-semibold text-white">Tarifs</h2>
        <PlansManager initial={state.plans} live={false} onChange={(rows) => setEntity("plans", rows)} />
      </div>
    </div>
  );
}
