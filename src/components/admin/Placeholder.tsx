import type { LucideIcon } from "lucide-react";

/** Écran de gestion standard pour les modules d'administration. */
export function AdminModule({
  icon: Icon,
  title,
  subtitle,
  features,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  features: string[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
        <p className="mt-1 text-sm text-white/50">{subtitle}</p>
      </div>

      <div className="gradient-border flex flex-col items-center rounded-3xl bg-ink-card/60 p-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-vanyo-500/25 to-violet-hi/10 text-vanyo-200 ring-1 ring-vanyo-500/30">
          <Icon className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-lg font-semibold text-white">Module {title.toLowerCase()}</h2>
        <p className="mt-2 max-w-md text-sm text-white/50">
          Ce module est prêt côté interface. Il se connecte à Supabase pour la gestion complète
          des données (création, édition, suppression, ordre d'affichage).
        </p>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f} className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-2.5 text-sm text-white/70">
              {f}
            </div>
          ))}
        </div>
        <button className="btn-premium btn-primary mt-7 px-6 py-3 text-sm">
          Ajouter un élément
        </button>
      </div>
    </div>
  );
}
