"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, Loader2, Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Input, Label } from "@/components/ui/Field";

type Factor = { id: string; status: string };

/**
 * Double authentification (TOTP) via Supabase MFA.
 * Permet d'activer une appli d'authentification (Google Authenticator,
 * Authy…) comme second facteur de connexion, et de la désactiver.
 */
export function TwoFactorSetup({ live }: { live: boolean }) {
  const supabase = live ? createClient() : null;
  const [loading, setLoading] = useState(true);
  const [factor, setFactor] = useState<Factor | null>(null);
  const [enrolling, setEnrolling] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.auth.mfa.listFactors().then(({ data }) => {
      const verified = data?.totp?.find((f) => f.status === "verified");
      setFactor(verified ? { id: verified.id, status: verified.status } : null);
      setLoading(false);
    });
  }, [supabase]);

  async function startEnroll() {
    if (!supabase) return;
    setBusy(true); setError("");
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    setBusy(false);
    if (error || !data) { setError(error?.message || "Erreur"); return; }
    setEnrolling({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  }

  async function verify() {
    if (!supabase || !enrolling) return;
    setBusy(true); setError("");
    const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId: enrolling.id });
    if (cErr || !challenge) { setBusy(false); setError(cErr?.message || "Erreur"); return; }
    const { error: vErr } = await supabase.auth.mfa.verify({
      factorId: enrolling.id, challengeId: challenge.id, code,
    });
    setBusy(false);
    if (vErr) { setError("Code incorrect. Réessayez."); return; }
    setFactor({ id: enrolling.id, status: "verified" });
    setEnrolling(null);
    setCode("");
  }

  async function disable() {
    if (!supabase || !factor) return;
    if (!confirm("Désactiver la double authentification ?")) return;
    setBusy(true);
    await supabase.auth.mfa.unenroll({ factorId: factor.id });
    setBusy(false);
    setFactor(null);
  }

  if (!live) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
        La double authentification nécessite Supabase configuré (mode démonstration ici).
      </div>
    );
  }

  if (loading) {
    return <div className="flex items-center gap-2 text-sm text-white/50"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</div>;
  }

  if (factor) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-emerald-400" />
          <div>
            <div className="text-sm font-medium text-white">Double authentification activée</div>
            <div className="text-xs text-white/50">Un code de votre application est demandé à la connexion.</div>
          </div>
        </div>
        <button onClick={disable} disabled={busy} className="btn-premium btn-ghost px-4 py-2 text-sm text-rose-300">
          Désactiver
        </button>
      </div>
    );
  }

  if (enrolling) {
    return (
      <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <p className="text-sm text-white/70">
          1. Scannez ce QR code avec Google Authenticator, Authy ou 1Password :
        </p>
        <div className="flex justify-center">
          {/* Supabase renvoie un data-URI SVG */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={enrolling.qr} alt="QR code 2FA" className="rounded-lg bg-white p-2" width={180} height={180} />
        </div>
        <p className="text-center text-xs text-white/40">
          Ou saisissez la clé manuellement : <code className="text-vanyo-200">{enrolling.secret}</code>
        </p>
        <div>
          <Label>2. Entrez le code à 6 chiffres généré</Label>
          <Input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" inputMode="numeric" />
        </div>
        {error && <p className="text-sm text-rose-300">{error}</p>}
        <div className="flex gap-2">
          <button onClick={verify} disabled={busy || code.length !== 6} className="btn-premium btn-primary flex-1 py-2.5 text-sm disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Activer
          </button>
          <button onClick={() => { setEnrolling(null); setError(""); }} className="btn-premium btn-ghost px-4 py-2.5 text-sm">
            <X className="h-4 w-4" /> Annuler
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center gap-3">
        <ShieldAlert className="h-6 w-6 text-white/40" />
        <div>
          <div className="text-sm font-medium text-white">Double authentification désactivée</div>
          <div className="text-xs text-white/50">Renforcez la sécurité de votre compte admin.</div>
        </div>
      </div>
      <button onClick={startEnroll} disabled={busy} className="btn-premium btn-primary px-4 py-2 text-sm">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Activer
      </button>
      {error && <p className="text-sm text-rose-300">{error}</p>}
    </div>
  );
}
