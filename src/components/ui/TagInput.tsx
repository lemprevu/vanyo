"use client";

import { useState, type KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";

/**
 * Champ de saisie de tags (mots-clés) ajoutés un par un.
 * Valeur exposée sous forme de tableau de chaînes.
 */
export function TagInput({
  value,
  onChange,
  placeholder = "Ajouter un mot-clé…",
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const t = draft.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setDraft("");
  };

  const remove = (t: string) => onChange(value.filter((x) => x !== t));

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add();
    } else if (e.key === "Backspace" && !draft && value.length) {
      remove(value[value.length - 1]);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2 transition-colors focus-within:border-vanyo-500/70">
      <div className="flex flex-wrap gap-1.5">
        {value.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-lg bg-vanyo-500/15 px-2.5 py-1 text-sm text-vanyo-100">
            {t}
            <button type="button" onClick={() => remove(t)} className="text-vanyo-200/70 hover:text-white" aria-label={`Retirer ${t}`}>
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        <div className="flex flex-1 items-center gap-1">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
            onBlur={add}
            placeholder={value.length === 0 ? placeholder : ""}
            className="min-w-[120px] flex-1 bg-transparent px-1.5 py-1 text-sm text-white placeholder:text-white/35 outline-none"
          />
          {draft && (
            <button type="button" onClick={add} className="rounded-md bg-vanyo-500/20 p-1 text-vanyo-200 hover:bg-vanyo-500/30" aria-label="Ajouter">
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
