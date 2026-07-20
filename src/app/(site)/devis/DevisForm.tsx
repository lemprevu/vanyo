"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Loader2, ArrowRight, ArrowLeft, Send } from "lucide-react";
import { FieldGroup, Input, Textarea, Label } from "@/components/ui/Field";
import {
  SITE_TYPES, FEATURES, BUDGETS, TRISTATE, LOGO_STATE,
} from "@/lib/devis";

const STEPS = ["Vos informations", "Votre projet", "Détails techniques", "Finalisation"];
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

/**
 * Wrapper d'étape : le contenu reste TOUJOURS monté (pour préserver les
 * valeurs saisies quand on navigue entre étapes), la visibilité est fixée
 * de façon synchrone via `display`/`pointerEvents` — jamais dépendante de
 * la fin d'une animation. L'effet de glissement est purement décoratif.
 */
function StepPane({
  active,
  direction,
  children,
}: {
  active: boolean;
  direction: number;
  children: React.ReactNode;
}) {
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

export function DevisForm() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [error, setError] = useState("");

  // Champs à choix contrôlés
  const [typeSite, setTypeSite] = useState("");
  const [siteExistant, setSiteExistant] = useState("");
  const [nomDomaine, setNomDomaine] = useState("");
  const [hebergement, setHebergement] = useState("");
  const [logo, setLogo] = useState("");
  const [charte, setCharte] = useState("");
  const [budget, setBudget] = useState("");
  const [features, setFeatures] = useState<string[]>([]);

  const toggleFeature = (f: string) =>
    setFeatures((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

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
      date_souhaitee: fd.get("date_souhaitee"),
      description: fd.get("description"),
      rgpd: fd.get("rgpd") === "on",
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
        className="flex flex-col items-center justify-center rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-12 text-center"
      >
        <CheckCircle2 className="h-14 w-14 text-emerald-400" />
        <h3 className="mt-5 text-2xl font-semibold text-white">Demande envoyée !</h3>
        <p className="mt-3 max-w-md text-white/60">
          Merci pour votre confiance. Votre demande a bien été transmise à notre équipe.
          Nous revenons vers vous sous quelques heures avec une proposition personnalisée.
        </p>
      </motion.div>
    );
  }

  const goTo = (target: number) => {
    setDirection(target > step ? 1 : -1);
    setStep(Math.max(0, Math.min(STEPS.length - 1, target)));
  };
  const next = () => goTo(step + 1);
  const prev = () => goTo(step - 1);

  return (
    <div className="gradient-border rounded-3xl bg-ink-card/60 p-6 sm:p-9">
      {/* Progression */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <motion.div
                  animate={{
                    scale: i === step ? 1.08 : 1,
                  }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-500 ${
                    i <= step ? "bg-gradient-to-br from-vanyo-500 to-violet-hi text-white" : "bg-white/8 text-white/40"
                  }`}
                >
                  {i < step ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                </motion.div>
                <span className={`mt-2 hidden text-xs transition-colors duration-500 sm:block ${i <= step ? "text-white/70" : "text-white/35"}`}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
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
              <FieldGroup label="Nombre de pages estimé">
                <Input name="nombre_pages" placeholder="Ex : 5 pages" />
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
                        <span className={`flex h-4 w-4 items-center justify-center rounded border transition-colors duration-300 ${active ? "border-vanyo-400 bg-vanyo-500" : "border-white/25"}`}>
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

          {/* ÉTAPE 4 — Finalisation */}
          <StepPane active={step === 3} direction={direction}>
            <div className="space-y-5">
              <FieldGroup label="Date de mise en ligne souhaitée">
                <Input name="date_souhaitee" type="date" />
              </FieldGroup>
              <FieldGroup label="Décrivez votre projet" required>
                <Textarea
                  name="description"
                  required={step === 3}
                  rows={6}
                  placeholder="Parlez-nous de votre activité, de vos objectifs, de vos inspirations, de ce que vous attendez de votre site…"
                />
              </FieldGroup>
              <FieldGroup label="Pièces jointes (images, PDF, logo…)">
                <Input name="attachments" type="file" multiple accept="image/*,.pdf,.doc,.docx" className="file:mr-3 file:rounded-lg file:border-0 file:bg-vanyo-500/20 file:px-3 file:py-1.5 file:text-vanyo-200" />
                <p className="mt-1.5 text-xs text-white/40">
                  Vous pourrez aussi nous les transmettre par email après l'envoi.
                </p>
              </FieldGroup>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-colors duration-300 hover:border-white/20">
                <input type="checkbox" name="rgpd" className="mt-1 h-4 w-4 accent-vanyo-500" />
                <span className="text-sm text-white/60">
                  J'accepte que mes données soient traitées par Vanyo dans le cadre de ma demande de devis,
                  conformément à la politique de confidentialité. <span className="text-vanyo-400">*</span>
                </span>
              </label>
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
        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={prev}
            disabled={step === 0}
            className="btn-premium btn-ghost px-5 py-3 text-sm transition-opacity duration-300 disabled:opacity-0"
          >
            <ArrowLeft className="h-4 w-4" /> Précédent
          </button>

          {step < STEPS.length - 1 ? (
            <button type="button" onClick={next} className="btn-premium btn-primary px-6 py-3 text-sm">
              Continuer <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={status === "loading"}
              className="btn-premium btn-primary px-6 py-3 text-sm disabled:opacity-70"
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
