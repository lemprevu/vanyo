"use client";

import { useRef, type ReactNode } from "react";
import { motion } from "motion/react";

/**
 * Carte premium avec :
 * - léger tilt 3D au survol
 * - halo lumineux qui suit le curseur (spotlight)
 * - bordure en dégradé
 */
export function GlowCard({
  children,
  className = "",
  tilt = true,
}: {
  children: ReactNode;
  className?: string;
  tilt?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    if (tilt) {
      el.style.setProperty("--rx", `${(0.5 - py) * 8}deg`);
      el.style.setProperty("--ry", `${(px - 0.5) * 8}deg`);
    }
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      style={{
        transform:
          "perspective(900px) rotateX(var(--rx,0)) rotateY(var(--ry,0))",
        transformStyle: "preserve-3d",
      }}
      className={`group gradient-border relative overflow-hidden rounded-2xl bg-ink-card/70 p-6 transition-colors duration-500 hover:bg-ink-card ${className}`}
    >
      {/* Spotlight */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(340px circle at var(--mx,50%) var(--my,50%), rgba(109,74,255,0.18), transparent 65%)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
