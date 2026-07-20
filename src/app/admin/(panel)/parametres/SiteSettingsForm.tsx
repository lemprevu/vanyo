"use client";

import { useState } from "react";
import { Save, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { SiteSettings } from "@/lib/types";
import { FieldGroup, Input, Textarea } from "@/components/ui/Field";

export function SiteSettingsForm({ initial, live }: { initial: SiteSettings; live: boolean }) {
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = live ? createClient() : null;

  const set = (k: keyof SiteSettings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  async function save() {
    setSaving(true);
    setSaved(false);
    if (supabase) {
      await supabase.from("site_settings").update({ ...values, id: undefined }).eq("id", 1);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="gradient-border rounded-2xl bg-ink-card/60 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-white">Informations générales</h2>
          <p className="text-xs text-white/45">
            Nom, coordonnées et réseaux sociaux affichés sur tout le site.{!live && " · démonstration"}
          </p>
        </div>
        <button onClick={save} disabled={saving} className="btn-premium btn-primary px-5 py-2.5 text-sm disabled:opacity-60">
          {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saving ? "Enregistrement…" : saved ? "Enregistré" : "Enregistrer"}
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <FieldGroup label="Nom du site">
          <Input value={values.site_name} onChange={set("site_name")} />
        </FieldGroup>
        <FieldGroup label="Slogan">
          <Input value={values.tagline} onChange={set("tagline")} />
        </FieldGroup>
        <FieldGroup label="Email" className="sm:col-span-2">
          <Input value={values.email} onChange={set("email")} type="email" />
        </FieldGroup>
        <FieldGroup label="Téléphone">
          <Input value={values.phone} onChange={set("phone")} />
        </FieldGroup>
        <FieldGroup label="Horaires">
          <Input value={values.hours} onChange={set("hours")} />
        </FieldGroup>
        <FieldGroup label="Adresse" className="sm:col-span-2">
          <Input value={values.address} onChange={set("address")} />
        </FieldGroup>
        <FieldGroup label="Description (SEO)" className="sm:col-span-2">
          <Textarea rows={2} value={values.description ?? ""} onChange={set("description")} />
        </FieldGroup>
        <FieldGroup label="Instagram">
          <Input value={values.instagram ?? ""} onChange={set("instagram")} placeholder="https://instagram.com/..." />
        </FieldGroup>
        <FieldGroup label="LinkedIn">
          <Input value={values.linkedin ?? ""} onChange={set("linkedin")} placeholder="https://linkedin.com/..." />
        </FieldGroup>
        <FieldGroup label="Twitter / X">
          <Input value={values.twitter ?? ""} onChange={set("twitter")} placeholder="https://x.com/..." />
        </FieldGroup>
        <FieldGroup label="Dribbble">
          <Input value={values.dribbble ?? ""} onChange={set("dribbble")} placeholder="https://dribbble.com/..." />
        </FieldGroup>
      </div>
    </div>
  );
}
