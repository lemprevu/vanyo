import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

/**
 * Image de partage (OG/Twitter) par défaut, générée dynamiquement.
 * Sans ce fichier, tout lien Vanyo partagé sur LinkedIn/Slack/WhatsApp
 * n'affiche aucune vignette (og_image est vide par défaut) — ce qui réduit
 * fortement le taux de clic. Sert de secours pour toute page qui ne définit
 * pas sa propre image de partage.
 */
export const alt = `${SITE.name} — Agence de création de sites internet`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0a0a0f 0%, #14101f 55%, #1c1230 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 34,
            fontWeight: 700,
            letterSpacing: -1,
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              background: "linear-gradient(135deg, #6D4AFF, #9A7DFF)",
            }}
          />
          {SITE.name}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 48,
            fontSize: 58,
            fontWeight: 700,
            lineHeight: 1.15,
            maxWidth: 920,
            letterSpacing: -1.5,
          }}
        >
          Des sites internet qui convertissent vos visiteurs en clients
        </div>
        <div style={{ display: "flex", marginTop: 32, fontSize: 26, color: "rgba(255,255,255,0.6)" }}>
          vanyo.fr — Sites vitrines, e-commerce, restaurants, sur mesure
        </div>
      </div>
    ),
    { ...size }
  );
}
