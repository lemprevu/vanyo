"use client";

import type { CSSProperties } from "react";
import { AdminShell } from "@/app/admin/(panel)/AdminShell";
import { useDemo } from "@/lib/demo/DemoProvider";
import { shade } from "@/lib/color";

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

/** Habillage du panel démo : injecte les données du store dans AdminShell
 *  et applique en direct la couleur d'accent choisie dans les paramètres. */
export function DemoShell({ children }: { children: React.ReactNode }) {
  const { state, reset } = useDemo();
  const s = state.settings;

  const counts = {
    devis: state.devis.filter((d) => d.status === "Nouveau").length,
    messages: state.messages.filter((m) => !m.lu).length,
  };

  const notifications = [
    ...state.devis
      .filter((d) => !d.viewed)
      .map((d) => ({ id: `devis-${d.id}`, type: "devis", text: `Nouvelle demande de devis — ${d.prenom} ${d.nom}`, time: formatTime(d.created_at) })),
    ...state.messages
      .filter((m) => !m.lu)
      .map((m) => ({ id: `msg-${m.id}`, type: "message", text: `Nouveau message — ${m.nom}`, time: formatTime(m.created_at) })),
  ].slice(0, 8);

  const accent = s.brand_color;
  const style: CSSProperties = {
    display: "contents",
    "--color-vanyo-300": shade(accent, 0.4),
    "--color-vanyo-400": shade(accent, 0.2),
    "--color-vanyo-500": accent,
    "--color-vanyo-600": shade(accent, -0.15),
    "--color-vanyo-700": shade(accent, -0.3),
    "--color-violet-mid": shade(accent, 0.12),
    "--color-violet-hi": shade(accent, 0.28),
  } as CSSProperties;

  return (
    <div style={style}>
      <AdminShell
        email={s.email}
        live={false}
        counts={counts}
        notifications={notifications}
        demoMode
        onReset={reset}
        basePath="/demo"
        brandName={s.site_name}
      >
        {children}
      </AdminShell>
    </div>
  );
}
