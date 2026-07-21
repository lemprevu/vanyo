import type { Metadata } from "next";
import { DemoProvider } from "@/lib/demo/DemoProvider";
import { DemoShell } from "./DemoShell";

export const metadata: Metadata = {
  title: "Démonstration du panel client — Vanyo",
  description: "Testez en conditions réelles le panel d'administration Vanyo sur un site de démonstration.",
  robots: { index: false, follow: false },
};

/** Panel de démonstration public : mêmes composants que le vrai admin,
 *  mais alimentés par un store local (aucune donnée réelle, aucun login). */
export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <DemoProvider>
      <DemoShell>{children}</DemoShell>
    </DemoProvider>
  );
}
