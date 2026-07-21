"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Check, Sparkles, Ticket, Loader2, X, Megaphone } from "lucide-react";
import type { Plan } from "@/lib/content";
import type { SiteSettings } from "@/lib/types";
import { parsePrice, formatPrice, discountPercent, applyPercent } from "@/lib/price";

type Discount = { code: string | null; type: "percent" | "amount"; value: number; label: string };

function applyDiscount(amount: number, d: Discount): number {
  const res = d.type === "percent" ? amount * (1 - d.value / 100) : amount - d.value;
  return Math.max(0, Math.round(res));
}

export function PricingWithPromo({ plans, settings }: { plans: Plan[]; settings: SiteSettings }) {
  const globalPromoActive =
    settings.promo_active &&
    (!settings.promo_expires_at || new Date(settings.promo_expires_at) >= new Date());

  const globalDiscount: Discount | null = globalPromoActive
    ? { code: null, type: "percent", value: settings.promo_percent, label: settings.promo_label || "Offre limitée" }
    : null;

  const [code, setCode] = useState("");
  // Un code saisi remplace la promo globale (pas de cumul, pour rester lisible).
  const [codeDiscount, setCodeDiscount] = useState<Discount | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  const activeDiscount = codeDiscount ?? globalDiscount;

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
        setCodeDiscount({ code: data.code, type: data.discount_type, value: data.discount_value, label: data.code });
        setStatus("idle");
        setMessage("");
      } else {
        setCodeDiscount(null);
        setStatus("error");
        setMessage(data.error || "Code invalide.");
      }
    } catch {
      setStatus("error");
      setMessage("Impossible de vérifier le code.");
    }
  }

  function clear() {
    setCodeDiscount(null);
    setCode("");
    setStatus("idle");
    setMessage("");
  }

  return (
    <section className="container-v py-14 sm:py-20">
      {/* Bandeau promo automatique pour tout le monde */}
      {globalPromoActive && !codeDiscount && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="mx-auto mb-8 flex max-w-xl items-center justify-center gap-2.5 rounded-2xl border border-vanyo-500/40 bg-gradient-to-r from-vanyo-500/15 to-violet-hi/15 px-5 py-3 text-center"
        >
          <Megaphone className="h-4 w-4 shrink-0 text-vanyo-300" />
          <span className="text-sm text-white">
            <span className="font-semibold">{settings.promo_label}</span> — −{settings.promo_percent}% sur tous les tarifs, appliqué automatiquement
          </span>
        </motion.div>
      )}

      {/* Champ code promo */}
      <div className="mx-auto mb-10 max-w-md">
        {codeDiscount ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3"
          >
            <div className="flex items-center gap-2.5">
              <Ticket className="h-5 w-5 text-emerald-400" />
              <span className="text-sm text-white">
                Code <span className="font-mono font-semibold text-emerald-300">{codeDiscount.code}</span> appliqué —{" "}
                {codeDiscount.type === "percent" ? `−${codeDiscount.value}%` : `−${formatPrice(codeDiscount.value)}`}
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
          const original = plan.originalPrice ? parsePrice(plan.originalPrice) : null;

          // Une promo (code ou globale) prime sur le prix conseillé pour l'affichage :
          // on barre le prix affiché et on montre le prix réduit par la promo.
          const promoDiscounted = base !== null && activeDiscount ? applyDiscount(base, activeDiscount) : null;
          const manualPct = base !== null && original && original > base ? discountPercent(original, base) : 0;

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
              {!plan.highlight && manualPct > 0 && !promoDiscounted && (
                <span className="absolute -top-3 right-4 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white">
                  −{manualPct}%
                </span>
              )}
              <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
              <p className="mt-1 text-sm text-white/50">{plan.description}</p>
              <div className="mt-5">
                {plan.priceNote && <span className="text-xs text-white/45">{plan.priceNote}</span>}
                {promoDiscounted !== null ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight text-white">{formatPrice(promoDiscounted)}</span>
                    <span className="text-base text-white/40 line-through">{formatPrice(base!)}</span>
                  </div>
                ) : original && base ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight text-white">{plan.price}</span>
                    <span className="text-base text-white/40 line-through">{plan.originalPrice}</span>
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
                href={codeDiscount?.code ? `/devis?promo=${encodeURIComponent(codeDiscount.code)}` : "/devis"}
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
