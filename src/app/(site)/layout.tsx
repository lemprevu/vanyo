import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CustomCursor } from "@/components/fx/CustomCursor";
import { ScrollProgress } from "@/components/fx/ScrollProgress";
import { LoadingScreen } from "@/components/fx/LoadingScreen";
import { AuroraBackground, MouseGlow } from "@/components/fx/Backgrounds";

/** Layout du site public : chrome premium + effets globaux. */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <LoadingScreen />
      <AuroraBackground />
      <MouseGlow />
      <ScrollProgress />
      <CustomCursor />
      <Navbar />
      <main className="relative z-10 flex-1 pt-24">{children}</main>
      <Footer />
    </>
  );
}
