"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "fade" | "zoom";

const offset = 36;

const buildVariants = (direction: Direction): Variants => {
  const hidden: Record<string, number> = { opacity: 0 };
  if (direction === "up") hidden.y = offset;
  if (direction === "down") hidden.y = -offset;
  if (direction === "left") hidden.x = offset;
  if (direction === "right") hidden.x = -offset;
  if (direction === "zoom") hidden.scale = 0.9;

  return {
    hidden,
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  };
};

/** Wrapper d'apparition au scroll : fade / slide / zoom. */
export function Reveal({
  children,
  direction = "up",
  delay = 0,
  className,
  once = true,
}: {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      variants={buildVariants(direction)}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-80px" }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

/** Conteneur qui décale l'apparition de ses enfants (effet cascade). */
export function StaggerGroup({
  children,
  className,
  stagger = 0.1,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  direction?: Direction;
}) {
  return (
    <motion.div className={className} variants={buildVariants(direction)}>
      {children}
    </motion.div>
  );
}
