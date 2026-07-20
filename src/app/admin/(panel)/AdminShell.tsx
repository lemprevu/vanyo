"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  LayoutDashboard, FileText, MessageSquare, Image as ImageIcon, Newspaper,
  Settings, Bell, LogOut, Menu, X, Search, Star, Users, Mail, Ticket,
} from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Devis", href: "/admin/devis", icon: FileText, key: "devis" },
  { label: "Messages", href: "/admin/messages", icon: MessageSquare, key: "messages" },
  { label: "Réalisations", href: "/admin/realisations", icon: ImageIcon },
  { label: "Blog", href: "/admin/blog", icon: Newspaper },
  { label: "Avis", href: "/admin/avis", icon: Star },
  { label: "Codes promo", href: "/admin/codes-promo", icon: Ticket },
  { label: "Utilisateurs", href: "/admin/utilisateurs", icon: Users },
  { label: "Signature email", href: "/admin/signature", icon: Mail },
  { label: "Paramètres", href: "/admin/parametres", icon: Settings },
];

type Notif = { id: string; type: string; text: string; time: string };

export function AdminShell({
  children,
  email,
  live,
  counts,
  notifications,
}: {
  children: React.ReactNode;
  email: string;
  live: boolean;
  counts: { devis: number; messages: number };
  notifications: Notif[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  // Copie locale : on peut la vider dès l'ouverture sans attendre un rechargement serveur.
  const [notifs, setNotifs] = useState(notifications);
  const [unreadCount, setUnreadCount] = useState(notifications.length);

  async function logout() {
    const supabase = createClient();
    await supabase?.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  function openNotifications() {
    setNotifOpen((v) => !v);
    if (unreadCount === 0) return;
    // On marque comme lues : le badge disparaît immédiatement, la liste
    // reste visible le temps de la lecture. Persisté en base pour que la
    // notification ne réapparaisse pas à la prochaine visite.
    setUnreadCount(0);
    if (live) {
      const ids = notifs.filter((n) => n.type === "devis").map((n) => n.id);
      if (ids.length > 0) {
        // keepalive: la requête survit même si la page est rafraîchie
        // juste après le clic (sinon le navigateur l'annule en plein vol
        // et la notification réapparaît au prochain chargement).
        fetch("/api/admin/devis/mark-viewed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
          keepalive: true,
        }).catch(() => {});
      }
    }
  }

  const badge = (key?: string) =>
    key === "devis" ? counts.devis : key === "messages" ? counts.messages : 0;

  const Sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <LogoMark size={30} />
        <span className="text-lg font-semibold text-white">
          Van<span className="text-gradient-violet">yo</span>
          <span className="ml-1 text-xs font-normal text-white/40">admin</span>
        </span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV.map((item) => {
          const active = pathname === item.href;
          const b = badge(item.key);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors ${
                active ? "bg-vanyo-500/15 text-white ring-1 ring-vanyo-500/30" : "text-white/55 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className="h-[18px] w-[18px]" />
              <span className="flex-1">{item.label}</span>
              {b > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-vanyo-500 px-1.5 text-[11px] font-semibold text-white">
                  {b}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/8 p-3">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-vanyo-500 to-violet-hi text-xs font-semibold text-white">
            {email.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-white">{email}</div>
            <div className="text-xs text-emerald-400">Administrateur</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-white/55 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
        >
          <LogOut className="h-[18px] w-[18px]" /> Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-ink text-white">
      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-white/8 bg-ink-soft lg:block">
        {Sidebar}
      </aside>

      {/* Sidebar mobile */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-white/8 bg-ink-soft lg:hidden"
            >
              {Sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Contenu */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/8 bg-ink/80 px-4 py-3 backdrop-blur-xl sm:px-6">
          <button onClick={() => setOpen(true)} className="glass flex h-10 w-10 items-center justify-center rounded-xl lg:hidden">
            <Menu className="h-5 w-5" />
          </button>

          <div className="relative hidden max-w-sm flex-1 sm:block">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              placeholder="Rechercher…"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/35 outline-none focus:border-vanyo-500/60"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <button
                onClick={openNotifications}
                className="glass relative flex h-10 w-10 items-center justify-center rounded-xl text-white/70 hover:text-white"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    className="absolute right-0 top-12 w-80 rounded-2xl border border-white/10 bg-ink-card/95 p-2 shadow-2xl backdrop-blur-xl"
                  >
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="text-sm font-semibold text-white">Notifications</span>
                      <span className="text-xs text-white/40">{notifs.length} récentes</span>
                    </div>
                    <div className="max-h-80 space-y-1 overflow-y-auto">
                      {notifs.length === 0 && (
                        <p className="px-3 py-6 text-center text-sm text-white/40">Aucune notification.</p>
                      )}
                      {notifs.map((n) => (
                        <Link
                          key={n.id}
                          href={n.type === "devis" ? "/admin/devis" : "/admin/messages"}
                          onClick={() => setNotifOpen(false)}
                          className="flex gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5"
                        >
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-vanyo-400" />
                          <div>
                            <p className="text-sm text-white/85">{n.text}</p>
                            <p className="text-xs text-white/40">{n.time}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link href="/" className="glass hidden rounded-xl px-4 py-2 text-sm text-white/70 hover:text-white sm:block">
              Voir le site
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
