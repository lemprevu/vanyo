import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "ghost";

const cls = (variant: Variant, size: "md" | "lg") =>
  [
    "btn-premium",
    variant === "primary" ? "btn-primary" : "btn-ghost",
    size === "lg" ? "px-7 py-3.5 text-[0.98rem]" : "px-5 py-2.5 text-sm",
  ].join(" ");

/** Bouton lien premium. */
export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: "md" | "lg";
  className?: string;
} & Omit<ComponentProps<typeof Link>, "href" | "className">) {
  return (
    <Link href={href} className={`${cls(variant, size)} ${className}`} {...props}>
      {children}
    </Link>
  );
}

/** Bouton d'action (form / onClick) premium. */
export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: {
  children: ReactNode;
  variant?: Variant;
  size?: "md" | "lg";
} & ComponentProps<"button">) {
  return (
    <button className={`${cls(variant, size)} ${className}`} {...props}>
      {children}
    </button>
  );
}
