"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  Save, CheckCircle2, Loader2, Settings2, Palette, Search, Plug, Mail, Shield, Send,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { SiteSettingsFull } from "@/lib/types";
import { HOME_SECTIONS, FONT_CHOICES } from "@/lib/types";
import { FieldGroup, Input, Textarea, Select, Label } from "@/components/ui/Field";
import { TwoFactorSetup } from "./TwoFactorSetup";

const TABS = [
  { key: "general", label: "Général", icon: Settings2 },
  { key: "apparence", label: "Apparence", icon: Palette },
  { key: "seo", label: "SEO", icon: Search },
  { key: "integrations", label: "Intégrations", icon: Plug },
  { key: "smtp", label: "Emails & SMTP", icon: Mail },
  { key: "securite", label: "Sécurité", icon: Shield },
] as const;

export function SettingsTabs({ initial, live }: { initial: SiteSettingsFull; live: boolean }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("general");
  const [v, setV] = useState<SiteSettingsFull>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [smtpTest, setSmtpTest] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [smtpMsg, setSmtpMsg] = useState("");

  const supabase = live ? createClient() : null;
  const set = <K extends keyof SiteSettingsFull>(k: K, val: SiteSettingsFull[K]) =>
    setV((prev) => ({ ...prev, [k]: val }));
  const field = (k: keyof SiteSettingsFull) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    set(k, e.target.value as never);

  const toggleSection = (key: string) =>
    set("home_sections", v.home_sections.includes(key)
      ? v.home_sections.filter((s) => s !== key)
      : [...v.home_sections, key]);

  async function save() {
    setSaving(true); setSaved(false); setError("");
    if (supabase) {
      const { id, ...payload } = v;
      void id;
      const { error } = await supabase.from("site_settings").update(payload).eq("id", 1);
      if (error) { setError(error.message); setSaving(false); return; }
    }
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function testSmtp() {
    setSmtpTest("loading"); setSmtpMsg("");
    // On enregistre d'abord pour que le test utilise les valeurs à l'écran.
    await save();
    const res = await fetch("/api/admin/smtp-test", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) { setSmtpTest("ok"); setSmtpMsg("Email de test envoyé ! Vérifiez votre boîte."); }
    else { setSmtpTest("err"); setSmtpMsg(data.error || "Échec du test."); }
  }

  return (
    <div className="space-y-5">
      {/* Onglets */}
      <div className="flex flex-wrap gap-1.5 rounded-2xl border border-white/8 bg-ink-card/60 p-1.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${
              tab === t.key ? "text-white" : "text-white/55 hover:text-white"
            }`}
          >
            {tab === t.key && (
              <motion.span layoutId="settings-tab" className="absolute inset-0 -z-10 rounded-xl bg-vanyo-500/15 ring-1 ring-vanyo-500/30" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
            )}
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="gradient-border rounded-2xl bg-ink-card/60 p-5 sm:p-6">
        {/* GÉNÉRAL */}
        {tab === "general" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldGroup label="Nom du site"><Input value={v.site_name} onChange={field("site_name")} /></FieldGroup>
            <FieldGroup label="Slogan"><Input value={v.tagline} onChange={field("tagline")} /></FieldGroup>
            <FieldGroup label="Email" className="sm:col-span-2"><Input value={v.email} onChange={field("email")} type="email" /></FieldGroup>
            <FieldGroup label="Téléphone"><Input value={v.phone} onChange={field("phone")} /></FieldGroup>
            <FieldGroup label="Horaires"><Input value={v.hours} onChange={field("hours")} /></FieldGroup>
            <FieldGroup label="Adresse" className="sm:col-span-2"><Input value={v.address} onChange={field("address")} /></FieldGroup>
            <FieldGroup label="Description" className="sm:col-span-2"><Textarea rows={2} value={v.description ?? ""} onChange={field("description")} /></FieldGroup>
            <FieldGroup label="Instagram"><Input value={v.instagram ?? ""} onChange={field("instagram")} /></FieldGroup>
            <FieldGroup label="LinkedIn"><Input value={v.linkedin ?? ""} onChange={field("linkedin")} /></FieldGroup>
            <FieldGroup label="Twitter / X"><Input value={v.twitter ?? ""} onChange={field("twitter")} /></FieldGroup>
            <FieldGroup label="Dribbble"><Input value={v.dribbble ?? ""} onChange={field("dribbble")} /></FieldGroup>
          </div>
        )}

        {/* APPARENCE */}
        {tab === "apparence" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Couleur d'accent</Label>
                <div className="flex items-center gap-3">
                  <input type="color" value={v.brand_color} onChange={(e) => set("brand_color", e.target.value)} className="h-11 w-16 cursor-pointer rounded-lg border border-white/10 bg-transparent" />
                  <Input value={v.brand_color} onChange={field("brand_color")} className="flex-1" />
                </div>
              </div>
              <FieldGroup label="Police">
                <Select value={v.font_family} onChange={field("font_family")}>
                  {FONT_CHOICES.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                </Select>
              </FieldGroup>
            </div>
            <div>
              <Label>Sections affichées sur la page d'accueil</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {HOME_SECTIONS.map((s) => {
                  const active = v.home_sections.includes(s.key);
                  return (
                    <button key={s.key} type="button" onClick={() => toggleSection(s.key)}
                      className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-all ${active ? "border-vanyo-500/70 bg-vanyo-500/15 text-white" : "border-white/10 text-white/55"}`}>
                      <span className={`flex h-4 w-4 items-center justify-center rounded border ${active ? "border-vanyo-400 bg-vanyo-500" : "border-white/25"}`}>
                        {active && <CheckCircle2 className="h-3 w-3 text-white" />}
                      </span>
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SEO */}
        {tab === "seo" && (
          <div className="space-y-4">
            <FieldGroup label="Mots-clés (séparés par des virgules)">
              <Input value={v.seo_keywords ?? ""} onChange={field("seo_keywords")} placeholder="création site, agence web, ..." />
            </FieldGroup>
            <FieldGroup label="Titre OpenGraph (partage réseaux sociaux)">
              <Input value={v.og_title ?? ""} onChange={field("og_title")} placeholder="Vanyo — Agence web premium" />
            </FieldGroup>
            <FieldGroup label="Description OpenGraph">
              <Textarea rows={2} value={v.og_description ?? ""} onChange={field("og_description")} />
            </FieldGroup>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <input type="checkbox" checked={v.search_visible} onChange={(e) => set("search_visible", e.target.checked)} className="h-4 w-4 accent-vanyo-500" />
              <span className="text-sm text-white/70">Site visible par les moteurs de recherche (Google…)</span>
            </label>
          </div>
        )}

        {/* INTÉGRATIONS */}
        {tab === "integrations" && (
          <div className="space-y-4">
            <FieldGroup label="Google Analytics — ID de mesure">
              <Input value={v.ga_id ?? ""} onChange={field("ga_id")} placeholder="G-XXXXXXXXXX" />
            </FieldGroup>
            <FieldGroup label="Meta Pixel — ID">
              <Input value={v.meta_pixel_id ?? ""} onChange={field("meta_pixel_id")} placeholder="1234567890" />
            </FieldGroup>
            <div className="border-t border-white/8 pt-4">
              <p className="mb-3 text-sm font-medium text-white/70">Cloudflare Turnstile (anti-spam des formulaires)</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldGroup label="Clé de site (publique)"><Input value={v.turnstile_site_key ?? ""} onChange={field("turnstile_site_key")} /></FieldGroup>
                <FieldGroup label="Clé secrète"><Input type="password" value={v.turnstile_secret ?? ""} onChange={field("turnstile_secret")} /></FieldGroup>
              </div>
            </div>
          </div>
        )}

        {/* SMTP */}
        {tab === "smtp" && (
          <div className="space-y-4">
            <p className="text-sm text-white/50">
              Configurez votre SMTP (ex. OVH) pour recevoir un email à chaque nouvelle demande de devis ou message.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldGroup label="Serveur SMTP"><Input value={v.smtp_host ?? ""} onChange={field("smtp_host")} placeholder="ssl0.ovh.net" /></FieldGroup>
              <FieldGroup label="Port"><Input type="number" value={v.smtp_port ?? 587} onChange={(e) => set("smtp_port", Number(e.target.value))} placeholder="587" /></FieldGroup>
              <FieldGroup label="Utilisateur"><Input value={v.smtp_user ?? ""} onChange={field("smtp_user")} placeholder="contact@vanyo.fr" /></FieldGroup>
              <FieldGroup label="Mot de passe"><Input type="password" value={v.smtp_password ?? ""} onChange={field("smtp_password")} /></FieldGroup>
              <FieldGroup label="Email d'expédition"><Input value={v.smtp_from ?? ""} onChange={field("smtp_from")} placeholder="contact@vanyo.fr" /></FieldGroup>
              <FieldGroup label="Recevoir les alertes sur"><Input value={v.notify_email ?? ""} onChange={field("notify_email")} placeholder="vous@vanyo.fr" /></FieldGroup>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={testSmtp} disabled={smtpTest === "loading"} className="btn-premium btn-ghost px-4 py-2.5 text-sm">
                {smtpTest === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Envoyer un email de test
              </button>
              {smtpMsg && (
                <span className={`text-sm ${smtpTest === "ok" ? "text-emerald-300" : "text-rose-300"}`}>{smtpMsg}</span>
              )}
            </div>
          </div>
        )}

        {/* SÉCURITÉ */}
        {tab === "securite" && (
          <div className="space-y-4">
            <p className="text-sm text-white/50">Protégez votre compte administrateur avec une seconde vérification.</p>
            <TwoFactorSetup live={live} />
          </div>
        )}
      </div>

      {/* Barre d'enregistrement (sauf onglet sécurité qui gère lui-même) */}
      {tab !== "securite" && (
        <div className="flex items-center justify-end gap-3">
          {error && <span className="text-sm text-rose-300">{error}</span>}
          <button onClick={save} disabled={saving} className="btn-premium btn-primary px-6 py-3 text-sm disabled:opacity-60">
            {saved ? <CheckCircle2 className="h-4 w-4" /> : saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Enregistrement…" : saved ? "Enregistré" : "Enregistrer"}
          </button>
        </div>
      )}
    </div>
  );
}
