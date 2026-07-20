"use client";

import { useState } from "react";
import { Send, CheckCircle2, Loader2 } from "lucide-react";
import { FieldGroup, Input, Textarea } from "@/components/ui/Field";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Erreur");
      setStatus("ok");
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-400" />
        <h3 className="mt-4 text-xl font-semibold text-white">Message envoyé !</h3>
        <p className="mt-2 text-sm text-white/60">
          Merci, nous revenons vers vous très rapidement.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label="Nom" required>
          <Input name="nom" required placeholder="Votre nom" autoComplete="name" />
        </FieldGroup>
        <FieldGroup label="Email" required>
          <Input name="email" type="email" required placeholder="vous@email.com" autoComplete="email" />
        </FieldGroup>
      </div>
      <FieldGroup label="Sujet">
        <Input name="sujet" placeholder="Objet de votre message" />
      </FieldGroup>
      <FieldGroup label="Message" required>
        <Textarea name="message" required rows={6} placeholder="Décrivez votre besoin…" />
      </FieldGroup>

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
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Envoi…
          </>
        ) : (
          <>
            Envoyer le message <Send className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
