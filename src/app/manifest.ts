import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/**
 * Rend le site (et le panel admin) installable comme une application sur
 * mobile : icône Vanyo, ouverture en plein écran sans barre de navigateur.
 * Un client qui fait « Ajouter à l'écran d'accueil » depuis son panel admin
 * (ex. /admin) retrouve ensuite une icône Vanyo qui ouvre directement son
 * espace, comme une vraie appli.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — ${SITE.tagline}`,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#050505",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
