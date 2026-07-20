const LOGOS = [
  "Maison Laurent", "NovaImmo", "GreenRoots", "Boutique Lumé",
  "Axio Conseil", "Atelier Cassard", "Le Jardin", "Prestige Immo",
];

/** Bandeau défilant de « marques » qui nous font confiance. */
export function LogosMarquee() {
  return (
    <section className="py-8">
      <p className="mb-6 text-center text-xs uppercase tracking-widest text-white/35">
        Ils nous font confiance
      </p>
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
        <div className="animate-marquee flex w-max gap-14">
          {[...LOGOS, ...LOGOS].map((name, i) => (
            <span
              key={i}
              className="whitespace-nowrap text-xl font-semibold text-white/30 transition-colors hover:text-white/60"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
