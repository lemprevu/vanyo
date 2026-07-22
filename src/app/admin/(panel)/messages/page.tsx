import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

type Message = {
  id: string;
  created_at: string;
  nom: string;
  email: string;
  sujet?: string | null;
  message: string;
  lu?: boolean;
};

const DEMO: Message[] = [
  { id: "1", created_at: new Date().toISOString(), nom: "Léa Fontaine", email: "lea@greenroots.org", sujet: "Refonte de notre site associatif", message: "Bonjour, nous aimerions moderniser notre site. Quand seriez-vous disponible pour un échange ?" },
  { id: "2", created_at: new Date(Date.now() - 5400e3).toISOString(), nom: "Marc Dubois", email: "marc@cassard.fr", sujet: "Portfolio photographe", message: "J'ai vu vos réalisations, superbe travail ! J'aimerais un portfolio dans le même esprit." },
];

export default async function MessagesPage() {
  await requirePermission("messages");
  const supabase = await createClient();
  let messages = DEMO;
  let live = false;
  if (supabase) {
    const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
    messages = (data as Message[]) ?? [];
    live = true;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-white">Messages</h1>
        <p className="mt-1 text-sm text-white/50">
          {messages.length} message{messages.length > 1 ? "s" : ""}{!live && " · démonstration"}
        </p>
      </div>

      <div className="grid gap-3">
        {messages.map((m) => (
          <div key={m.id} className="gradient-border rounded-2xl bg-ink-card/60 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-vanyo-500 to-violet-hi text-sm font-semibold text-white">
                  {m.nom.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <div className="font-medium text-white">{m.nom}</div>
                  <div className="text-xs text-white/45">{m.email}</div>
                </div>
              </div>
              <span className="text-xs text-white/40">{new Date(m.created_at).toLocaleString("fr-FR")}</span>
            </div>
            {m.sujet && <div className="mt-3 text-sm font-medium text-vanyo-200">{m.sujet}</div>}
            <p className="mt-1.5 text-sm leading-relaxed text-white/70">{m.message}</p>
            <a href={`mailto:${m.email}`} className="btn-premium btn-ghost mt-4 px-4 py-2 text-sm">
              <Mail className="h-4 w-4" /> Répondre
            </a>
          </div>
        ))}
        {messages.length === 0 && <p className="py-14 text-center text-sm text-white/40">Aucun message.</p>}
      </div>
    </div>
  );
}
