"use client";

import { PromoManager } from "@/app/admin/(panel)/codes-promo/PromoManager";
import { useDemo } from "@/lib/demo/DemoProvider";

export default function DemoPromoPage() {
  const { state, setEntity } = useDemo();
  return (
    <PromoManager
      initial={state.promoCodes}
      live={false}
      onChange={(rows) => setEntity("promoCodes", rows)}
    />
  );
}
