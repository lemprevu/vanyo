import Link from "next/link";

/**
 * Logo Vanyo — marque officielle.
 * Trois losanges violets en cascade (du plus clair, en haut à droite,
 * au plus soutenu, en bas à gauche) + wordmark « vanyo ».
 */
export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="vanyoGrad" x1="10" y1="20" x2="27" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7B5CFF" />
          <stop offset="1" stopColor="#5B32E6" />
        </linearGradient>
      </defs>
      {/* Losange arrière (le plus clair) */}
      <rect x="21" y="6" width="17" height="17" rx="2.5" transform="rotate(45 29.5 14.5)" fill="#6D4AFF" fillOpacity="0.22" />
      {/* Losange intermédiaire */}
      <rect x="15" y="12.5" width="17" height="17" rx="2.5" transform="rotate(45 23.5 21)" fill="#6D4AFF" fillOpacity="0.5" />
      {/* Losange avant (soutenu, en dégradé) */}
      <rect x="10" y="21" width="17" height="17" rx="2.5" transform="rotate(45 18.5 29.5)" fill="url(#vanyoGrad)" />
    </svg>
  );
}

export function Logo({ size = 34 }: { size?: number }) {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-2.5"
      aria-label="Vanyo — Accueil"
    >
      <span className="transition-transform duration-500 group-hover:-rotate-6">
        <LogoMark size={size} />
      </span>
      <span className="text-[1.45rem] font-semibold leading-none tracking-tight text-white">
        vanyo
      </span>
    </Link>
  );
}
