"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Analyse de trafic maison : envoie un signal anonyme (page, provenance,
 * type d'appareil) à chaque page vue — y compris lors de la navigation
 * côté client (Next ne recharge pas la page, donc pas de nouveau <script>
 * exécuté sans ce hook sur le pathname).
 */
export function PageTracker() {
  const pathname = usePathname();
  const lastSent = useRef<string | null>(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (lastSent.current === pathname) return;
    lastSent.current = pathname;
    // Le referrer HTTP n'a de sens que sur la toute première page vue de la
    // session : les navigations internes suivantes n'ont pas de "provenance"
    // externe (elles viennent de la page précédente du même site).
    const referrer = isFirstLoad.current ? document.referrer || null : null;
    isFirstLoad.current = false;

    const payload = JSON.stringify({
      path: pathname,
      referrer,
      device: window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop",
    });

    const body = new Blob([payload], { type: "application/json" });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", body);
    } else {
      fetch("/api/track", { method: "POST", body: payload, keepalive: true }).catch(() => {});
    }
  }, [pathname]);

  return null;
}
