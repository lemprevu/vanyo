import type { ReactNode } from "react";

/**
 * Transition d'entrée entre les pages du site public.
 *
 * Volontairement en CSS pur (classe `.reveal-css`, définie dans
 * globals.css), pas en Framer Motion : ce wrapper englobe la TOTALITÉ du
 * contenu de chaque page. Une animation JS (Web Animations API) qui reste
 * bloquée à son état initial ici rendrait la page entière invisible — bug
 * observé sur Safari iOS. Une animation CSS déclarative garantit que le
 * contenu final (visible) est toujours celui défini par la feuille de
 * style, indépendamment de l'exécution JS.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="reveal-css">{children}</div>;
}
