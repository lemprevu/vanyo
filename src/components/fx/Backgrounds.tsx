"use client";

import { useEffect, useRef } from "react";

/**
 * Fond "aurora" : nappes lumineuses violettes animées + grille.
 * Purement décoratif, très léger (CSS only).
 */
export function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink">
      <div className="absolute inset-0 bg-grid opacity-70" />
      <div className="animate-aurora absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-vanyo-500/25 blur-[70px] sm:blur-[130px]" />
      <div
        className="animate-aurora absolute right-0 top-1/4 h-[460px] w-[460px] rounded-full bg-violet-hi/20 blur-[70px] sm:blur-[130px]"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="animate-aurora absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full bg-violet-mid/15 blur-[70px] sm:blur-[130px]"
        style={{ animationDelay: "-12s" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink" />
    </div>
  );
}

/**
 * Halo lumineux qui suit la souris (mouse follow / glow).
 * Utilise une variable CSS mise à jour via requestAnimationFrame.
 */
export function MouseGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;

    let raf = 0;
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pos = { ...target };

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
    };

    const loop = () => {
      pos.x += (target.x - pos.x) * 0.08;
      pos.y += (target.y - pos.y) * 0.08;
      if (ref.current) {
        ref.current.style.transform = `translate3d(${pos.x - 250}px, ${pos.y - 250}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-vanyo-500/10 blur-[120px] will-change-transform"
    />
  );
}
