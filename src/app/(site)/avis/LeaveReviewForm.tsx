"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Star, Send, CheckCircle2, Loader2 } from "lucide-react";
import { FieldGroup, Input, Textarea } from "@/components/ui/Field";
import { Turnstile } from "@/components/Turnstile";

export function LeaveReviewForm({ turnstileKey }: { turnstileKey?: string | null }) {
  const [rating, setRating] = useState(5);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [error, setError] = useState("");
  const [token, setToken] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name"),
      company: fd.get("company"),
      quote: fd.get("quote"),
      rating,
      turnstileToken: token,
    };
    try {
      const res = await fetch("/api/avis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Erreur lors de l'envoi.");
      setStatus("ok");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center justify-center rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-10 text-center"
      >
        <CheckCircle2 className="h-12 w-12 text-emerald-400" />
        <h3 className="mt-4 text-xl font-semibold text-white">Merci pour votre avis !</h3>
        <p className="mt-2 max-w-sm text-sm text-white/60">
          Il sera publié sur le site après validation par notre équipe.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="gradient-border rounded-3xl bg-ink-card/60 p-6 sm:p-8">
      <h3 className="text-lg font-semibold text-white">Laisser un avis</h3>
      <p className="mt-1 text-sm text-white/50">
        Vous êtes client·e Vanyo ? Partagez votre expérience. Votre avis sera publié après validation.
      </p>

      <div className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldGroup label="Nom" required>
            <Input name="name" required placeholder="Votre nom" />
          </FieldGroup>
          <FieldGroup label="Entreprise">
            <Input name="company" placeholder="Votre société" />
          </FieldGroup>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-white/75">
            Note <span className="text-vanyo-400">*</span>
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} étoiles`}>
                <Star className={`h-7 w-7 transition-colors ${n <= rating ? "fill-amber-400 text-amber-400" : "text-white/20"}`} />
              </button>
            ))}
          </div>
        </div>

        <FieldGroup label="Votre avis" required>
          <Textarea name="quote" required rows={4} placeholder="Racontez votre expérience avec Vanyo…" />
        </FieldGroup>

        <Turnstile siteKey={turnstileKey} onToken={setToken} />

        {status === "error" && (
          <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="btn-premium btn-primary w-full py-3.5 disabled:opacity-70"
        >
          {status === "loading" ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Envoi…</>
          ) : (
            <>Envoyer mon avis <Send className="h-4 w-4" /></>
          )}
        </button>
      </div>
    </form>
  );
}
