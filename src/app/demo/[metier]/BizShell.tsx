"use client";

import type { CSSProperties } from "react";
import { LayoutDashboard } from "lucide-react";
import { AdminShell } from "@/app/admin/(panel)/AdminShell";
import { useBiz } from "@/lib/demo/BizProvider";
import { shade } from "@/lib/color";
import type { RequestsSection, Row } from "@/lib/demo/types";

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

/** Habillage du panel démo d'un métier : nav dynamique + branding live. */
export function BizShell({ children }: { children: React.ReactNode }) {
  const { config, state, reset } = useBiz();
  const s = state.settings;

  // Badge « à traiter » d'une section de demandes = statut initial.
  const pendingOf = (section: RequestsSection) =>
    (state.collections[section.id] ?? []).filter((r) => String(r.status) === section.statuses[0]).length;
  const unreadMessages = (id: string) =>
    (state.collections[id] ?? []).filter((m) => !(m as Row).lu).length;

  const navItems = [
    { label: "Tableau de bord", seg: "", icon: LayoutDashboard },
    ...config.sections.map((sec) => {
      let badge: number | undefined;
      if (sec.type === "requests" && sec.countsAsPending) badge = pendingOf(sec);
      if (sec.type === "messages") badge = unreadMessages(sec.id) || undefined;
      return { label: sec.label, seg: `/${sec.id}`, icon: sec.icon, badge: badge || undefined };
    }),
  ];

  // Notifications : demandes non vues + messages non lus.
  const notifications = [
    ...config.sections
      .filter((sec) => sec.type === "requests")
      .flatMap((sec) =>
        (state.collections[sec.id] ?? [])
          .filter((r) => !(r as Row).viewed)
          .map((r) => ({
            id: `${sec.id}-${r.id}`,
            type: sec.id,
            text: `${sec.label} — ${String((r as Row)[(sec as RequestsSection).nameField] ?? "")}`,
            time: r.created_at ? formatTime(String(r.created_at)) : "",
          }))
      ),
    ...config.sections
      .filter((sec) => sec.type === "messages")
      .flatMap((sec) =>
        (state.collections[sec.id] ?? [])
          .filter((m) => !(m as Row).lu)
          .map((m) => ({
            id: `${sec.id}-${m.id}`,
            type: sec.id,
            text: `Nouveau message — ${String((m as Row).nom ?? "")}`,
            time: m.created_at ? formatTime(String(m.created_at)) : "",
          }))
      ),
  ].slice(0, 8);

  const pendingTotal = config.sections
    .filter((sec): sec is RequestsSection => sec.type === "requests")
    .reduce((n, sec) => n + pendingOf(sec), 0);
  const messagesTotal = config.sections
    .filter((sec) => sec.type === "messages")
    .reduce((n, sec) => n + unreadMessages(sec.id), 0);

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
        counts={{ devis: pendingTotal, messages: messagesTotal }}
        notifications={notifications}
        demoMode
        onReset={reset}
        basePath={`/demo/${config.id}`}
        brandName={s.site_name}
        navItems={navItems}
      >
        {children}
      </AdminShell>
    </div>
  );
}
