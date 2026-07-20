import {
  Globe, UtensilsCrossed, ShoppingCart, Rocket, LayoutGrid, RefreshCw,
  Wrench, Search, TrendingUp, Gauge, AtSign, Server, Mail, LayoutDashboard,
  LifeBuoy, Sparkles, Zap, Smartphone, ShieldCheck, Handshake, PhoneCall,
  ClipboardList, PenTool, Code2, CheckCircle2, HeartHandshake, type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  Globe, UtensilsCrossed, ShoppingCart, Rocket, LayoutGrid, RefreshCw,
  Wrench, Search, TrendingUp, Gauge, AtSign, Server, Mail, LayoutDashboard,
  LifeBuoy, Sparkles, Zap, Smartphone, ShieldCheck, Handshake, PhoneCall,
  ClipboardList, PenTool, Code2, CheckCircle2, HeartHandshake,
};

/** Rend une icône lucide à partir de son nom (défini dans le contenu). */
export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = MAP[name] ?? Sparkles;
  return <Cmp className={className} />;
}
