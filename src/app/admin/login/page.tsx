"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const configured = isSupabaseConfigured();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const supabase = createClient();
    if (!supabase) {
      setError("Supabase n'est pas encore configuré. Voir le README pour le branchement.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Identifiants incorrects.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-6">
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-vanyo-500/20 blur-[130px]" />
      <div className="absolute inset-0 bg-grid opacity-40" />

      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-white/50 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Retour au site
        </Link>

        <div className="gradient-border rounded-3xl bg-ink-card/80 p-8 backdrop-blur-xl">
          <div className="flex flex-col items-center text-center">
            <LogoMark size={48} />
            <h1 className="mt-4 text-2xl font-semibold text-white">Espace administrateur</h1>
            <p className="mt-1 text-sm text-white/50">Connectez-vous pour accéder au panel Vanyo.</p>
          </div>

          {!configured && (
            <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              Supabase n'est pas configuré. Ajoutez vos clés d'environnement puis créez un
              utilisateur admin (voir README).
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-7 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/75">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vanyo.fr"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/35 outline-none focus:border-vanyo-500/70"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/75">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/35 outline-none focus:border-vanyo-500/70"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-premium btn-primary w-full py-3.5 disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Se connecter
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-white/35">
            Connexion sécurisée · sessions chiffrées · journal des connexions
          </p>
        </div>
      </div>
    </main>
  );
}
