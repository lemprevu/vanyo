import type { Metadata } from "next";
import { MetierClientLayout } from "./MetierClientLayout";

// Toutes les pages de démonstration (tableaux de bord fictifs par métier)
// doivent rester hors index : ce sont des données de démo, pas du contenu
// réel — les laisser indexables diluerait la qualité perçue du site aux
// yeux de Google (des dizaines de pages quasi identiques, sans valeur pour
// un chercheur). Ce fichier est un composant serveur uniquement pour
// pouvoir exporter `metadata` ; toute la logique interactive reste dans
// MetierClientLayout (client component).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function MetierLayout({ children }: { children: React.ReactNode }) {
  return <MetierClientLayout>{children}</MetierClientLayout>;
}
