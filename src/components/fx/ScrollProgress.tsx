"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Barre de progression de scroll en haut de page. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 25,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed left-0 right-0 top-0 z-[9997] h-[3px] origin-left bg-gradient-to-r from-vanyo-500 via-violet-mid to-violet-hi"
      style={{ scaleX }}
    />
  );
}
