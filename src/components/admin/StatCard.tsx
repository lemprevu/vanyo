import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  accent = "vanyo",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  accent?: "vanyo" | "emerald" | "amber" | "sky";
}) {
  const accents: Record<string, string> = {
    vanyo: "from-vanyo-500/25 to-violet-hi/10 text-vanyo-200 ring-vanyo-500/30",
    emerald: "from-emerald-500/25 to-emerald-500/5 text-emerald-300 ring-emerald-500/30",
    amber: "from-amber-500/25 to-amber-500/5 text-amber-300 ring-amber-500/30",
    sky: "from-sky-500/25 to-sky-500/5 text-sky-300 ring-sky-500/30",
  };
  return (
    <div className="gradient-border rounded-2xl bg-ink-card/60 p-5 transition-transform duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ${accents[accent]}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-300">
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4 text-3xl font-bold tracking-tight text-white">{value}</div>
      <div className="mt-1 text-sm text-white/50">{label}</div>
    </div>
  );
}
