import Script from "next/script";
import { shade } from "@/lib/color";
import type { SiteSettings } from "@/lib/types";

const GOOGLE_FONTS: Record<string, string> = {
  Inter: "Inter:wght@400;500;600;700",
  Poppins: "Poppins:wght@400;500;600;700",
  Montserrat: "Montserrat:wght@400;500;600;700",
};

/**
 * Injecte au runtime les réglages qui modifient le rendu du site :
 * - couleur d'accent de la marque (redéfinit les variables --color-vanyo-*)
 * - police personnalisée (Google Fonts si différente de la police par défaut)
 * - Google Analytics et Meta Pixel (uniquement si un identifiant est renseigné)
 */
export function SiteRuntime({ settings }: { settings: SiteSettings }) {
  const c = settings.brand_color || "#6D4AFF";

  // Palette dérivée pour conserver de jolis dégradés.
  const vars = `:root{
    --color-vanyo-300:${shade(c, 0.4)};
    --color-vanyo-400:${shade(c, 0.2)};
    --color-vanyo-500:${c};
    --color-vanyo-600:${shade(c, -0.15)};
    --color-vanyo-700:${shade(c, -0.3)};
    --color-violet-mid:${shade(c, 0.12)};
    --color-violet-hi:${shade(c, 0.28)};
  }`;

  const font = settings.font_family && settings.font_family !== "Geist" ? settings.font_family : null;
  const googleFont = font ? GOOGLE_FONTS[font] : null;
  const fontRule = font ? `body{font-family:"${font}",var(--font-geist-sans),sans-serif;}` : "";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: vars + fontRule }} />

      {googleFont && (
        <link
          href={`https://fonts.googleapis.com/css2?family=${googleFont}&display=swap`}
          rel="stylesheet"
        />
      )}

      {/* Google Analytics 4 */}
      {settings.ga_id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${settings.ga_id}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${settings.ga_id}');`}
          </Script>
        </>
      )}

      {/* Meta Pixel */}
      {settings.meta_pixel_id && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${settings.meta_pixel_id}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
}
