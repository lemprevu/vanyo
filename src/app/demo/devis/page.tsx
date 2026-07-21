"use client";

import { DevisManager } from "@/app/admin/(panel)/devis/DevisManager";
import { useDemo } from "@/lib/demo/DemoProvider";

export default function DemoDevisPage() {
  const { state, setEntity } = useDemo();
  return (
    <DevisManager
      initial={state.devis}
      live={false}
      onChange={(rows) => setEntity("devis", rows)}
    />
  );
}
