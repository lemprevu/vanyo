import { STATS } from "@/lib/content";
import { Counter } from "@/components/ui/Counter";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";

export function StatsBar() {
  return (
    <section className="container-v py-14">
      <StaggerGroup className="glass grid grid-cols-2 gap-y-8 rounded-3xl px-6 py-10 sm:grid-cols-3 lg:grid-cols-5">
        {STATS.map((s) => (
          <StaggerItem
            key={s.label}
            direction="zoom"
            className="text-center"
          >
            <div className="text-3xl font-bold tracking-tight text-gradient sm:text-4xl">
              <Counter to={s.value} suffix={s.suffix} decimals={s.decimals} />
            </div>
            <div className="mt-1.5 text-sm text-white/55">{s.label}</div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
