"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getMetier } from "@/lib/demo/metiers";
import { BizProvider } from "@/lib/demo/BizProvider";
import { BizShell } from "./BizShell";

export function MetierClientLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const id = String(params.metier);
  const config = getMetier(id);

  if (!config) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink px-6 text-center text-white">
        <p className="text-lg font-semibold">Secteur de démonstration introuvable.</p>
        <Link href="/demo" className="btn-premium btn-primary px-5 py-2.5 text-sm">
          Choisir un secteur
        </Link>
      </div>
    );
  }

  return (
    <BizProvider config={config}>
      <BizShell>{children}</BizShell>
    </BizProvider>
  );
}
