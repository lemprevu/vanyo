"use client";

import { Mail, Check, Trash2, MailOpen } from "lucide-react";
import { useDemo } from "@/lib/demo/DemoProvider";
import type { DemoMessage } from "@/lib/demo/seed";

export default function DemoMessagesPage() {
  const { state, setEntity } = useDemo();
  const messages = state.messages;
  const unread = messages.filter((m) => !m.lu).length;

  const update = (rows: DemoMessage[]) => setEntity("messages", rows);

  function toggleRead(id: string) {
    update(messages.map((m) => (m.id === id ? { ...m, lu: !m.lu } : m)));
  }

  function remove(id: string) {
    if (!confirm("Supprimer ce message ?")) return;
    update(messages.filter((m) => m.id !== id));
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-white">Messages</h1>
        <p className="mt-1 text-sm text-white/50">
          {messages.length} message{messages.length > 1 ? "s" : ""}
          {unread > 0 && ` · ${unread} non lu${unread > 1 ? "s" : ""}`} · démonstration
        </p>
      </div>

      <div className="grid gap-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`gradient-border rounded-2xl bg-ink-card/60 p-5 ${!m.lu ? "ring-1 ring-vanyo-500/30" : ""}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-vanyo-500 to-violet-hi text-sm font-semibold text-white">
                  {m.nom.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{m.nom}</span>
                    {!m.lu && <span className="rounded-full bg-vanyo-500/15 px-2 py-0.5 text-xs font-medium text-vanyo-200">Nouveau</span>}
                  </div>
                  <div className="text-xs text-white/45">{m.email}</div>
                </div>
              </div>
              <span className="text-xs text-white/40">{new Date(m.created_at).toLocaleString("fr-FR")}</span>
            </div>
            {m.sujet && <div className="mt-3 text-sm font-medium text-vanyo-200">{m.sujet}</div>}
            <p className="mt-1.5 text-sm leading-relaxed text-white/70">{m.message}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={`mailto:${m.email}`} className="btn-premium btn-ghost px-4 py-2 text-sm">
                <Mail className="h-4 w-4" /> Répondre
              </a>
              <button onClick={() => toggleRead(m.id)} className="btn-premium btn-ghost px-4 py-2 text-sm">
                {m.lu ? <MailOpen className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                {m.lu ? "Marquer non lu" : "Marquer comme lu"}
              </button>
              <button onClick={() => remove(m.id)} className="btn-premium btn-ghost px-4 py-2 text-sm text-rose-300">
                <Trash2 className="h-4 w-4" /> Supprimer
              </button>
            </div>
          </div>
        ))}
        {messages.length === 0 && <p className="py-14 text-center text-sm text-white/40">Aucun message.</p>}
      </div>
    </div>
  );
}
