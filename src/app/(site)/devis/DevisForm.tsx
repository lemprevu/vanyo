"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Loader2, ArrowRight, ArrowLeft, Send, Plus, Minus } from "lucide-react";
import { FieldGroup, Input, Textarea, Label } from "@/components/ui/Field";
import { Turnstile } from "@/components/Turnstile";
import {
  SITE_TYPES, FEATURES, BUDGETS, TRISTATE, LOGO_STATE,
  OBJECTIFS, STYLES_VISUELS, CONTENU_TYPES, OPTIONS_SUP,
} from "@/lib/devis";

const STEPS = [
  "Vos informations",
  "Votre projet",
  "Détails techniques",
  "Style & contenu",
  "Options",
  "Finalisation",
];
const LAST = STEPS.length - 1;
const EASE = [0.22, 1, 0.36, 1] as const;

/** Puce de sélection (radio stylisé). */
function Choice({
  name, value, current, onChange,
}: { name: string; value: string; current: string; onChange: (v: string) => void }) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
        active
          ? "border-vanyo-500/70 bg-vanyo-500/15 text-white"
          : "border-white/10 bg-white/[0.02] text-white/60 hover:border-white/25"
      }`}
    >
      {value}
      <input type="hidden" name={name} value={active ? value : ""} />
    </button>
  );
}

function StepPane({
  active, direction, children,
}: { active: boolean; direction: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: active ? 1 : 0, x: active ? 0 : direction * 24 }}
      transition={{ duration: 0.45, ease: EASE }}
      style={{ display: active ? "block" : "none", pointerEvents: active ? "auto" : "none" }}
    >
      {children}
    </motion.div>
  );
}

export function DevisForm({ turnstileKey }: { turnstileKey?: string | null }) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [error, setError] = useState("");
  const [token, setToken] = useState("");

  // Champs à choix contrôlés
  const [typeSite, setTypeSite] = useState("");
  const [siteExistant, setSiteExistant] = useState("");
  const [nomDomaine, setNomDomaine] = useState("");
  const [hebergement, setHebergement] = useState("");
  const [logo, setLogo] = useState("");
  const [charte, setCharte] = useState("");
  const [budget, setBudget] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  // Étape "Style & contenu"
  const [objectif, setObjectif] = useState("");
  const [styleVisuel, setStyleVisuel] = useState("");
  const [contenuType, setContenuType] = useState("");
  // Étape "Options"
  const [options, setOptions] = useState<string[]>([]);
  const [pagesSup, setPagesSup] = useState(0);

  const toggleFeature = (f: string) =>
    setFeatures((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  const toggleOption = (o: string) =>
    setOptions((prev) => (prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o]));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const fd = new FormData(e.currentTarget);
    const payload = {
      nom: fd.get("nom"),
      prenom: fd.get("prenom"),
      entreprise: fd.get("entreprise"),
      email: fd.get("email"),
      telephone: fd.get("telephone"),
      adresse: fd.get("adresse"),
      ville: fd.get("ville"),
      code_postal: fd.get("code_postal"),
      pays: fd.get("pays"),
      type_site: typeSite,
      nombre_pages: fd.get("nombre_pages"),
      site_existant: siteExistant,
      lien_actuel: fd.get("lien_actuel"),
      nom_domaine: nomDomaine,
      hebergement,
      logo,
      charte_graphique: charte,
      fonctionnalites: features,
      budget,
      // Style & contenu
      objectif,
      style_visuel: styleVisuel,
      ambiance: fd.get("ambiance"),
      couleurs_souhaitees: fd.get("couleurs_souhaitees"),
      inspirations: fd.get("inspirations"),
      concurrents: fd.get("concurrents"),
      public_cible: fd.get("public_cible"),
      contenu_type: contenuType,
      langues: fd.get("langues"),
      a_des_photos: fd.get("a_des_photos"),
      // Options
      options,
      pages_supplementaires: pagesSup,
      // Finalisation
      date_souhaitee: fd.get("date_souhaitee"),
      description: fd.get("description"),
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex flex-col items-center justify-center rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center sm:p-12"
      >
        <CheckCircle2 className="h-14 w-14 text-emerald-400" />
        <h3 className="mt-5 text-2xl font-semibold text-white">Demande envoyée !</h3>
        <p className="mt-3 max-w-md text-white/60">
          Merci pour votre confiance. Grâce à toutes vos réponses, nous avons déjà une vision claire
          de votre projet. Nous revenons vers vous sous quelques heures avec une proposition personnalisée.
        </p>
      </motion.div>
    );
  }

  const goTo = (target: number) => {
    setDirection(target > step ? 1 : -1);
    setStep(Math.max(0, Math.min(LAST, target)));
  };
  const next = () => goTo(step + 1);
  const prev = () => goTo(step - 1);

  return (
    <div className="gradient-border rounded-3xl bg-ink-card/60 p-5 sm:p-9">
      {/* Progression — compacte sur mobile, complète sur desktop */}
      <div className="mb-7 sm:mb-8">
        {/* Mobile : libellé + barre */}
        <div className="sm:hidden">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-white">{STEPS[step]}</span>
            <span className="text-white/45">Étape {step + 1} / {STEPS.length}</span>
          </div>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-vanyo-500 to-violet-hi"
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.5, ease: EASE }}
            />
          </div>
        </div>

        {/* Desktop : pastilles */}
        <div className="hidden items-center justify-between sm:flex">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <motion.div
                  animate={{ scale: i === step ? 1.08 : 1 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-500 ${
                    i <= step ? "bg-gradient-to-br from-vanyo-500 to-violet-hi text-white" : "bg-white/8 text-white/40"
                  }`}
                >
                  {i < step ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                </motion.div>
                <span className={`mt-2 text-[11px] transition-colors duration-500 ${i <= step ? "text-white/70" : "text-white/35"}`}>
                  {s}
                </span>
              </div>
              {i < LAST && (
                <div className="mx-2 h-0.5 flex-1 overflow-hidden rounded bg-white/10">
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

      <form onSubmit={onSubmit}>
        <div className="relative overflow-hidden">
          {/* ÉTAPE 1 — Informations */}
          <StepPane active={step === 0} direction={direction}>
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldGroup label="Prénom" required><Input name="prenom" required={step === 0} placeholder="Jean" /></FieldGroup>
              <FieldGroup label="Nom" required><Input name="nom" required={step === 0} placeholder="Dupont" /></FieldGroup>
              <FieldGroup label="Entreprise"><Input name="entreprise" placeholder="Votre société" /></FieldGroup>
              <FieldGroup label="Téléphone"><Input name="telephone" type="tel" placeholder="06 00 00 00 00" /></FieldGroup>
              <FieldGroup label="Email" required><Input name="email" type="email" required={step === 0} placeholder="vous@email.com" /></FieldGroup>
              <FieldGroup label="Adresse"><Input name="adresse" placeholder="12 rue…" /></FieldGroup>
              <FieldGroup label="Ville"><Input name="ville" placeholder="Paris" /></FieldGroup>
              <FieldGroup label="Code postal"><Input name="code_postal" placeholder="75008" /></FieldGroup>
              <FieldGroup label="Pays" className="sm:col-span-2"><Input name="pays" placeholder="France" defaultValue="France" /></FieldGroup>
            </div>
          </StepPane>

          {/* ÉTAPE 2 — Projet */}
          <StepPane active={step === 1} direction={direction}>
            <div className="space-y-6">
              <div>
                <Label required>Type de site</Label>
                <div className="flex flex-wrap gap-2">
                  {SITE_TYPES.map((t) => (
                    <Choice key={t} name="type_site_pick" value={t} current={typeSite} onChange={setTypeSite} />
                  ))}
                </div>
              </div>
              <div>
                <Label>Objectif principal du site</Label>
                <div className="flex flex-wrap gap-2">
                  {OBJECTIFS.map((o) => (
                    <Choice key={o} name="objectif_pick" value={o} current={objectif} onChange={setObjectif} />
                  ))}
                </div>
              </div>
              <FieldGroup label="Nombre de pages estimé">
                <Input name="nombre_pages" placeholder="Ex : 5 pages (Accueil, Services, À propos, Contact…)" />
              </FieldGroup>
              <div>
                <Label>Possédez-vous déjà un site ?</Label>
                <div className="flex flex-wrap gap-2">
                  {["Oui", "Non"].map((t) => (
                    <Choice key={t} name="site_existant_pick" value={t} current={siteExistant} onChange={setSiteExistant} />
                  ))}
                </div>
                {siteExistant === "Oui" && (
                  <div className="mt-3">
                    <Input name="lien_actuel" placeholder="https://votre-site-actuel.fr" />
                  </div>
                )}
              </div>
              <FieldGroup label="Budget envisagé">
                <div className="flex flex-wrap gap-2">
                  {BUDGETS.map((b) => (
                    <Choice key={b} name="budget_pick" value={b} current={budget} onChange={setBudget} />
                  ))}
                </div>
              </FieldGroup>
            </div>
          </StepPane>

          {/* ÉTAPE 3 — Technique */}
          <StepPane active={step === 2} direction={direction}>
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <Label>Nom de domaine ?</Label>
                  <div className="flex flex-wrap gap-2">
                    {TRISTATE.map((t) => (
                      <Choice key={t} name="dom_pick" value={t} current={nomDomaine} onChange={setNomDomaine} />
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Hébergement ?</Label>
                  <div className="flex flex-wrap gap-2">
                    {TRISTATE.map((t) => (
                      <Choice key={t} name="heb_pick" value={t} current={hebergement} onChange={setHebergement} />
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Logo ?</Label>
                  <div className="flex flex-wrap gap-2">
                    {LOGO_STATE.map((t) => (
                      <Choice key={t} name="logo_pick" value={t} current={logo} onChange={setLogo} />
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Charte graphique ?</Label>
                  <div className="flex flex-wrap gap-2">
                    {["Oui", "Non"].map((t) => (
                      <Choice key={t} name="charte_pick" value={t} current={charte} onChange={setCharte} />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label>Fonctionnalités souhaitées</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {FEATURES.map((f) => {
                    const active = features.includes(f);
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => toggleFeature(f)}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all duration-300 ${
                          active ? "border-vanyo-500/70 bg-vanyo-500/15 text-white" : "border-white/10 text-white/60 hover:border-white/25"
                        }`}
                      >
                        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors duration-300 ${active ? "border-vanyo-400 bg-vanyo-500" : "border-white/25"}`}>
                          {active && <CheckCircle2 className="h-3 w-3 text-white" />}
                        </span>
                        {f}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </StepPane>

          {/* ÉTAPE 4 — Style & contenu (questionnaire détaillé) */}
          <StepPane active={step === 3} direction={direction}>
            <div className="space-y-6">
              <p className="text-sm text-white/50">
                Ces détails nous permettent de démarrer votre site sur de bonnes bases, sans allers-retours inutiles.
              </p>
              <div>
                <Label>Style visuel recherché</Label>
                <div className="flex flex-wrap gap-2">
                  {STYLES_VISUELS.map((s) => (
                    <Choice key={s} name="style_pick" value={s} current={styleVisuel} onChange={setStyleVisuel} />
                  ))}
                </div>
              </div>
              <FieldGroup label="Couleurs souhaitées">
                <Input name="couleurs_souhaitees" placeholder="Ex : bleu nuit & doré, ou vos couleurs de marque" />
              </FieldGroup>
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
              <div>
                <Label>Contenu (textes & images)</Label>
                <div className="flex flex-wrap gap-2">
                  {CONTENU_TYPES.map((c) => (
                    <Choice key={c} name="contenu_pick" value={c} current={contenuType} onChange={setContenuType} />
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldGroup label="Avez-vous des photos de qualité ?">
                  <Input name="a_des_photos" placeholder="Oui / Non / À prévoir" />
                </FieldGroup>
                <FieldGroup label="Langues du site">
                  <Input name="langues" placeholder="Ex : Français, ou Français + Anglais" />
                </FieldGroup>
              </div>
            </div>
          </StepPane>

          {/* ÉTAPE 5 — Options supplémentaires */}
          <StepPane active={step === 4} direction={direction}>
            <div className="space-y-4">
              <p className="text-sm text-white/50">
                Options facultatives pour aller plus loin. Sélectionnez ce qui vous intéresse — le tarif final vous sera confirmé dans le devis.
              </p>
              <div className="space-y-2.5">
                {OPTIONS_SUP.map((opt) => {
                  const active = options.includes(opt.key);
                  const isCounter = "counter" in opt && opt.counter;
                  return (
                    <div
                      key={opt.key}
                      className={`flex flex-col gap-3 rounded-2xl border p-4 transition-colors duration-300 sm:flex-row sm:items-center sm:justify-between ${
                        active || (isCounter && pagesSup > 0)
                          ? "border-vanyo-500/60 bg-vanyo-500/10"
                          : "border-white/10 bg-white/[0.02]"
                      }`}
                    >
                      <div>
                        <div className="font-medium text-white">{opt.key}</div>
                        <div className="text-sm text-vanyo-200">{opt.price}</div>
                      </div>

                      {isCounter ? (
                        <div className="flex items-center gap-3 self-start sm:self-auto">
                          <button
                            type="button"
                            onClick={() => setPagesSup((n) => Math.max(0, n - 1))}
                            className="glass flex h-9 w-9 items-center justify-center rounded-lg text-white disabled:opacity-40"
                            disabled={pagesSup === 0}
                            aria-label="Retirer une page"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-6 text-center font-semibold text-white">{pagesSup}</span>
                          <button
                            type="button"
                            onClick={() => setPagesSup((n) => n + 1)}
                            className="glass flex h-9 w-9 items-center justify-center rounded-lg text-white"
                            aria-label="Ajouter une page"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleOption(opt.key)}
                          className={`self-start rounded-xl border px-4 py-2 text-sm font-medium transition-all sm:self-auto ${
                            active ? "border-vanyo-500/70 bg-vanyo-500 text-white" : "border-white/15 text-white/70 hover:border-white/30"
                          }`}
                        >
                          {active ? "✓ Ajouté" : "Ajouter"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </StepPane>

          {/* ÉTAPE 6 — Finalisation */}
          <StepPane active={step === LAST} direction={direction}>
            <div className="space-y-5">
              <FieldGroup label="Date de mise en ligne souhaitée">
                <Input name="date_souhaitee" type="date" />
              </FieldGroup>
              <FieldGroup label="Un dernier mot sur votre projet ?" required>
                <Textarea
                  name="description"
                  required={step === LAST}
                  rows={5}
                  placeholder="Tout ce que vous souhaitez ajouter : contexte, attentes particulières, contraintes…"
                />
              </FieldGroup>
              <FieldGroup label="Pièces jointes (images, PDF, logo…)">
                <Input name="attachments" type="file" multiple accept="image/*,.pdf,.doc,.docx" className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-vanyo-500/20 file:px-3 file:py-1.5 file:text-vanyo-200" />
                <p className="mt-1.5 text-xs text-white/40">
                  Vous pourrez aussi nous les transmettre par email après l'envoi.
                </p>
              </FieldGroup>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-colors duration-300 hover:border-white/20">
                <input type="checkbox" name="rgpd" className="mt-1 h-4 w-4 shrink-0 accent-vanyo-500" />
                <span className="text-sm text-white/60">
                  J'accepte que mes données soient traitées par Vanyo dans le cadre de ma demande de devis,
                  conformément à la politique de confidentialité. <span className="text-vanyo-400">*</span>
                </span>
              </label>

              <Turnstile siteKey={turnstileKey} onToken={setToken} />
            </div>
          </StepPane>
        </div>

        {status === "error" && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-300"
          >
            {error}
          </motion.p>
        )}

        {/* Navigation */}
        <div className="mt-7 flex items-center justify-between gap-3 sm:mt-8">
          <button
            type="button"
            onClick={prev}
            disabled={step === 0}
            className="btn-premium btn-ghost px-4 py-3 text-sm transition-opacity duration-300 disabled:opacity-0 sm:px-5"
          >
            <ArrowLeft className="h-4 w-4" /> Précédent
          </button>

          {step < LAST ? (
            <button type="button" onClick={next} className="btn-premium btn-primary px-5 py-3 text-sm sm:px-6">
              Continuer <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={status === "loading"}
              className="btn-premium btn-primary px-5 py-3 text-sm disabled:opacity-70 sm:px-6"
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
