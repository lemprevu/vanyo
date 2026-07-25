"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import {
  CheckCircle2, Check, Loader2, ArrowRight, ArrowLeft, Send, Plus, Minus,
  ChevronDown, Sparkles, Wand2, Ticket, Info,
  Image as ImageIcon, Newspaper, Languages, PenTool, Palette, Mail, ClipboardList,
  CalendarCheck, CalendarClock, MessageCircle, Star, CreditCard, ShoppingCart,
  LogIn, FileText, LayoutDashboard, BarChart3, CalendarDays, Users, ScrollText,
  Search, TrendingUp, MapPin, Gauge, Zap, Rocket, type LucideIcon,
} from "lucide-react";
import { FieldGroup, Input, Textarea, Label } from "@/components/ui/Field";
import { Turnstile } from "@/components/Turnstile";
import { VisionPreview } from "@/components/devis/VisionPreview";
import { estimate } from "@/lib/quote";
import {
  SITE_TYPES, BUDGETS, OBJECTIFS, STYLES_VISUELS, CONTENU_TYPES, PHOTOS_STATES,
  LOGO_STATE, COULEURS_PRESETS,
  PACK_UNDECIDED, PAGES_UNLIMITED, MODULE_GROUPS,
  resolveCatalog, type CatalogOverrides,
} from "@/lib/devis";

const STEPS = [
  "Projet",
  "Formule",
  "Pages & contenu",
  "Fonctionnalités",
  "Mise en ligne",
  "Maintenance",
  "Style & vision",
  "Coordonnées",
];
const LAST = STEPS.length - 1;
const EASE = [0.22, 1, 0.36, 1] as const;

const MODULE_ICONS: Record<string, LucideIcon> = {
  Image: ImageIcon, Newspaper, Languages, PenTool, Sparkles, Palette, Mail,
  ClipboardList, CalendarCheck, CalendarClock, Send, MessageCircle, Star,
  CreditCard, ShoppingCart, LogIn, FileText, LayoutDashboard, BarChart3,
  CalendarDays, Users, ScrollText, Search, TrendingUp, MapPin, Gauge, Zap, Rocket,
};

const euro = (n: number) => n.toLocaleString("fr-FR") + " €";

/* ------------------------------------------------------------------ */
/*  Petits composants d'interface                                      */
/* ------------------------------------------------------------------ */

/** Puce de sélection unique (radio stylisé). */
function Choice({
  value, current, onChange, className = "",
}: { value: string; current: string; onChange: (v: string) => void; className?: string }) {
  const active = current === value;
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => onChange(value)}
      className={`rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium transition-all duration-300 ${
        active
          ? "border-vanyo-500/70 bg-vanyo-500/15 text-white"
          : "border-white/10 bg-white/[0.02] text-white/60 hover:border-white/25"
      } ${className}`}
    >
      {value}
    </button>
  );
}

/**
 * Puce de sélection multiple. Un même projet peut relever de plusieurs types
 * (un restaurant qui vend aussi en ligne) ou viser plusieurs objectifs.
 */
function MultiChoice({
  value, selected, onToggle,
}: { value: string; selected: string[]; onToggle: (v: string) => void }) {
  const active = selected.includes(value);
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => onToggle(value)}
      className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium transition-all duration-300 ${
        active
          ? "border-vanyo-500/70 bg-vanyo-500/15 text-white"
          : "border-white/10 bg-white/[0.02] text-white/60 hover:border-white/25"
      }`}
    >
      <span
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
          active ? "border-vanyo-400 bg-vanyo-500" : "border-white/25"
        }`}
      >
        {active && <Check className="h-3 w-3 text-white" />}
      </span>
      <span className="min-w-0">{value}</span>
    </button>
  );
}

/** Carte de sélection riche (formule, mise en ligne, maintenance). */
function OptionCard({
  active, onClick, title, price, description, features, badge, disabled,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  price: string;
  description?: string;
  features?: string[];
  badge?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={active}
      onClick={onClick}
      className={`relative flex w-full flex-col rounded-2xl border p-4 text-left transition-all duration-300 disabled:opacity-40 ${
        active
          ? "border-vanyo-500/70 bg-vanyo-500/10 shadow-glow"
          : "border-white/10 bg-white/[0.02] hover:border-white/25"
      }`}
    >
      {badge && (
        <span className="absolute -top-2.5 left-4 rounded-full bg-gradient-to-r from-vanyo-500 to-violet-hi px-2.5 py-0.5 text-[11px] font-semibold text-white">
          {badge}
        </span>
      )}
      <div className="flex items-start justify-between gap-3">
        <span className="text-base font-semibold text-white">{title}</span>
        <span className={`shrink-0 text-sm font-semibold ${active ? "text-vanyo-200" : "text-white/70"}`}>{price}</span>
      </div>
      {description && <span className="mt-1 text-sm leading-snug text-white/50">{description}</span>}
      {features && features.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-[13px] leading-snug text-white/65">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-vanyo-400" />
              {f}
            </li>
          ))}
        </ul>
      )}
      <span
        className={`mt-3 inline-flex items-center gap-1.5 self-start rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
          active ? "bg-vanyo-500 text-white" : "bg-white/8 text-white/55"
        }`}
      >
        {active ? <><Check className="h-3.5 w-3.5" /> Sélectionné</> : "Choisir"}
      </span>
    </button>
  );
}

/** Case à cocher en ligne, avec prix à droite. */
function ToggleRow({
  active, onClick, title, description, price, included, icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  description?: string;
  price: string;
  included?: boolean;
  icon?: LucideIcon;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      disabled={included}
      className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all duration-300 ${
        included
          ? "border-emerald-500/30 bg-emerald-500/[0.07]"
          : active
            ? "border-vanyo-500/70 bg-vanyo-500/12"
            : "border-white/10 bg-white/[0.02] hover:border-white/25"
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
          included ? "border-emerald-400 bg-emerald-500" : active ? "border-vanyo-400 bg-vanyo-500" : "border-white/25"
        }`}
      >
        {(active || included) && <Check className="h-3.5 w-3.5 text-white" />}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          {Icon && <Icon className={`h-4 w-4 shrink-0 ${included ? "text-emerald-300" : "text-vanyo-300"}`} />}
          <span className="text-sm font-medium text-white">{title}</span>
        </span>
        {description && <span className="mt-0.5 block text-xs leading-snug text-white/45">{description}</span>}
      </span>

      <span
        className={`shrink-0 text-xs font-semibold ${
          included ? "text-emerald-300" : active ? "text-vanyo-200" : "text-white/45"
        }`}
      >
        {included ? "Inclus" : price}
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Formulaire                                                         */
/* ------------------------------------------------------------------ */

export function DevisForm({
  turnstileKey, catalogOverrides, discount,
}: {
  turnstileKey?: string | null;
  /** Tarifs personnalisés depuis Paramètres → Tarifs. */
  catalogOverrides?: CatalogOverrides | null;
  /** Remise en cours sur le site (promo globale), appliquée à l'estimation. */
  discount?: { percent: number; label: string } | null;
}) {
  const catalog = useMemo(() => resolveCatalog(catalogOverrides), [catalogOverrides]);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [showDetail, setShowDetail] = useState(false);

  // Code promo éventuellement transmis depuis la page Tarifs (/devis?promo=CODE).
  const promo = (useSearchParams().get("promo") ?? "").toUpperCase().slice(0, 40);

  const cardRef = useRef<HTMLDivElement>(null);

  // Étape 1 — Projet (types et objectifs sont multi-sélection)
  const [typesSite, setTypesSite] = useState<string[]>([]);
  const [objectifs, setObjectifs] = useState<string[]>([]);
  const [siteExistant, setSiteExistant] = useState("");
  const [budget, setBudget] = useState("");

  // Étape 2 — Formule
  const [pack, setPack] = useState("");

  // Étape 3 — Pages & contenu
  const [pages, setPages] = useState(5);
  const [contenuType, setContenuType] = useState("");
  const [photos, setPhotos] = useState("");
  const [logo, setLogo] = useState("");
  const [charte, setCharte] = useState("");

  // Étape 4 — Fonctionnalités
  const [modules, setModules] = useState<string[]>([]);

  // Étape 5 — Mise en ligne
  const [deploiement, setDeploiement] = useState("");
  const [delai, setDelai] = useState("standard");

  // Étape 6 — Maintenance
  const [maintenance, setMaintenance] = useState("");
  const [maintenanceOptions, setMaintenanceOptions] = useState<string[]>([]);

  // Étape 7 — Style & vision
  const [styleVisuel, setStyleVisuel] = useState("");
  const [couleur, setCouleur] = useState("#6D4AFF");
  const [couleurLibre, setCouleurLibre] = useState("");

  // Étape 8 — Coordonnées (nom de l'entreprise piloté pour l'aperçu)
  const [entreprise, setEntreprise] = useState("");

  /* ---------------------------------------------------------------- */
  /*  Estimation en direct                                            */
  /* ---------------------------------------------------------------- */

  const quote = useMemo(
    () =>
      estimate(
        {
          pack: pack || null,
          typesSite,
          pages,
          modules,
          deploiement,
          maintenance,
          maintenanceOptions,
          delai,
          budget,
          discountPercent: discount?.percent ?? 0,
          discountLabel: discount?.label ?? null,
        },
        catalog
      ),
    [pack, typesSite, pages, modules, deploiement, maintenance, maintenanceOptions, delai, budget, discount, catalog]
  );

  const activePack = catalog.packsByKey[quote.packKey];
  const includedInPack = useCallback(
    (key: string) => !!activePack?.includes.includes(key),
    [activePack]
  );

  const extraPages =
    activePack && activePack.pagesIncluded < PAGES_UNLIMITED
      ? Math.max(0, pages - activePack.pagesIncluded)
      : 0;

  const vision = useMemo(
    () => ({
      siteName: entreprise,
      typesSite,
      objectifs,
      styleVisuel,
      couleurs: couleurLibre.trim() ? `${couleurLibre} ${couleur}` : couleur,
      pages,
      modules: [...modules, ...(activePack?.includes ?? [])],
    }),
    [entreprise, typesSite, objectifs, styleVisuel, couleur, couleurLibre, pages, modules, activePack]
  );

  /* ---------------------------------------------------------------- */
  /*  Navigation entre étapes                                         */
  /* ---------------------------------------------------------------- */

  /**
   * Remonte en haut du formulaire à chaque changement d'étape.
   * Sans cela, sur mobile, on arrive au milieu de l'étape suivante et on rate
   * la moitié des options — c'était le principal défaut du parcours.
   *
   * On vise le haut du formulaire (pas le haut de la page) et on tente
   * plusieurs mécanismes : selon le navigateur et la mise en page, le bloc qui
   * défile est tantôt la fenêtre, tantôt <html>, tantôt <body>. On termine par
   * scrollIntoView, qui trouve le bon conteneur tout seul.
   */
  const scrollToForm = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior: ScrollBehavior = reduce ? "auto" : "smooth";
    const OFFSET = 92; // hauteur de l'en-tête fixe
    const currentTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const target = Math.max(0, el.getBoundingClientRect().top + currentTop - OFFSET);

    try {
      window.scrollTo({ top: target, behavior });
    } catch {
      window.scrollTo(0, target);
    }

    // Si rien n'a bougé au prochain rendu, on réessaie autrement.
    requestAnimationFrame(() => {
      const moved = Math.abs((window.scrollY || document.documentElement.scrollTop || 0) - target) < 4;
      if (moved) return;
      document.documentElement.scrollTop = target;
      document.body.scrollTop = target;
      if (Math.abs(el.getBoundingClientRect().top - OFFSET) > 8) {
        el.scrollIntoView({ behavior, block: "start" });
      }
    });
  }, []);

  const goTo = useCallback(
    (target: number) => {
      const next = Math.max(0, Math.min(LAST, target));
      setDirection(next > step ? 1 : -1);
      setStep(next);
      setError("");
      // Sur le rendu suivant, une fois la nouvelle étape en place.
      requestAnimationFrame(scrollToForm);
    },
    [step, scrollToForm]
  );

  // Blocages doux : on n'avance pas sans les réponses structurantes.
  const blocked =
    (step === 0 && typesSite.length === 0) ||
    (step === 1 && !pack) ||
    (step === 4 && !deploiement) ||
    (step === 5 && !maintenance);

  const blockedMessage =
    step === 0
      ? "Choisissez au moins un type de site pour continuer."
      : step === 1
        ? "Choisissez une formule (ou « Conseillez-moi »)."
        : step === 4
          ? "Indiquez comment vous souhaitez mettre le site en ligne."
          : "Choisissez une formule de maintenance (« Aucune » est un choix valable).";

  function next() {
    if (blocked) {
      setError(blockedMessage);
      return;
    }
    goTo(step + 1);
  }

  const toggle = (list: string[], setList: (v: string[]) => void, key: string) =>
    setList(list.includes(key) ? list.filter((k) => k !== key) : [...list, key]);

  /* ---------------------------------------------------------------- */
  /*  Envoi                                                           */
  /* ---------------------------------------------------------------- */

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const fd = new FormData(e.currentTarget);

    const payload = {
      // Coordonnées
      nom: fd.get("nom"),
      prenom: fd.get("prenom"),
      entreprise,
      email: fd.get("email"),
      telephone: fd.get("telephone"),
      adresse: fd.get("adresse"),
      ville: fd.get("ville"),
      code_postal: fd.get("code_postal"),
      pays: fd.get("pays"),
      // Projet
      types_site: typesSite,
      objectifs,
      site_existant: siteExistant,
      lien_actuel: fd.get("lien_actuel"),
      budget,
      // Configuration chiffrée
      formule: pack,
      pages_total: pages,
      modules,
      deploiement,
      maintenance,
      maintenance_options: maintenanceOptions,
      delai,
      estimation: quote.surDevis ? null : quote.total,
      estimation_mensuelle: quote.monthly,
      // Contenu
      contenu_type: contenuType,
      a_des_photos: photos,
      langues: fd.get("langues"),
      logo,
      charte_graphique: charte,
      // Style
      style_visuel: styleVisuel,
      couleurs_souhaitees: couleurLibre.trim() ? `${couleurLibre} (${couleur})` : couleur,
      ambiance: fd.get("ambiance"),
      inspirations: fd.get("inspirations"),
      concurrents: fd.get("concurrents"),
      public_cible: fd.get("public_cible"),
      // Finalisation
      date_souhaitee: fd.get("date_souhaitee"),
      description: fd.get("description"),
      promo,
      rgpd: fd.get("rgpd") === "on",
      turnstileToken: token,
    };

    if (!payload.rgpd) {
      setError("Merci d'accepter le traitement de vos données (RGPD).");
      setStatus("error");
      return;
    }

    try {
      const res = await fetch("/api/devis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Erreur lors de l'envoi.");
      setStatus("ok");
      requestAnimationFrame(scrollToForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setStatus("error");
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Écran de confirmation                                           */
  /* ---------------------------------------------------------------- */

  if (status === "ok") {
    return (
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center sm:p-10"
      >
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400" />
        <h3 className="mt-5 text-xl font-semibold text-white sm:text-2xl">Demande envoyée !</h3>
        <p className="mx-auto mt-3 max-w-md text-sm text-white/60 sm:text-base">
          Merci pour votre confiance. Nous avons déjà une vision claire de votre projet et revenons
          vers vous sous quelques heures avec une proposition détaillée.
        </p>

        {!quote.surDevis && (
          <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-wide text-white/40">Estimation transmise</p>
            <p className="mt-1 text-2xl font-bold text-white">{euro(quote.total)}</p>
            {quote.monthly > 0 && (
              <p className="text-sm text-white/55">puis {euro(quote.monthly)} / mois de maintenance</p>
            )}
          </div>
        )}

        <div className="mt-7 text-left">
          <p className="mb-3 text-center text-sm text-white/55">
            Voici l&apos;aperçu que nous avons généré à partir de vos réponses — gardez-le, il servira de base
            à notre première maquette.
          </p>
          <VisionPreview vision={vision} />
        </div>
      </motion.div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Rendu                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div ref={cardRef} className="gradient-border scroll-mt-24 rounded-3xl bg-ink-card/60 p-4 sm:p-8">
      {/* ---------- Progression ---------- */}
      <div className="mb-6">
        {/* Mobile : libellé + barre */}
        <div className="sm:hidden">
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-sm font-semibold text-white">{STEPS[step]}</span>
            <span className="shrink-0 text-xs text-white/45">{step + 1} / {STEPS.length}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-vanyo-500 to-violet-hi"
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.5, ease: EASE }}
            />
          </div>
        </div>

        {/* Desktop : pastilles cliquables vers les étapes déjà vues */}
        <div className="hidden items-start justify-between sm:flex">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center">
              <button
                type="button"
                onClick={() => i < step && goTo(i)}
                disabled={i >= step}
                className="flex flex-col items-center gap-1.5 disabled:cursor-default"
              >
                <motion.span
                  animate={{ scale: i === step ? 1.08 : 1 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-500 ${
                    i <= step ? "bg-gradient-to-br from-vanyo-500 to-violet-hi text-white" : "bg-white/8 text-white/40"
                  }`}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </motion.span>
                <span
                  className={`max-w-[80px] text-center text-[10px] leading-tight transition-colors duration-500 ${
                    i <= step ? "text-white/70" : "text-white/35"
                  }`}
                >
                  {s}
                </span>
              </button>
              {i < LAST && (
                <div className="mx-1.5 mt-4 h-0.5 flex-1 self-start overflow-hidden rounded bg-white/10">
                  <motion.div
                    className="h-full bg-vanyo-500"
                    animate={{ scaleX: i < step ? 1 : 0 }}
                    style={{ transformOrigin: "left" }}
                    transition={{ duration: 0.5, ease: EASE }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ---------- Estimation en direct ---------- */}
      {step >= 1 && (
        <div className="mb-6 overflow-hidden rounded-2xl border border-vanyo-500/30 bg-gradient-to-r from-vanyo-500/12 to-violet-hi/8">
          <button
            type="button"
            onClick={() => setShowDetail((v) => !v)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left"
          >
            <Wand2 className="h-4 w-4 shrink-0 text-vanyo-300" />
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] uppercase tracking-wide text-white/45">
                Estimation en direct
              </span>
              <span className="block truncate text-lg font-bold leading-tight text-white">
                {quote.surDevis ? "Sur devis" : euro(quote.total)}
                {!quote.surDevis && quote.discountPercent > 0 && (
                  <span className="ml-2 text-sm font-medium text-white/40 line-through">{euro(quote.subtotal)}</span>
                )}
                {quote.monthly > 0 && (
                  <span className="text-sm font-medium text-white/60"> + {euro(quote.monthly)}/mois</span>
                )}
              </span>
              {!quote.surDevis && quote.discountPercent > 0 && (
                <span className="mt-0.5 block truncate text-xs font-medium text-emerald-300">
                  {quote.discountLabel} · −{quote.discountPercent} %, soit {euro(quote.saved)} économisés
                </span>
              )}
            </span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-white/50 transition-transform duration-300 ${showDetail ? "rotate-180" : ""}`}
            />
          </button>

          {showDetail && (
            <div className="border-t border-white/10 px-4 py-3 text-sm">
              {quote.surDevis ? (
                <p className="text-white/60">
                  Un projet sur mesure se chiffre après un échange : nous étudions votre besoin et
                  revenons avec une proposition détaillée.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {quote.lines.map((l, i) => (
                    <li key={`${l.label}-${i}`} className="flex justify-between gap-4 text-white/60">
                      <span className="min-w-0">{l.label}</span>
                      <span className="shrink-0 text-white/80">{euro(l.amount)}</span>
                    </li>
                  ))}
                  <li className="flex justify-between gap-4 border-t border-white/10 pt-2 text-white/70">
                    <span>Sous-total</span>
                    <span>{euro(quote.subtotal)}</span>
                  </li>
                  {quote.discountPercent > 0 && (
                    <li className="flex justify-between gap-4 text-emerald-300">
                      <span>{quote.discountLabel} (−{quote.discountPercent} %)</span>
                      <span>−{euro(quote.saved)}</span>
                    </li>
                  )}
                  <li className="flex justify-between gap-4 border-t border-white/10 pt-2 font-semibold text-white">
                    <span>Total création</span>
                    <span>{euro(quote.total)}</span>
                  </li>
                </ul>
              )}

              {quote.monthlyLines.length > 0 && (
                <ul className="mt-3 space-y-1.5 border-t border-white/10 pt-3">
                  {quote.monthlyLines.map((l, i) => (
                    <li key={`${l.label}-${i}`} className="flex justify-between gap-4 text-white/60">
                      <span className="min-w-0">{l.label}</span>
                      <span className="shrink-0 text-white/80">{euro(l.amount)}/mois</span>
                    </li>
                  ))}
                  <li className="flex justify-between gap-4 border-t border-white/10 pt-2 font-semibold text-white">
                    <span>Total mensuel</span>
                    <span>{euro(quote.monthly)}/mois</span>
                  </li>
                </ul>
              )}

              {quote.packSuggested && !quote.surDevis && (
                <p className="mt-3 flex items-start gap-2 text-xs text-white/45">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Calculé sur la formule {activePack?.name}, celle qui correspond le mieux à vos réponses.
                </p>
              )}
              <p className="mt-2 text-xs text-white/35">
                Estimation indicative, hors taxes. Le devis final vous est confirmé après notre échange.
              </p>
            </div>
          )}
        </div>
      )}

      {promo && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-4 py-2.5">
          <Ticket className="h-4 w-4 shrink-0 text-emerald-400" />
          <span className="text-sm text-white">
            Code <span className="font-mono font-semibold text-emerald-300">{promo}</span> pris en compte —
            la remise sera appliquée sur votre devis.
          </span>
        </div>
      )}

      <form onSubmit={onSubmit}>
        {/* ============ ÉTAPE 1 — PROJET ============ */}
        <Pane active={step === 0} direction={direction}>
          <div className="space-y-6">
            <div>
              <Label required>Quel type de site souhaitez-vous ?</Label>
              <p className="-mt-0.5 mb-2 text-xs text-white/45">
                Plusieurs réponses possibles — un restaurant qui vend aussi en ligne, par exemple.
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {SITE_TYPES.map((t) => (
                  <MultiChoice
                    key={t}
                    value={t}
                    selected={typesSite}
                    onToggle={(v) => toggle(typesSite, setTypesSite, v)}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label>Quels sont vos objectifs ?</Label>
              <p className="-mt-0.5 mb-2 text-xs text-white/45">Plusieurs réponses possibles.</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {OBJECTIFS.map((o) => (
                  <MultiChoice
                    key={o}
                    value={o}
                    selected={objectifs}
                    onToggle={(v) => toggle(objectifs, setObjectifs, v)}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label>Avez-vous déjà un site ?</Label>
              <div className="grid grid-cols-2 gap-2 sm:max-w-xs">
                {["Oui", "Non"].map((t) => (
                  <Choice key={t} value={t} current={siteExistant} onChange={setSiteExistant} />
                ))}
              </div>
              {siteExistant === "Oui" && (
                <div className="mt-3">
                  <Input name="lien_actuel" placeholder="https://votre-site-actuel.fr" inputMode="url" />
                </div>
              )}
            </div>

            <div>
              <Label>Budget envisagé (facultatif)</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {BUDGETS.map((b) => (
                  <Choice key={b} value={b} current={budget} onChange={setBudget} />
                ))}
              </div>
            </div>
          </div>
        </Pane>

        {/* ============ ÉTAPE 2 — FORMULE ============ */}
        <Pane active={step === 1} direction={direction}>
          <div className="space-y-4">
            <p className="text-sm text-white/50">
              Choisissez la formule qui vous parle. Vous pourrez ajouter exactement ce qu&apos;il vous
              faut aux étapes suivantes — et le prix se met à jour en direct.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {catalog.packs.map((p) => (
                <OptionCard
                  key={p.key}
                  active={pack === p.key}
                  onClick={() => setPack(p.key)}
                  title={p.name}
                  price={p.base === null ? "Sur devis" : `dès ${euro(p.base)}`}
                  description={p.tagline}
                  badge={p.highlight ? "Le plus choisi" : undefined}
                  features={[
                    p.pagesIncluded >= PAGES_UNLIMITED ? "Pages illimitées" : `${p.pagesLabel} pages comprises`,
                    `${p.includes.length} modules compris`,
                    p.delai === "Sur mesure" ? "Délai défini avec vous" : `Livré en ${p.delai}`,
                    p.support === "Dédié" ? "Accompagnement dédié" : `Support ${p.support}`,
                  ]}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setPack(PACK_UNDECIDED)}
              aria-pressed={pack === PACK_UNDECIDED}
              className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-300 ${
                pack === PACK_UNDECIDED
                  ? "border-vanyo-500/70 bg-vanyo-500/10"
                  : "border-white/10 bg-white/[0.02] hover:border-white/25"
              }`}
            >
              <Sparkles className="h-5 w-5 shrink-0 text-vanyo-300" />
              <span>
                <span className="block text-sm font-semibold text-white">Je ne sais pas, conseillez-moi</span>
                <span className="block text-xs text-white/50">
                  On déduit la formule la plus adaptée à partir de vos réponses.
                </span>
              </span>
            </button>
          </div>
        </Pane>

        {/* ============ ÉTAPE 3 — PAGES & CONTENU ============ */}
        <Pane active={step === 2} direction={direction}>
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <Label>Combien de pages votre site doit-il compter ?</Label>
              <p className="-mt-0.5 mb-3 text-xs text-white/45">
                Accueil, Services, À propos, Contact… comptez une page par rubrique du menu.
              </p>

              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setPages((n) => Math.max(1, n - 1))}
                  disabled={pages <= 1}
                  className="glass flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white disabled:opacity-40"
                  aria-label="Retirer une page"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{pages}</div>
                  <div className="text-xs text-white/45">page{pages > 1 ? "s" : ""}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setPages((n) => Math.min(40, n + 1))}
                  className="glass flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
                  aria-label="Ajouter une page"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <input
                type="range"
                min={1}
                max={30}
                value={Math.min(pages, 30)}
                onChange={(e) => setPages(Number(e.target.value))}
                className="mt-4 w-full accent-vanyo-500"
                aria-label="Nombre de pages"
              />

              <p className="mt-3 text-sm">
                {activePack && activePack.pagesIncluded >= PAGES_UNLIMITED ? (
                  <span className="text-emerald-300">Toutes vos pages sont comprises dans la formule {activePack.name}.</span>
                ) : extraPages > 0 ? (
                  <span className="text-vanyo-200">
                    {activePack?.pagesIncluded} comprises dans la formule {activePack?.name} ·{" "}
                    <strong className="text-white">
                      {extraPages} en supplément (+{euro(extraPages * catalog.extraPagePrice)})
                    </strong>
                  </span>
                ) : (
                  <span className="text-emerald-300">
                    Comprises dans la formule {activePack?.name} (jusqu&apos;à {activePack?.pagesIncluded} pages).
                  </span>
                )}
              </p>
            </div>

            <div>
              <Label>Qui rédige les textes et fournit les images ?</Label>
              <div className="grid gap-2">
                {CONTENU_TYPES.map((c) => (
                  <Choice key={c} value={c} current={contenuType} onChange={setContenuType} />
                ))}
              </div>
            </div>

            <div>
              <Label>Avez-vous des photos exploitables ?</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {PHOTOS_STATES.map((p) => (
                  <Choice key={p} value={p} current={photos} onChange={setPhotos} />
                ))}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label>Avez-vous un logo ?</Label>
                <div className="grid grid-cols-3 gap-2">
                  {LOGO_STATE.map((t) => (
                    <Choice key={t} value={t} current={logo} onChange={setLogo} />
                  ))}
                </div>
              </div>
              <div>
                <Label>Avez-vous une charte graphique ?</Label>
                <div className="grid grid-cols-2 gap-2">
                  {["Oui", "Non"].map((t) => (
                    <Choice key={t} value={t} current={charte} onChange={setCharte} />
                  ))}
                </div>
              </div>
            </div>

            <FieldGroup label="Langues du site">
              <Input name="langues" placeholder="Ex : Français, ou Français + Anglais" />
            </FieldGroup>
          </div>
        </Pane>

        {/* ============ ÉTAPE 4 — FONCTIONNALITÉS ============ */}
        <Pane active={step === 3} direction={direction}>
          <div className="space-y-6">
            <p className="text-sm text-white/50">
              Ce qui est déjà compris dans la formule {activePack?.name} apparaît en vert. Le reste
              s&apos;ajoute au prix affiché en haut, en direct.
            </p>

            {MODULE_GROUPS.map((group) => {
              const items = catalog.modules.filter((m) => m.group === group);
              if (items.length === 0) return null;
              return (
                <div key={group}>
                  <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-white/40">{group}</h4>
                  <div className="grid gap-2 lg:grid-cols-2">
                    {items.map((m) => {
                      const included = includedInPack(m.key) || m.price === 0;
                      return (
                        <ToggleRow
                          key={m.key}
                          icon={MODULE_ICONS[m.icon]}
                          active={modules.includes(m.key)}
                          included={included}
                          onClick={() => toggle(modules, setModules, m.key)}
                          title={m.label}
                          description={m.description}
                          price={`+${euro(m.price)}`}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Pane>

        {/* ============ ÉTAPE 5 — MISE EN LIGNE ============ */}
        <Pane active={step === 4} direction={direction}>
          <div className="space-y-6">
            <div>
              <Label required>Comment souhaitez-vous mettre le site en ligne ?</Label>
              <p className="-mt-0.5 mb-3 text-xs text-white/45">
                L&apos;installation couvre le déploiement, la sécurisation HTTPS et la mise en service.
                Le nom de domaine (votre adresse .fr ou .com) est facturé en supplément.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {catalog.deploiements.map((d) => (
                  <OptionCard
                    key={d.key}
                    active={deploiement === d.key}
                    onClick={() => setDeploiement(d.key)}
                    title={d.label}
                    price={d.price === 0 ? "Offert" : `+${euro(d.price)}`}
                    description={d.description}
                    features={d.includes}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label>Quel délai vous convient ?</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {catalog.delais.map((d) => (
                  <OptionCard
                    key={d.key}
                    active={delai === d.key}
                    onClick={() => setDelai(d.key)}
                    title={d.label}
                    price={d.price === 0 ? "Compris" : `+${euro(d.price)}`}
                    description={
                      d.key === "standard" && activePack ? `${d.description} (${activePack.delai})` : d.description
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </Pane>

        {/* ============ ÉTAPE 6 — MAINTENANCE ============ */}
        <Pane active={step === 5} direction={direction}>
          <div className="space-y-6">
            <div>
              <Label required>Souhaitez-vous que l&apos;on s&apos;occupe du site après la mise en ligne ?</Label>
              <p className="-mt-0.5 mb-3 text-xs text-white/45">
                Sans engagement, résiliable à tout moment.
                {activePack && activePack.maintenanceOfferte > 0 && (
                  <span className="text-emerald-300">
                    {" "}Avec la formule {activePack.name}, les {activePack.maintenanceOfferte} premiers mois sont offerts.
                  </span>
                )}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {catalog.maintenancePlans.map((p) => (
                  <OptionCard
                    key={p.key}
                    active={maintenance === p.key}
                    onClick={() => {
                      setMaintenance(p.key);
                      if (p.price === 0) setMaintenanceOptions([]);
                    }}
                    title={p.label}
                    price={p.price === 0 ? "0 €" : `${euro(p.price)}/mois`}
                    description={p.description}
                    features={p.features}
                    badge={p.recommended ? "Recommandé" : undefined}
                  />
                ))}
              </div>
            </div>

            {maintenance && maintenance !== "aucune" && (
              <div>
                <Label>Suppléments mensuels (facultatif)</Label>
                <p className="-mt-0.5 mb-3 text-xs text-white/45">
                  Ajoutez uniquement ce dont vous avez besoin. Chaque option s&apos;ajoute à votre
                  mensualité et se retire quand vous voulez.
                </p>
                <div className="grid gap-2 lg:grid-cols-2">
                  {catalog.maintenanceOptions.map((o) => (
                    <ToggleRow
                      key={o.key}
                      active={maintenanceOptions.includes(o.key)}
                      onClick={() => toggle(maintenanceOptions, setMaintenanceOptions, o.key)}
                      title={o.label}
                      description={o.description}
                      price={`+${euro(o.price)}/mois`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Pane>

        {/* ============ ÉTAPE 7 — STYLE & VISION ============ */}
        <Pane active={step === 6} direction={direction}>
          <div className="space-y-6">
            <p className="text-sm text-white/50">
              L&apos;aperçu ci-dessous se construit en direct à partir de vos réponses. Ce n&apos;est pas
              la maquette finale, mais la direction que prendra votre site.
            </p>

            <div>
              <Label>Style visuel recherché</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {STYLES_VISUELS.map((s) => (
                  <Choice key={s} value={s} current={styleVisuel} onChange={setStyleVisuel} />
                ))}
              </div>
            </div>

            <div>
              <Label>Couleur principale</Label>
              <div className="flex flex-wrap gap-2">
                {COULEURS_PRESETS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCouleur(c.value)}
                    title={c.label}
                    aria-label={c.label}
                    aria-pressed={couleur === c.value}
                    className={`h-10 w-10 rounded-xl border-2 transition-transform duration-300 ${
                      couleur === c.value ? "scale-110 border-white" : "border-white/15 hover:scale-105"
                    }`}
                    style={{ background: c.value }}
                  />
                ))}
                <label
                  className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border-2 border-white/15 px-3 text-xs text-white/60 transition-colors hover:border-white/35"
                  title="Choisir une couleur personnalisée"
                >
                  <Palette className="h-4 w-4" />
                  Autre
                  <input
                    type="color"
                    value={couleur}
                    onChange={(e) => setCouleur(e.target.value)}
                    className="h-6 w-6 cursor-pointer border-0 bg-transparent p-0"
                  />
                </label>
              </div>
              <div className="mt-3">
                <Input
                  value={couleurLibre}
                  onChange={(e) => setCouleurLibre(e.target.value)}
                  placeholder="Précisez si besoin : « bleu nuit & doré », vos couleurs de marque…"
                />
              </div>
            </div>

            {/* Aperçu généré */}
            <div>
              <Label>Votre site, tel qu&apos;on l&apos;imagine</Label>
              <VisionPreview vision={vision} />
            </div>

            <FieldGroup label="Ambiance / émotion à transmettre">
              <Input name="ambiance" placeholder="Ex : confiance, luxe, convivialité, dynamisme…" />
            </FieldGroup>
            <FieldGroup label="Sites que vous aimez (inspirations)">
              <Textarea name="inspirations" rows={2} placeholder="Collez 1 à 3 liens de sites dont vous aimez le style" />
            </FieldGroup>
            <FieldGroup label="Vos concurrents (liens ou noms)">
              <Textarea name="concurrents" rows={2} placeholder="Pour nous démarquer et vous positionner au mieux" />
            </FieldGroup>
            <FieldGroup label="Votre clientèle cible">
              <Input name="public_cible" placeholder="Ex : particuliers 30-50 ans, professionnels, touristes…" />
            </FieldGroup>
          </div>
        </Pane>

        {/* ============ ÉTAPE 8 — COORDONNÉES & ENVOI ============ */}
        <Pane active={step === LAST} direction={direction}>
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldGroup label="Prénom" required>
                <Input name="prenom" required={step === LAST} placeholder="Jean" autoComplete="given-name" />
              </FieldGroup>
              <FieldGroup label="Nom" required>
                <Input name="nom" required={step === LAST} placeholder="Dupont" autoComplete="family-name" />
              </FieldGroup>
              <FieldGroup label="Entreprise" className="sm:col-span-2">
                <Input
                  value={entreprise}
                  onChange={(e) => setEntreprise(e.target.value)}
                  placeholder="Votre société — elle apparaîtra sur l'aperçu"
                  autoComplete="organization"
                />
              </FieldGroup>
              <FieldGroup label="Email" required>
                <Input name="email" type="email" required={step === LAST} placeholder="vous@email.com" autoComplete="email" inputMode="email" />
              </FieldGroup>
              <FieldGroup label="Téléphone">
                <Input name="telephone" type="tel" placeholder="06 00 00 00 00" autoComplete="tel" inputMode="tel" />
              </FieldGroup>
              <FieldGroup label="Adresse" className="sm:col-span-2">
                <Input name="adresse" placeholder="12 rue…" autoComplete="street-address" />
              </FieldGroup>
              <FieldGroup label="Ville">
                <Input name="ville" placeholder="Paris" autoComplete="address-level2" />
              </FieldGroup>
              <FieldGroup label="Code postal">
                <Input name="code_postal" placeholder="75008" autoComplete="postal-code" inputMode="numeric" />
              </FieldGroup>
              <FieldGroup label="Pays" className="sm:col-span-2">
                <Input name="pays" placeholder="France" defaultValue="France" autoComplete="country-name" />
              </FieldGroup>
            </div>

            {/* Récapitulatif */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/40">
                Récapitulatif de votre demande
              </h4>
              <dl className="space-y-1.5 text-sm">
                <Recap label="Type de site" value={typesSite.join(", ")} />
                <Recap label="Objectifs" value={objectifs.join(", ")} />
                <Recap label="Formule" value={activePack?.name} />
                <Recap label="Pages" value={`${pages}`} />
                <Recap
                  label="Modules ajoutés"
                  value={
                    modules.filter((m) => !includedInPack(m)).map((m) => catalog.modulesByKey[m]?.label).filter(Boolean).join(", ") ||
                    "Aucun (tout est compris)"
                  }
                />
                <Recap label="Mise en ligne" value={catalog.deploiements.find((d) => d.key === deploiement)?.label} />
                <Recap label="Maintenance" value={catalog.maintenancePlans.find((p) => p.key === maintenance)?.label} />
                <Recap label="Style" value={styleVisuel} />
              </dl>
              <div className="mt-3 flex items-baseline justify-between border-t border-white/10 pt-3">
                <span className="text-sm text-white/60">Estimation</span>
                <span className="text-right">
                  <span className="block text-xl font-bold text-white">
                    {quote.surDevis ? "Sur devis" : euro(quote.total)}
                  </span>
                  {quote.monthly > 0 && (
                    <span className="block text-xs text-white/55">puis {euro(quote.monthly)}/mois</span>
                  )}
                </span>
              </div>
            </div>

            <FieldGroup label="Date de mise en ligne souhaitée">
              <Input name="date_souhaitee" type="date" />
            </FieldGroup>
            <FieldGroup label="Un dernier mot sur votre projet ?" required>
              <Textarea
                name="description"
                required={step === LAST}
                rows={4}
                placeholder="Contexte, attentes particulières, contraintes…"
              />
            </FieldGroup>
            <FieldGroup label="Pièces jointes (images, PDF, logo…)">
              <Input
                name="attachments"
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-vanyo-500/20 file:px-3 file:py-1.5 file:text-vanyo-200"
              />
              <p className="mt-1.5 text-xs text-white/40">
                Vous pourrez aussi nous les transmettre par email après l&apos;envoi.
              </p>
            </FieldGroup>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-colors duration-300 hover:border-white/20">
              <input type="checkbox" name="rgpd" className="mt-1 h-4 w-4 shrink-0 accent-vanyo-500" />
              <span className="text-sm text-white/60">
                J&apos;accepte que mes données soient traitées par Vanyo dans le cadre de ma demande de
                devis, conformément à la politique de confidentialité. <span className="text-vanyo-400">*</span>
              </span>
            </label>

            <Turnstile siteKey={turnstileKey} onToken={setToken} />
          </div>
        </Pane>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-300"
          >
            {error}
          </motion.p>
        )}

        {/* ---------- Navigation ---------- */}
        <div className="mt-7 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => goTo(step - 1)}
            disabled={step === 0}
            className="btn-premium btn-ghost px-4 py-3 text-sm transition-opacity duration-300 disabled:pointer-events-none disabled:opacity-0 sm:px-5"
          >
            <ArrowLeft className="h-4 w-4" /> Précédent
          </button>

          {step < LAST ? (
            <button
              type="button"
              onClick={next}
              className="btn-premium btn-primary flex-1 px-5 py-3 text-sm sm:flex-none sm:px-6"
            >
              Continuer <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={status === "loading"}
              className="btn-premium btn-primary flex-1 px-5 py-3 text-sm disabled:opacity-70 sm:flex-none sm:px-6"
            >
              {status === "loading" ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Envoi…</>
              ) : (
                <>Envoyer ma demande <Send className="h-4 w-4" /></>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Pane({
  active, direction, children,
}: { active: boolean; direction: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: active ? 1 : 0, x: active ? 0 : direction * 20 }}
      transition={{ duration: 0.4, ease: EASE }}
      style={{ display: active ? "block" : "none", pointerEvents: active ? "auto" : "none" }}
      aria-hidden={!active}
    >
      {children}
    </motion.div>
  );
}

function Recap({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-white/45">{label}</dt>
      <dd className="min-w-0 text-right text-white/80">{value}</dd>
    </div>
  );
}
