"use client";

import { Star, ImageOff, Upload } from "lucide-react";
import { Label, Input, Textarea, Select } from "@/components/ui/Field";
import { COLOR_PRESETS } from "@/lib/types";
import type { FieldDef, Row } from "@/lib/demo/types";

/** Rendu d'un champ de formulaire selon son type (schéma métier). */
export function FieldControl({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const common = { placeholder: field.placeholder };

  return (
    <div>
      {field.type !== "boolean" && <Label required={field.required}>{field.label}</Label>}

      {field.type === "text" && (
        <Input {...common} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
      )}

      {field.type === "textarea" && (
        <Textarea rows={3} {...common} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
      )}

      {(field.type === "number" || field.type === "price") && (
        <Input
          type="number"
          {...common}
          value={(value as number) ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        />
      )}

      {field.type === "date" && (
        <Input type="date" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
      )}

      {field.type === "select" && (
        <Select value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)}>
          {(field.options ?? []).map((o) => (
            <option key={o} value={o} className="bg-ink-card text-white">{o}</option>
          ))}
        </Select>
      )}

      {field.type === "tags" && (
        <Input
          {...common}
          value={Array.isArray(value) ? (value as string[]).join(", ") : ((value as string) ?? "")}
          onChange={(e) => onChange(e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
        />
      )}

      {field.type === "rating" && (
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => onChange(n)}>
              <Star className={`h-6 w-6 ${n <= ((value as number) || 0) ? "fill-amber-400 text-amber-400" : "text-white/20"}`} />
            </button>
          ))}
        </div>
      )}

      {field.type === "color" && (
        <div className="flex flex-wrap gap-2">
          {COLOR_PRESETS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => onChange(c.value)}
              className={`h-9 w-9 rounded-lg bg-gradient-to-br ${c.value} ring-2 ${value === c.value ? "ring-white" : "ring-transparent"}`}
              title={c.label}
            />
          ))}
        </div>
      )}

      {field.type === "image" && (
        <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10">
            {value ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value as string} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImageOff className="h-5 w-5 text-white/25" />
            )}
          </div>
          <label className="glass flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/70 hover:text-white">
            <Upload className="h-3.5 w-3.5" />
            {value ? "Changer la photo" : "Ajouter une photo"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => onChange(reader.result as string);
                reader.readAsDataURL(file);
                e.target.value = "";
              }}
            />
          </label>
          {!!value && (
            <button type="button" onClick={() => onChange("")} className="text-xs text-white/40 hover:text-rose-300">
              Retirer
            </button>
          )}
        </div>
      )}

      {field.type === "boolean" && (
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-white/70">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 accent-vanyo-500"
          />
          {field.label}
        </label>
      )}
    </div>
  );
}

/** Valeur d'un champ formatée pour l'affichage en liste/détail. */
export function displayValue(field: FieldDef, row: Row): string {
  const v = row[field.key];
  if (v === undefined || v === null || v === "") return "—";
  if (field.type === "image") return "Photo ajoutée";
  if (field.type === "boolean") return v ? "Oui" : "Non";
  if (field.type === "tags" && Array.isArray(v)) return v.join(", ");
  if (field.type === "price") return `${v}${field.suffix ?? " €"}`;
  if (field.type === "date") return new Date(String(v)).toLocaleDateString("fr-FR");
  return `${v}${field.suffix ?? ""}`;
}

/** Valeur initiale vide d'un champ. */
export function emptyValue(field: FieldDef): unknown {
  switch (field.type) {
    case "boolean": return false;
    case "tags": return [];
    case "rating": return 5;
    case "number": case "price": return "";
    case "select": return field.options?.[0] ?? "";
    case "color": return COLOR_PRESETS[0].value;
    case "image": return "";
    default: return "";
  }
}
