"use client";

import { AvisManager } from "@/app/admin/(panel)/avis/AvisManager";
import { useDemo } from "@/lib/demo/DemoProvider";

export default function DemoAvisPage() {
  const { state, setEntity } = useDemo();
  return (
    <AvisManager
      initial={state.avis}
      live={false}
      onChange={(rows) => setEntity("avis", rows)}
    />
  );
}
