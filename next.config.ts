import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // lucide-react et motion exportent des centaines de modules depuis un seul
  // point d'entrée ; sans ça, importer une seule icône peut faire entrer
  // tout le paquet dans le bundle. Force un import "à la pièce".
  experimental: {
    optimizePackageImports: ["lucide-react", "motion", "motion/react"],
  },
  async headers() {
    return [
      {
        // Sécurité + confiance : signaux pris en compte par les audits
        // Lighthouse "Best Practices" et par certains crawlers IA.
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
