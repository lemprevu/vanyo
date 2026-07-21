"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useBiz } from "@/lib/demo/BizProvider";
import { SectionRenderer } from "@/components/demo/SectionRenderer";

export default function MetierSectionPage() {
  const params = useParams();
  const sectionId = String(params.section);
  const { config } = useBiz();
  const section = config.sections.find((s) => s.id === sectionId);

  if (!section) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center text-white/70">
        <p>Cette rubrique n&apos;existe pas pour ce secteur.</p>
        <Link href={`/demo/${config.id}`} className="btn-premium btn-primary px-5 py-2.5 text-sm">
          Retour au tableau de bord
        </Link>
      </div>
    );
  }

  return <SectionRenderer section={section} />;
}
