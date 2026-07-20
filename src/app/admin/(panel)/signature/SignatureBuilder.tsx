"use client";

import { useMemo, useRef, useState } from "react";
import { Copy, Check, Code2, Eye } from "lucide-react";
import { Label, Input } from "@/components/ui/Field";
import type { SiteSettings } from "@/lib/types";
import { SITE } from "@/lib/site";

/**
 * Génère le HTML de la signature. Structure en <table> (pas de flex/grid)
 * pour un rendu fiable dans Outlook, Gmail, Apple Mail, etc.
 */
function buildHtml(v: {
  name: string; role: string; phone: string; email: string; logoUrl: string; siteUrl: string; color: string;
}) {
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;color:#111827;">
  <tr>
    <td style="padding-right:16px;border-right:2px solid ${v.color};">
      <img src="${v.logoUrl}" alt="Vanyo" width="120" style="display:block;" />
    </td>
    <td style="padding-left:16px;">
      <div style="font-size:15px;font-weight:bold;color:#111827;">${v.name || "Votre nom"}</div>
      <div style="font-size:13px;color:${v.color};margin-top:2px;">${v.role || "Votre poste"}</div>
      <div style="font-size:12px;color:#4b5563;margin-top:8px;line-height:1.6;">
        ${v.phone ? `${v.phone}<br/>` : ""}
        <a href="mailto:${v.email}" style="color:${v.color};text-decoration:none;">${v.email}</a><br/>
        <a href="${v.siteUrl}" style="color:${v.color};text-decoration:none;">${v.siteUrl.replace(/^https?:\/\//, "")}</a>
      </div>
    </td>
  </tr>
</table>`;
}

export function SignatureBuilder({ settings }: { settings: SiteSettings }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // PNG plutôt que SVG : la plupart des clients mails (Outlook en tête)
  // n'affichent pas les images SVG dans le corps d'un email.
  const logoUrl = `${SITE.domain}/logo-email.png`;
  const siteUrl = SITE.domain;
  const color = "#6D4AFF";

  const html = useMemo(
    () => buildHtml({ name, role, phone, email, logoUrl, siteUrl, color }),
    [name, role, phone, email, logoUrl, siteUrl]
  );

  async function copyRich() {
    try {
      const blob = new Blob([html], { type: "text/html" });
      const item = new ClipboardItem({ "text/html": blob, "text/plain": new Blob([html], { type: "text/plain" }) });
      await navigator.clipboard.write([item]);
    } catch {
      await navigator.clipboard.writeText(html);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function copyCode() {
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="gradient-border rounded-2xl bg-ink-card/60 p-5">
        <h2 className="font-semibold text-white">Vos informations</h2>
        <div className="mt-4 space-y-4">
          <div>
            <Label>Nom et prénom</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jean Dupont" />
          </div>
          <div>
            <Label>Poste</Label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Fondateur, Chargé de projet…" />
          </div>
          <div>
            <Label>Téléphone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button onClick={copyRich} className="btn-premium btn-primary flex-1 py-3 text-sm">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copié !" : "Copier la signature"}
          </button>
          <button
            onClick={() => setShowCode((v) => !v)}
            className="btn-premium btn-ghost px-4 py-3 text-sm"
            title="Afficher le code HTML"
          >
            {showCode ? <Eye className="h-4 w-4" /> : <Code2 className="h-4 w-4" />}
          </button>
        </div>

        {showCode && (
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40">Code HTML (pour Outlook « Éditer en HTML »)</span>
              <button onClick={copyCode} className="text-xs text-vanyo-200 hover:text-white">Copier le code</button>
            </div>
            <textarea
              readOnly
              value={html}
              rows={8}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-xs text-white/70"
            />
          </div>
        )}
      </div>

      {/* Aperçu + instructions */}
      <div className="space-y-4">
        <div className="gradient-border rounded-2xl bg-white p-6">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-black/40">Aperçu</p>
          <div ref={previewRef} dangerouslySetInnerHTML={{ __html: html }} />
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
          <h3 className="text-sm font-semibold text-white">Comment l'installer</h3>
          <ol className="mt-3 space-y-2 text-sm text-white/60">
            <li><strong className="text-white/80">1.</strong> Clique « Copier la signature » ci-dessus.</li>
            <li><strong className="text-white/80">2.</strong> Ouvre les réglages de ta boîte mail (Gmail : ⚙️ → Voir tous les paramètres → Signature. Webmail OVH : Paramètres → Identités → Signature. Outlook : Fichier → Options → Courrier → Signatures).</li>
            <li><strong className="text-white/80">3.</strong> Colle (Ctrl+V) dans la zone de signature.</li>
            <li><strong className="text-white/80">4.</strong> Enregistre — elle s'ajoutera automatiquement à chaque nouvel email.</li>
          </ol>
          <p className="mt-3 text-xs text-white/40">
            Si le collage n'affiche que du texte brut, utilise le bouton <Code2 className="inline h-3 w-3" /> pour copier le code HTML et colle-le dans le mode « Éditer le code source » de ton client mail.
          </p>
        </div>
      </div>
    </div>
  );
}
