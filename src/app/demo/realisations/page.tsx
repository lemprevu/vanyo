"use client";

import { RealisationsManager } from "@/app/admin/(panel)/realisations/RealisationsManager";
import { useDemo } from "@/lib/demo/DemoProvider";

export default function DemoRealisationsPage() {
  const { state, setEntity } = useDemo();
  return (
    <RealisationsManager
      initial={state.realisations}
      live={false}
      onChange={(rows) => setEntity("realisations", rows)}
    />
  );
}
