"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Check, Sparkles, Ticket, Loader2, X } from "lucide-react";
import type { Plan } from "@/lib/content";

type Discount = { code: string; type: "percent" | "amount"; value: number };

/** Parse le montant numérique d'un prix ("1 490€" → 1490). null si non chiffré. */
function parsePrice(price: string): number | null {
  const digits = price.replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : null;
}

function applyDiscount(amount: number, d: Discount): number {
  const res = d.type === "percent" ? amount * (1 - d.value / 100) : amount - d.value;
  return Math.max(0, Math.round(res));
}

const fmt = (n: number) => n.toLocaleString("fr-FR") + "€";

export function PricingWithPromo({ plans }: { plans: Plan[] }) {
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function apply() {
    if (!code.trim()) return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.valid) {
        setDiscount({ code: data.code, type: data.discount_type, value: data.discount_value });
        setStatus("idle");
        setMessage("");
      } else {
        setDiscount(null);
        setStatus("error");
        setMessage(data.error || "Code invalide.");
      }
    } catch {
      setStatus("error");
      setMessage("Impossible de vérifier le code.");
    }
  }

  function clear() {
    setDiscount(null);
    setCode("");
    setStatus("idle");
    setMessage("");
  }

  return (
    <section className="container-v py-14 sm:py-20">
      {/* Champ code promo */}
      <div className="mx-auto mb-10 max-w-md">
        {discount ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3"
          >
            <div className="flex items-center gap-2.5">
              <Ticket className="h-5 w-5 text-emerald-400" />
              <span className="text-sm text-white">
                Code <span className="font-mono font-semibold text-emerald-300">{discount.code}</span> appliqué —{" "}
                {discount.type === "percent" ? `−${discount.value}%` : `−${fmt(discount.value)}`}
              </span>
            </div>
            <button onClick={clear} className="text-white/50 hover:text-white" aria-label="Retirer le code">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ) : (
          <div>
            <label className="mb-1.5 block text-center text-sm text-white/55">Vous avez un code promo ?</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Ticket className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && apply()}
                  placeholder="VOTRECODE"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-10 pr-4 font-mono text-sm text-white placeholder:text-white/30 outline-none focus:border-vanyo-500/60"
                />
              </div>
              <button onClick={apply} disabled={status === "loading" || !code.trim()} className="btn-premium btn-primary px-5 py-3 text-sm disabled:opacity-60">
                {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Appliquer"}
              </button>
            </div>
            {status === "error" && <p className="mt-2 text-center text-sm text-rose-300">{message}</p>}
          </div>
        )}
      </div>

      {/* Cartes tarifs */}
      <div className="grid gap-5 lg:grid-cols-4">
        {plans.map((plan) => {
          const base = parsePrice(plan.price);
          const discounted = base !== null && discount ? applyDiscount(base, discount) : null;
          return (
            <div
              key={plan.name}
              className={`relative flex h-full flex-col rounded-2xl p-6 transition-transform duration-500 hover:-translate-y-2 ${
                plan.highlight ? "gradient-border bg-ink-card shadow-glow-strong" : "border border-white/8 bg-white/[0.02]"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-to-r from-vanyo-500 to-violet-hi px-3 py-1 text-xs font-semibold text-white">
                  <Sparkles className="h-3 w-3" /> Le plus choisi
                </span>
              )}
              <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
              <p className="mt-1 text-sm text-white/50">{plan.description}</p>
              <div className="mt-5">
                {plan.priceNote && <span className="text-xs text-white/45">{plan.priceNote}</span>}
                {discounted !== null ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight text-white">{fmt(discounted)}</span>
                    <span className="text-base text-white/40 line-through">{fmt(base!)}</span>
                  </div>
                ) : (
                  <div className="text-3xl font-bold tracking-tight text-white">{plan.price}</div>
                )}
              </div>
              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-vanyo-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={discount ? `/devis?promo=${encodeURIComponent(discount.code)}` : "/devis"}
                className={`btn-premium mt-7 w-full py-3 text-sm ${plan.highlight ? "btn-primary" : "btn-ghost"}`}
              >
                Demander un devis
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
