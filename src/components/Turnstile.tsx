"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: { sitekey: string; callback: (t: string) => void; theme?: string }) => string;
      remove: (id: string) => void;
    };
  }
}

/**
 * Widget Cloudflare Turnstile (anti-spam / anti-bot).
 * Ne s'affiche que si une clé publique est fournie (sinon rien).
 * Appelle `onToken` avec le jeton à valider côté serveur.
 */
export function Turnstile({ siteKey, onToken }: { siteKey?: string | null; onToken: (t: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    if (!siteKey || !ref.current) return;

    const scriptId = "cf-turnstile-script";
    const render = () => {
      if (!window.turnstile || !ref.current || widgetId.current) return;
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: siteKey,
        callback: onToken,
        theme: "dark",
      });
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = render;
      document.head.appendChild(script);
    } else {
      render();
    }

    return () => {
      if (widgetId.current && window.turnstile) {
        try { window.turnstile.remove(widgetId.current); } catch {}
        widgetId.current = null;
      }
    };
  }, [siteKey, onToken]);

  if (!siteKey) return null;
  return <div ref={ref} className="mt-2" />;
}
