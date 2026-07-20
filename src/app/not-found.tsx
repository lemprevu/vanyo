import Link from "next/link";
import { LogoMark } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink px-6 text-center">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-vanyo-500/25 blur-[120px]" />
      <div className="relative animate-float"><LogoMark size={64} /></div>
      <h1 className="relative mt-8 text-7xl font-bold tracking-tight text-gradient">404</h1>
      <p className="relative mt-3 text-lg text-white/60">Cette page n'existe pas ou a été déplacée.</p>
      <Link href="/" className="btn-premium btn-primary relative mt-8 px-7 py-3.5">
        Retour à l'accueil
      </Link>
    </main>
  );
}
