/**
 * Moteur de dialogue de l'assistant Vanyo — entièrement maison.
 *
 * Il ne génère pas de texte « au hasard » : chaque réponse est composée à
 * partir du catalogue et du contenu réels, ce qui rend structurellement
 * impossible l'invention d'un prix ou d'une promesse. Quand il ne sait pas,
 * il le dit et propose le contact — jamais une approximation.
 *
 * Il sait en plus mener un entretien : dès qu'un visiteur annonce un projet,
 * il pose une question à la fois (métier, site existant, pages, besoins),
 * puis conseille une formule avec une estimation calculée par le même moteur
 * que le formulaire de devis (`lib/quote.ts`) — les deux ne peuvent donc pas
 * se contredire.
 */

import { estimate, type QuoteSelection } from "@/lib/quote";
import { PAGES_UNLIMITED, type Catalog } from "@/lib/catalog";
import { SITE } from "@/lib/site";
import { PROJECTS, PROCESS, TESTIMONIALS, ADVANTAGES, SERVICES } from "@/lib/content";
import { CITIES } from "@/lib/cities";
import { search, type SearchIndex } from "./retrieval";
import { PAGES } from "./knowledge";
import type { Analysis, Entities, Intent } from "./nlu";

/* ------------------------------------------------------------------ */
/*  État de la conversation                                            */
/* ------------------------------------------------------------------ */

export type Slots = {
  metier?: string;
  /** Le visiteur a-t-il déjà un site ? */
  siteExistant?: boolean;
  pages?: number;
  besoins?: string[];
  budget?: number;
  ville?: string;
  prenom?: string;
};

export type DialogueState = {
  /** `entretien` : une qualification est en cours. */
  mode: "libre" | "entretien" | "conseil_donne";
  slots: Slots;
  /** Questions déjà posées, pour ne jamais les reposer. */
  posees: string[];
  /**
   * Questions auxquelles le visiteur a répondu — y compris « aucun », qui est
   * une réponse valable mais laisse le créneau vide. Sans ce suivi, on
   * reposerait indéfiniment une question à laquelle il a déjà dit non.
   */
  repondues: string[];
  /** Nombre d'échanges, sert à varier les formulations. */
  tour: number;
};

export const initialState = (): DialogueState => ({
  mode: "libre",
  slots: {},
  posees: [],
  repondues: [],
  tour: 0,
});

/* ------------------------------------------------------------------ */
/*  Formulaire intégré au chat                                         */
/* ------------------------------------------------------------------ */

export type FieldOption = {
  /** Ce que le visiteur lit sur le bouton. */
  label: string;
  /** Ce qui est transmis au moteur. */
  value: string;
  /**
   * Ce qui apparaît dans la conversation quand on clique, si c'est différent
   * du libellé. Sert au sommaire, dont les entrées sont des rubriques
   * (« Les prix ») alors que le fil doit lire comme une question posée
   * (« Combien coûte un site ? »).
   */
  message?: string;
};

/**
 * Description du contrôle à afficher sous la question, dans la bulle.
 *
 * Taper « je suis coiffeuse » marche toujours ; mais proposer les réponses
 * en un clic supprime la faute de frappe, l'hésitation et l'abandon — c'est
 * ce qui fait la différence entre un chat et un vrai entonnoir de devis.
 */
export type Field =
  | { kind: "choix"; key: string; options: FieldOption[]; autre?: string }
  | { kind: "multi"; key: string; options: FieldOption[]; valider: string; aucun?: string }
  | { kind: "nombre"; key: string; min: number; max: number; defaut: number; unite: string; passer?: string };

/** Réponse renvoyée par le formulaire : structurée, donc jamais mal interprétée. */
export type FieldAnswer = { key: string; values: string[] };

export type Reply = {
  text: string;
  navigate: string | null;
  suggestions: string[];
  /** Contrôle à afficher sous la réponse, quand une question est en cours. */
  field?: Field | null;
  state: DialogueState;
};

/* ------------------------------------------------------------------ */
/*  Outils de rédaction                                                */
/* ------------------------------------------------------------------ */

const eur = (n: number) => `${n.toLocaleString("fr-FR")} €`;

/** Choisit une formulation parmi plusieurs, en tournant d'un échange à l'autre. */
const vary = (tour: number, ...options: string[]) => options[tour % options.length];

/** « de restaurant » / « d'artisan » : élision devant voyelle et h muet. */
function de(mot: string): string {
  return /^[aeiouyâàéèêîïôûh]/i.test(mot) ? `d'${mot}` : `de ${mot}`;
}

/**
 * Le secteur tel qu'on peut l'écrire dans une phrase.
 * Quand le visiteur a répondu quelque chose qu'on n'a pas su classer, on le
 * cite entre guillemets plutôt que de bricoler une tournure : mieux vaut
 * « votre projet » tout court qu'une phrase bancale.
 */
function metierPhrase(metier: string | undefined): string {
  if (!metier) return "";
  // Une réponse brute commence souvent par « je suis… », « je fais… ».
  const nettoye = metier
    .replace(/^(?:je suis|je fais|je travaille dans|je bosse dans|je gere|j ai|c est)\s+(?:un |une |le |la |l |les |du |de la |des )?/i, "")
    .trim();
  if (!nettoye) return "";
  // Un secteur du référentiel est court et directement insérable.
  return nettoye.length <= 28 ? ` pour un site ${de(nettoye)}` : "";
}

/**
 * Met un fragment de la base en état d'être lu dans une bulle de chat.
 *
 * Les fragments sont écrits pour la recherche, pas pour la conversation :
 * certains font 2 000 signes et commencent par « Question fréquente : … ».
 * On enlève l'habillage et on coupe à une frontière de phrase.
 */
function condense(raw: string, max = 420): string {
  let t = raw
    .replace(/^Question fréquente\s*:\s*«[^»]*»\s*—\s*Réponse\s*:\s*/i, "")
    .replace(/^La page «\s*([^»]+)\s*» se trouve à l'adresse (\S+)\.\s*/i, "")
    .trim();

  if (t.length <= max) return t;

  // On coupe à la dernière phrase entière qui tient dans la limite.
  const cut = t.slice(0, max);
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf(" ; "), cut.lastIndexOf(" — "));
  t = stop > max * 0.4 ? cut.slice(0, stop + 1) : cut.slice(0, cut.lastIndexOf(" "));
  return t.replace(/[,;:—]\s*$/, "").trim() + " …";
}

/** Liste à la française : « a, b et c ». */
function enumerate(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} et ${items[items.length - 1]}`;
}

/* ------------------------------------------------------------------ */
/*  Entretien de qualification                                         */
/* ------------------------------------------------------------------ */

type Question = {
  key: keyof Slots;
  ask: (s: DialogueState) => string;
  suggestions: string[];
  /** Le contrôle affiché sous la question. Dérivé du catalogue quand il le faut. */
  field: (catalog: Catalog) => Field;
};

/**
 * Secteurs proposés en un clic. Les valeurs sont exactement celles que le
 * moteur de compréhension produit à partir d'une réponse tapée : cliquer ou
 * écrire aboutit donc au même état, et au même chiffrage.
 */
const METIERS_COURANTS: FieldOption[] = [
  { label: "Restaurant, café", value: "restaurant" },
  { label: "Commerce, boutique", value: "commerce" },
  { label: "Artisan, BTP", value: "artisan" },
  { label: "Santé, bien-être", value: "praticien" },
  { label: "Salon de beauté", value: "salon de beauté" },
  { label: "Immobilier", value: "agence immobilière" },
  { label: "Profession libérale", value: "profession libérale" },
  { label: "Photographe, créatif", value: "photographe" },
  { label: "Association, club", value: "association" },
  { label: "Entreprise, services", value: "entreprise de services" },
];

/** Besoins proposés à la sélection multiple, libellés tirés du catalogue. */
function besoinsOptions(catalog: Catalog): FieldOption[] {
  const cles = ["contact", "galerie", "rdv", "reservation", "boutique", "paiement", "blog", "avis", "admin", "seo_local"];
  return cles
    .map((k) => {
      const m = catalog.modules.find((x) => x.key === k);
      return m ? { label: m.label, value: m.key } : null;
    })
    .filter((x): x is FieldOption => x !== null);
}

/**
 * L'ordre compte : on demande d'abord ce qui pèse le plus dans le chiffrage,
 * pour pouvoir conseiller vite même si le visiteur abandonne en route.
 */
const QUESTIONS: Question[] = [
  {
    key: "metier",
    ask: (s) =>
      vary(
        s.tour,
        "Avec plaisir. Pour vous orienter correctement : vous exercez dans quel domaine ?",
        "Très bien. Dites-moi d'abord votre secteur d'activité, c'est ce qui change le plus les choses.",
        "Parfait. Quel est votre métier ou votre secteur ?",
      ),
    suggestions: ["Restaurant", "Artisan", "Commerce en ligne"],
    field: () => ({ kind: "choix", key: "metier", options: METIERS_COURANTS, autre: "Autre — je précise" }),
  },
  {
    key: "siteExistant",
    ask: (s) =>
      vary(
        s.tour,
        "Avez-vous déjà un site aujourd'hui, ou on part de zéro ?",
        "Est-ce que vous partez de zéro, ou vous avez déjà un site à refaire ?",
      ),
    suggestions: ["Je pars de zéro", "J'ai déjà un site"],
    field: () => ({
      kind: "choix",
      key: "siteExistant",
      options: [
        { label: "Je pars de zéro", value: "non" },
        { label: "J'ai déjà un site à refaire", value: "oui" },
      ],
    }),
  },
  {
    key: "besoins",
    ask: (s) =>
      vary(
        s.tour,
        "Qu'est-ce que le site devra faire, concrètement ? (vendre en ligne, prendre des rendez-vous, présenter votre travail…)",
        "De quoi avez-vous besoin sur le site : vendre, recevoir des demandes, prendre des rendez-vous, montrer vos réalisations ?",
      ),
    suggestions: ["Vendre en ligne", "Recevoir des demandes", "Prendre des rendez-vous"],
    field: (catalog) => ({
      kind: "multi",
      key: "besoins",
      options: besoinsOptions(catalog),
      valider: "Continuer",
      aucun: "Je ne sais pas encore",
    }),
  },
  {
    key: "pages",
    ask: (s) =>
      vary(
        s.tour,
        "Vous voyez ça sur combien de pages, à peu près ? Une estimation suffit.",
        "Combien de pages environ ? Pas besoin d'être précis à ce stade.",
      ),
    suggestions: ["3 pages", "5 pages", "Je ne sais pas"],
    field: () => ({
      kind: "nombre",
      key: "pages",
      min: 1,
      max: 20,
      defaut: 5,
      unite: "page",
      passer: "Je ne sais pas",
    }),
  },
];

/** La dernière question posée qui n’a pas encore reçu de réponse. */
function pendingQuestion(state: DialogueState): Question | null {
  for (let i = state.posees.length - 1; i >= 0; i--) {
    const q = QUESTIONS.find((x) => x.key === state.posees[i]);
    if (!q || state.repondues.includes(q.key)) continue;
    const v = state.slots[q.key];
    if (v === undefined || (Array.isArray(v) && v.length === 0)) return q;
  }
  return null;
}

/** La prochaine information manquante, ou `null` si on peut conseiller. */
function nextQuestion(state: DialogueState): Question | null {
  for (const q of QUESTIONS) {
    if (state.posees.includes(q.key) || state.repondues.includes(q.key)) continue;
    const v = state.slots[q.key];
    if (v === undefined || (Array.isArray(v) && v.length === 0)) return q;
  }
  return null;
}

/** Traduit les créneaux collectés en sélection chiffrable. */
function toSelection(slots: Slots): QuoteSelection {
  const types: string[] = [];
  const m = (slots.metier ?? "").toLowerCase();
  if (m.includes("restaurant")) types.push("Restaurant");
  else if (m.includes("commerce") || m.includes("boutique")) types.push("E-commerce");
  else if (m.includes("immobil")) types.push("Immobilier");
  else if (m.includes("association") || m.includes("club")) types.push("Association");
  else if (m.includes("photograph") || m.includes("artiste") || m.includes("graphist")) types.push("Portfolio");
  else types.push("Site vitrine");

  if (slots.besoins?.includes("boutique") && !types.includes("E-commerce")) types.push("E-commerce");

  return {
    typesSite: types,
    pages: slots.pages ?? null,
    modules: slots.besoins ?? [],
    budget: slots.budget ? String(slots.budget) : null,
  };
}

/** Compose la recommandation finale : formule, estimation, appel à l'action. */
function recommend(state: DialogueState, catalog: Catalog): Reply {
  const sel = toSelection(state.slots);
  const est = estimate(sel, catalog);
  const pack = catalog.packs.find((p) => p.key === est.packKey);
  const s = state.slots;

  const contexte = metierPhrase(s.metier);

  let text: string;
  if (est.surDevis || !pack) {
    text =
      `D'après ce que vous m'avez décrit${contexte}, on est sur du sur-mesure : le chiffrage se fait après un échange, ` +
      `parce que le périmètre change beaucoup le résultat. Le formulaire de devis prend deux minutes et me donne tout ce qu'il faut pour vous répondre précisément.`;
  } else {
    // Pages et fonctionnalités sont deux natures différentes : les enchaîner
    // dans la même énumération donnait « 7 pages et X et Y ».
    const labels = (s.besoins ?? [])
      .map((k) => catalog.modules.find((mm) => mm.key === k)?.label.toLowerCase())
      .filter((x): x is string => Boolean(x))
      .slice(0, 3);

    let detail = s.pages ? `${s.pages} page${s.pages > 1 ? "s" : ""}` : "";
    if (labels.length) detail += `${detail ? ", avec " : ""}${enumerate(labels)}`;

    text =
      `Sur cette base${contexte}, la formule ${pack.name} correspond bien` +
      (detail ? ` : ${detail}` : "") +
      `. Comptez autour de ${eur(est.total)}` +
      (est.monthly > 0 ? `, plus ${eur(est.monthly)} par mois de maintenance` : "") +
      `, livré en ${pack.delai.toLowerCase()}.` +
      (est.discountPercent > 0 ? ` La remise en cours de -${est.discountPercent} % est déjà comptée.` : "") +
      ` C'est une estimation, pas un devis : le formulaire affine le chiffre en direct et reste gratuit.`;
  }

  return {
    text,
    navigate: null,
    suggestions: ["Faire mon devis", "Qu'est-ce qui est compris ?", "Vos délais"],
    state: { ...state, mode: "conseil_donne" },
  };
}

/* ------------------------------------------------------------------ */
/*  Réponses par intention                                             */
/* ------------------------------------------------------------------ */

function answerPrix(catalog: Catalog, tour: number, connaitMetier: boolean): Omit<Reply, "state"> {
  const chiffrables = catalog.packs.filter((p) => typeof p.base === "number");
  const mini = Math.min(...chiffrables.map((p) => p.base as number));
  const liste = chiffrables.map((p) => `${p.name} à ${eur(p.base as number)}`);

  return {
    text:
      vary(
        tour,
        `Nos sites démarrent à ${eur(mini)}. `,
        `Le point de départ est à ${eur(mini)}. `,
      ) +
      `Le prix dépend surtout du nombre de pages et des fonctionnalités : ${enumerate(liste)}, et du sur-mesure au-delà. ` +
      // Ne jamais redemander une information déjà donnée : c'est ce qui fait
      // qu'un échange paraît suivi plutôt que scripté.
      (connaitMetier
        ? `Pour vous donner un chiffre sur votre cas précis, il me manque juste deux détails.`
        : `Si vous me dites votre métier, je vous oriente vers la bonne formule en deux questions.`),
    navigate: null,
    suggestions: connaitMetier
      ? ["Continuons", "Voir le détail des formules", "Vos délais"]
      : ["Je veux un site", "Voir le détail des formules", "Vos délais"],
  };
}

function answerFormules(catalog: Catalog): Omit<Reply, "state"> {
  const lignes = catalog.packs.map((p) => {
    const prix = p.base === null ? "sur devis" : eur(p.base);
    return `${p.name} (${prix}) — ${p.pagesLabel === String(PAGES_UNLIMITED) ? "pages illimitées" : p.pagesLabel} page(s), ${p.tagline.toLowerCase().replace(/\.$/, "")}`;
  });
  return {
    text: `Il y a quatre formules :\n${lignes.map((l) => `• ${l}`).join("\n")}\n\nLe comparatif complet est sur la page Tarifs, et une page supplémentaire coûte ${eur(catalog.extraPagePrice)}.`,
    navigate: null,
    suggestions: ["Laquelle pour moi ?", "Faire mon devis", "Qu'est-ce qui est compris ?"],
  };
}

function answerDelai(catalog: Catalog): Omit<Reply, "state"> {
  const rapide = catalog.delais.find((d) => d.price > 0);
  return {
    text:
      `Ça dépend de la formule : ${enumerate(
        catalog.packs
          .filter((p) => !/sur[- ]mesure/i.test(p.delai))
          .map((p) => `${p.name} en ${p.delai.toLowerCase()}`),
      )}. ` +
      `Le compteur démarre à la validation de la maquette, pas à la signature.` +
      (rapide ? ` Si c'est urgent, la livraison prioritaire (+${eur(rapide.price)}) réduit le délai d'environ moitié.` : ""),
    navigate: null,
    suggestions: ["C'est urgent", "Comment ça se passe ?", "Faire mon devis"],
  };
}

function answerMaintenance(catalog: Catalog): Omit<Reply, "state"> {
  const payantes = catalog.maintenancePlans.filter((p) => p.price > 0);
  const conseillee = payantes.find((p) => p.recommended) ?? payantes[0];
  const offerte = Math.max(...catalog.packs.map((p) => p.maintenanceOfferte));

  return {
    text:
      `La maintenance est optionnelle et sans engagement de durée : ${enumerate(payantes.map((p) => `${p.label} à ${eur(p.price)}/mois`))}. ` +
      (conseillee ? `La plus prise est ${conseillee.label} — ${conseillee.description.toLowerCase()} ` : "") +
      (offerte > 0 ? `Selon la formule, les ${offerte} premiers mois peuvent être offerts. ` : "") +
      `Vous pouvez aussi ne rien prendre : le site vous appartient dans tous les cas.`,
    navigate: null,
    suggestions: ["Qu'est-ce qui est inclus ?", "Faire mon devis", "Vos tarifs"],
  };
}

function answerMiseEnLigne(catalog: Catalog): Omit<Reply, "state"> {
  const options = catalog.deploiements.filter((d) => d.price > 0);
  return {
    text:
      `On peut tout gérer : ${enumerate(options.map((d) => `${d.label.toLowerCase()} à ${eur(d.price)}`))}. ` +
      `Ça couvre l'hébergement, le certificat HTTPS et la configuration — vous n'avez rien à faire de technique. ` +
      `Si vous préférez gérer vous-même, c'est possible aussi et sans supplément.`,
    navigate: null,
    suggestions: ["Et le nom de domaine ?", "Faire mon devis", "Vos tarifs"],
  };
}

function answerComparaison(tour: number): Omit<Reply, "state"> {
  const args = ADVANTAGES.slice(0, 4).map((a) => a.title.toLowerCase());
  return {
    text:
      vary(
        tour,
        "Les plateformes en ligne sont très bien pour démarrer vite. ",
        "Rien contre ces outils, ils dépannent bien au début. ",
      ) +
      `La différence est ailleurs : ${enumerate(args)}, et surtout un site sur mesure qui vous appartient — code compris — au lieu d'un abonnement qui augmente. ` +
      `Le référencement est pensé dès la conception, pas ajouté après. Et vous avez quelqu'un au bout du fil.`,
    navigate: null,
    suggestions: ["Pourquoi Vanyo ?", "Vos réalisations", "Vos tarifs"],
  };
}

function answerTropCher(catalog: Catalog): Omit<Reply, "state"> {
  const mini = Math.min(...catalog.packs.filter((p) => typeof p.base === "number").map((p) => p.base as number));
  return {
    text:
      `Je comprends, c'est un budget. Deux choses : la formule d'entrée est à ${eur(mini)}, payable une fois — pas d'abonnement obligatoire derrière. ` +
      `Et on peut démarrer petit puis ajouter des fonctionnalités plus tard, le site est fait pour évoluer. ` +
      `Dites-moi votre budget et votre métier, je vous dis franchement ce qui est faisable dedans.`,
    navigate: null,
    suggestions: ["Mon budget est limité", "Voir les formules", "Je veux un site"],
  };
}

function answerRealisations(): Omit<Reply, "state"> {
  const cats = [...new Set(PROJECTS.map((p) => p.category))];
  return {
    text: `Bien sûr — je vous ouvre le portfolio. Il y a ${PROJECTS.length} projets, filtrables par secteur : ${enumerate(cats.map((c) => c.toLowerCase()))}.`,
    navigate: "/realisations",
    suggestions: ["Un exemple en restauration", "Vos tarifs", "Je veux un site"],
  };
}

function answerProcessus(): Omit<Reply, "state"> {
  return {
    text:
      `En ${PROCESS.length} étapes : ${enumerate(PROCESS.slice(0, 4).map((p) => p.title.toLowerCase()))}, puis validation, mise en ligne et suivi. ` +
      `Le point important : vous validez la maquette avant qu'une seule ligne de code soit écrite. Aucune mauvaise surprise à la livraison.`,
    navigate: null,
    suggestions: ["Vos délais", "Faire mon devis", "Voir le détail"],
  };
}

function answerAvis(): Omit<Reply, "state"> {
  const t = TESTIMONIALS[0];
  const moyenne = (TESTIMONIALS.reduce((s, x) => s + x.rating, 0) / TESTIMONIALS.length).toFixed(1);
  return {
    text: `${TESTIMONIALS.length} avis publiés, moyenne de ${moyenne}/5. Par exemple ${t.name} (${t.company}) : « ${t.quote} » — tous les témoignages sont sur la page Avis.`,
    navigate: null,
    suggestions: ["Voir tous les avis", "Vos réalisations", "Je veux un site"],
  };
}

function answerVille(entities: Entities): Omit<Reply, "state"> {
  const ville = entities.ville ? CITIES.find((c) => c.name === entities.ville) : undefined;
  if (ville) {
    return {
      text: `Oui, nous avons des clients à ${ville.name} et dans la région ${ville.region}. On travaille à distance, donc aucun frais de déplacement — les échanges se font par téléphone, visio ou email. Une page dédiée à ${ville.name} détaille le contexte local.`,
      navigate: `/villes/${ville.slug}`,
      suggestions: ["Je veux un site", "Vos tarifs", "Vos délais"],
    };
  }
  return {
    text: `Nous travaillons partout en France, à 100 % à distance : ${SITE.address}. Pas de local, donc pas de frais répercutés sur vous. Des pages locales existent pour ${CITIES.length} villes.`,
    navigate: null,
    suggestions: ["Je veux un site", "Vos tarifs", "Comment ça se passe ?"],
  };
}

function answerContact(): Omit<Reply, "state"> {
  return {
    text: `Je vous ouvre la page contact. Vous pouvez aussi écrire directement à ${SITE.email} — réponse sous 24 h ouvrées, ${SITE.hours.toLowerCase()}. Si vous avez un projet précis en tête, le formulaire de devis est plus efficace : il chiffre en direct.`,
    navigate: "/contact",
    suggestions: ["Plutôt un devis", "Vos tarifs", "Vos délais"],
  };
}

function answerDevis(): Omit<Reply, "state"> {
  return {
    text: `Je vous emmène sur le formulaire. Il fait 8 étapes courtes, l'estimation se met à jour à chaque réponse, c'est gratuit et sans engagement. Si un champ vous bloque, revenez me demander.`,
    navigate: "/devis",
    suggestions: ["Combien ça coûte ?", "Vos délais", "Qu'est-ce qui est compris ?"],
  };
}

function answerServices(): Omit<Reply, "state"> {
  const titres = SERVICES.map((s) => s.title.toLowerCase());
  return {
    text:
      `On couvre toute la chaîne : ${enumerate(titres.slice(0, 6))}, et aussi ${enumerate(titres.slice(6, 10))}. ` +
      `Autrement dit, vous n'avez qu'un interlocuteur du premier échange jusqu'au suivi après mise en ligne. Le détail de chaque prestation est sur la page Services.`,
    navigate: null,
    suggestions: ["Je veux un site", "Combien ça coûte ?", "Vos réalisations"],
  };
}

function answerSeo(catalog: Catalog): Omit<Reply, "state"> {
  const avance = catalog.modules.find((m) => m.key === "seo_avance");
  const local = catalog.modules.find((m) => m.key === "seo_local");
  return {
    text:
      `Le référencement de base est compris dans toutes les formules, sans supplément : structure propre, balises, sitemap, vitesse. ` +
      `C'est ce qui permet à Google de comprendre et d'indexer votre site correctement. ` +
      (avance ? `Pour aller plus loin, le SEO avancé (${eur(avance.price)}) ajoute audit, mots-clés et données structurées` : "") +
      (local ? `, et le référencement local (${eur(local.price)}) travaille votre visibilité sur votre ville` : "") +
      `. Aucune agence sérieuse ne vous promettra la première place : ça, personne ne peut le garantir.`,
    navigate: null,
    suggestions: ["Être visible sur ma ville", "Vos tarifs", "Je veux un site"],
  };
}

function answerAutonomie(catalog: Catalog): Omit<Reply, "state"> {
  const admin = catalog.modules.find((m) => m.key === "admin");
  const compris = catalog.packs.filter((p) => p.includes.includes("admin")).map((p) => p.name);
  return {
    text:
      `Oui, c'est prévu. Vous avez un panel d'administration pour modifier vos textes, vos photos et vos contenus vous-même, sans toucher à une ligne de code. ` +
      (compris.length ? `Il est compris dans ${enumerate(compris)}. ` : "") +
      (admin && admin.price > 0 ? `Sur la formule d'entrée, c'est une option à ${eur(admin.price)}. ` : "") +
      `On vous montre comment l'utiliser à la livraison — en général quinze minutes suffisent.`,
    navigate: null,
    suggestions: ["Vos formules", "Je veux un site", "Faire mon devis"],
  };
}

function answerResponsive(): Omit<Reply, "state"> {
  return {
    text:
      `Oui, systématiquement — et ce n'est pas une option. Chaque site est conçu « mobile d'abord », puis adapté à la tablette et à l'ordinateur. ` +
      `C'est indispensable : la majorité de vos visiteurs arriveront depuis leur téléphone, et Google se base sur la version mobile pour vous classer.`,
    navigate: null,
    suggestions: ["Et la vitesse ?", "Vos réalisations", "Je veux un site"],
  };
}

function answerRefonte(): Omit<Reply, "state"> {
  return {
    text:
      `Oui, on fait beaucoup de refontes. Le point sensible, c'est le référencement déjà acquis : on le préserve en reprenant vos adresses de pages et en mettant en place les redirections nécessaires. ` +
      `En pratique, une refonte fait souvent progresser le positionnement, parce qu'on corrige au passage la vitesse et la structure. Envoyez-moi l'adresse de votre site actuel via le formulaire, on regarde ce qui est récupérable.`,
    navigate: null,
    suggestions: ["Faire mon devis", "Combien ça coûte ?", "Vous contacter"],
  };
}

function answerIdentite(): Omit<Reply, "state"> {
  return {
    text:
      `${SITE.name} est une ${SITE.tagline.toLowerCase()} qui conçoit des sites sur mesure, rapides et pensés pour convertir. ` +
      `On travaille à 100 % à distance depuis la France : pas de local, donc pas de frais de structure répercutés sur vos tarifs. ` +
      `Les échanges se font par téléphone, visio ou email, ${SITE.hours.toLowerCase()}.`,
    navigate: null,
    suggestions: ["Vos réalisations", "Vos tarifs", "Je veux un site"],
  };
}

function answerAideFormulaire(path: string | undefined): Omit<Reply, "state"> {
  if (path?.startsWith("/devis")) {
    return {
      text:
        `Aucun champ n'est piégeux : si vous hésitez, laissez l'estimation proposée, on ajustera ensemble ensuite. ` +
        `Seules vos coordonnées de la dernière étape sont vraiment nécessaires. Rien n'est facturé et vous n'êtes engagé à rien. Dites-moi quel champ vous bloque, je vous explique.`,
      navigate: null,
      suggestions: ["À quoi sert la formule ?", "Combien de pages choisir ?", "C'est gratuit ?"],
    };
  }
  return {
    text: `Je peux vous accompagner pendant le formulaire de devis — dites-moi simplement quel champ vous bloque. Il est gratuit, sans engagement, et l'estimation s'affiche au fur et à mesure.`,
    navigate: "/devis",
    suggestions: ["Combien ça coûte ?", "Vos délais", "Vous contacter"],
  };
}

/**
 * Le sommaire de ce que l'assistant sait traiter.
 *
 * Beaucoup de visiteurs n'osent pas poser de question, ou ne savent pas ce
 * qu'ils ont le droit de demander. Leur montrer l'étendue du sujet vaut mieux
 * qu'une invite vide.
 */
function answerMenu(): Omit<Reply, "state"> {
  return {
    text: "Je peux répondre sur à peu près tout ce qui touche à votre projet. Choisissez un sujet, ou posez directement votre question.",
    navigate: null,
    suggestions: [],
    field: {
      kind: "choix",
      key: "sujet",
      options: [
        { label: "Les prix et les formules", value: "Combien coûte un site ?", message: "Combien coûte un site ?" },
        { label: "Les délais de livraison", value: "Quels sont vos délais ?", message: "Quels sont vos délais ?" },
        { label: "Je veux lancer un projet", value: "Je veux un site", message: "Je veux un site" },
        { label: "Voir vos réalisations", value: "Montrez-moi vos réalisations", message: "Montrez-moi vos réalisations" },
        { label: "La maintenance et le suivi", value: "Vous faites de la maintenance ?", message: "Vous faites de la maintenance ?" },
        { label: "Domaine, hébergement, emails", value: "Vous gérez le nom de domaine ?", message: "Vous gérez le nom de domaine ?" },
        { label: "Le référencement Google", value: "Le SEO est-il inclus ?", message: "Le SEO est-il inclus ?" },
        { label: "Textes et photos du site", value: "Qui rédige les textes ?", message: "Qui rédige les textes ?" },
        { label: "Logo et charte graphique", value: "Vous créez le logo ?", message: "Vous créez le logo ?" },
        { label: "Vendre en ligne", value: "Je veux vendre en ligne" },
        { label: "Sécurité, RGPD, propriété", value: "Le site m'appartient-il ?", message: "Le site m'appartient-il ?" },
        { label: "Comment se passe le paiement", value: "Comment se passe le paiement ?", message: "Comment se passe le paiement ?" },
        { label: "Statistiques et trafic", value: "Je pourrai voir les visites ?", message: "Je pourrai voir les visites ?" },
        { label: "Vous contacter", value: "Je veux vous contacter", message: "Je veux vous contacter" },
      ],
    },
  };
}

function answerProprieteCode(): Omit<Reply, "state"> {
  return {
    text:
      "Le site est à vous, entièrement, dès le paiement du solde : le code, les contenus, le nom de domaine. " +
      "Rien n'est loué, rien n'est verrouillé. Si un jour vous voulez partir chez un autre prestataire, vous emportez tout — c'est la différence de fond avec un abonnement à une plateforme, où vous perdez le site en arrêtant de payer.",
    navigate: null,
    suggestions: ["Et la maintenance ?", "Vos tarifs", "Je veux un site"],
  };
}

function answerPaiement(catalog: Catalog): Omit<Reply, "state"> {
  const mini = Math.min(...catalog.packs.filter((p) => typeof p.base === "number").map((p) => p.base as number));
  return {
    text:
      "Le règlement se fait par virement, en deux temps : un acompte de 30 % à la commande, le solde à la livraison, une fois que le site vous convient. " +
      "Sur les projets plus conséquents, on peut échelonner davantage — c'est à voir ensemble. " +
      `Une facture accompagne chaque versement. À partir de ${eur(mini)}, il n'y a rien d'autre à payer, sauf si vous prenez une maintenance mensuelle.`,
    navigate: null,
    suggestions: ["Et la maintenance ?", "Faire mon devis", "Vos tarifs"],
  };
}

function answerGarantie(): Omit<Reply, "state"> {
  return {
    text:
      "Vous validez la maquette avant qu'une ligne de code soit écrite, puis vous testez le site avant la mise en ligne : les mauvaises surprises sont éliminées en amont plutôt que réparées après. " +
      "Un bug qui viendrait de notre travail est corrigé sans frais, maintenance ou pas. " +
      "Ce qu'on ne garantit pas, en revanche, c'est une position précise sur Google : personne ne peut le promettre honnêtement.",
    navigate: null,
    suggestions: ["Comment ça se passe ?", "Vous contacter", "Je veux un site"],
  };
}

function answerRgpd(): Omit<Reply, "state"> {
  return {
    text:
      "Chaque site est livré conforme : mentions légales, politique de confidentialité, et bandeau cookies uniquement si le site en dépose réellement — inutile d'en afficher un pour rien. " +
      "Les données de vos formulaires vous appartiennent et restent hébergées en Europe. Aucun traceur publicitaire n'est ajouté sans votre accord.",
    navigate: null,
    suggestions: ["Et la sécurité ?", "Vos tarifs", "Je veux un site"],
  };
}

function answerSecurite(): Omit<Reply, "state"> {
  return {
    text:
      "Le certificat HTTPS est installé et renouvelé automatiquement, et les formulaires sont protégés contre le spam. " +
      "Le site est développé sur mesure, sans la couche d'extensions tierces qui est la première cause de piratage sur les sites classiques. " +
      "Avec une maintenance, on ajoute les sauvegardes automatiques et la surveillance de disponibilité : c'est ce qui permet de restaurer en quelques minutes s'il arrive quoi que ce soit.",
    navigate: null,
    suggestions: ["Les formules de maintenance", "Et le RGPD ?", "Je veux un site"],
  };
}

function answerContenuTextes(catalog: Catalog): Omit<Reply, "state"> {
  const redaction = catalog.modules.find((m) => m.key === "redaction");
  return {
    text:
      "Trois cas de figure : vous fournissez vos textes, vous en avez une partie qu'on retravaille, ou on écrit tout. " +
      (redaction ? `La rédaction complète est une option à ${eur(redaction.price)} (jusqu'à 5 pages). ` : "") +
      "Ne pas avoir de texte prêt n'est jamais un obstacle — c'est même le cas le plus fréquent. On part d'un échange sur votre activité et on rédige à partir de là.",
    navigate: null,
    suggestions: ["Et les photos ?", "Faire mon devis", "Vos tarifs"],
  };
}

function answerPhotos(catalog: Catalog): Omit<Reply, "state"> {
  const galerie = catalog.modules.find((m) => m.key === "galerie");
  return {
    text:
      "Si vous avez des photos, on les optimise et on les intègre. Si vous n'en avez pas, on sélectionne des visuels libres de droits de qualité, sans supplément. " +
      "Pour un restaurant, un salon ou un artisan, de vraies photos de votre travail font une vraie différence : ça vaut le coup d'en prévoir, même prises au téléphone si elles sont bien éclairées. " +
      (galerie ? `La galerie photos est une option à ${eur(galerie.price)}, comprise dans plusieurs formules.` : ""),
    navigate: null,
    suggestions: ["Qui rédige les textes ?", "Vos réalisations", "Je veux un site"],
  };
}

function answerLogo(catalog: Catalog): Omit<Reply, "state"> {
  const logo = catalog.modules.find((m) => m.key === "logo");
  const charte = catalog.modules.find((m) => m.key === "charte");
  return {
    text:
      "Oui. " +
      (logo ? `Création de logo : ${eur(logo.price)}, avec 3 pistes créatives et les fichiers vectoriels livrés. ` : "") +
      (charte ? `Charte graphique complète (couleurs, typographies, déclinaisons) : ${eur(charte.price)}. ` : "") +
      "Si vous avez déjà un logo, on construit le site autour, en respectant vos couleurs.",
    navigate: null,
    suggestions: ["Faire mon devis", "Vos réalisations", "Vos tarifs"],
  };
}

function answerMultilingue(catalog: Catalog): Omit<Reply, "state"> {
  const m = catalog.modules.find((x) => x.key === "multilingue");
  return {
    text:
      `Oui, c'est prévu${m ? ` : ${eur(m.price)} pour une seconde langue complète` : ""}, avec bascule automatique selon la langue du visiteur et un référencement propre pour chaque version. ` +
      "La traduction elle-même peut être la vôtre, ou on s'en charge — à préciser dans le devis.",
    navigate: null,
    suggestions: ["Faire mon devis", "Le référencement", "Vos tarifs"],
  };
}

function answerReseaux(): Omit<Reply, "state"> {
  return {
    text:
      "Oui : liens vers vos comptes, et affichage de votre fil Instagram directement sur le site si vous le souhaitez. " +
      "Un conseil au passage : les réseaux sociaux ne vous appartiennent pas, votre site si. Ils servent à amener du monde chez vous, pas l'inverse.",
    navigate: null,
    suggestions: ["Le référencement", "Je veux un site", "Vos tarifs"],
  };
}

function answerStatistiques(catalog: Catalog): Omit<Reply, "state"> {
  const a = catalog.modules.find((m) => m.key === "analytics");
  const d = catalog.modules.find((m) => m.key === "dashboard");
  return {
    text:
      `Oui${a ? ` — la mise en place d'Analytics et de la Search Console est à ${eur(a.price)}` : ""} : nombre de visiteurs, pages les plus vues, provenance du trafic, mots-clés qui vous amènent du monde. ` +
      (d ? `Un tableau de bord intégré au site, plus lisible, existe aussi (${eur(d.price)}). ` : "") +
      "Les formules de maintenance incluent un rapport mensuel, pour ne pas avoir à aller le chercher.",
    navigate: null,
    suggestions: ["Les formules de maintenance", "Le référencement", "Vos tarifs"],
  };
}

function answerFormation(): Omit<Reply, "state"> {
  return {
    text:
      "Oui, systématiquement. À la livraison, on vous fait une prise en main du panel d'administration : en général quinze à trente minutes suffisent, c'est fait pour être simple. " +
      "Vous repartez aussi avec un mode d'emploi écrit, et vous pouvez revenir poser des questions ensuite.",
    navigate: null,
    suggestions: ["Je pourrai tout modifier ?", "Comment ça se passe ?", "Je veux un site"],
  };
}

function answerModificationsApres(catalog: Catalog): Omit<Reply, "state"> {
  const plan = catalog.maintenancePlans.find((p) => p.recommended);
  return {
    text:
      `Le site est fait pour évoluer : ajouter une page coûte ${eur(catalog.extraPagePrice)}, une nouvelle fonctionnalité se chiffre à la demande. ` +
      "Tout ce qui est texte, photo ou article, vous le changez vous-même depuis votre panel, autant de fois que vous voulez et sans rien payer. " +
      (plan ? `Et si vous préférez ne pas y toucher, la formule ${plan.label} (${eur(plan.price)}/mois) comprend des modifications faites par nos soins.` : ""),
    navigate: null,
    suggestions: ["Les formules de maintenance", "Vos tarifs", "Je veux un site"],
  };
}

function answerEcommerce(catalog: Catalog): Omit<Reply, "state"> {
  const b = catalog.modules.find((m) => m.key === "boutique");
  const pay = catalog.modules.find((m) => m.key === "paiement");
  return {
    text:
      `Oui : catalogue, panier, commandes et gestion des stocks${b ? ` (${eur(b.price)})` : ""}, avec encaissement sécurisé par carte via Stripe${pay ? ` (${eur(pay.price)})` : ""}. ` +
      "Vous gérez vos produits, vos prix et vos stocks depuis votre panel, et vous recevez chaque commande par email. " +
      "Les frais de port et les moyens de livraison se paramètrent selon votre activité. Dites-moi ce que vous vendez, je vous oriente.",
    navigate: null,
    suggestions: ["Je veux vendre en ligne", "Combien ça coûte ?", "Vos réalisations"],
  };
}

function answerAccessibilite(): Omit<Reply, "state"> {
  return {
    text:
      "Les bases sont intégrées d'office : contrastes suffisants, navigation au clavier, textes alternatifs sur les images, structure de titres correcte. " +
      "C'est utile bien au-delà du handicap : c'est exactement ce que Google analyse aussi. " +
      "Une mise en conformité RGAA complète, telle qu'exigée du secteur public, est un travail à part — on peut en parler si vous y êtes soumis.",
    navigate: null,
    suggestions: ["Le référencement", "Vous contacter", "Vos tarifs"],
  };
}

function answerVitesse(catalog: Catalog): Omit<Reply, "state"> {
  const perf = catalog.modules.find((m) => m.key === "perf");
  return {
    text:
      "C'est un point sur lequel on ne transige pas : images compressées aux formats modernes, code minimal, hébergement rapide, aucune bibliothèque superflue. " +
      "Un site lent fait fuir les visiteurs et se fait pénaliser par Google — les deux à la fois. " +
      (perf ? `Une optimisation poussée visant 95+ sur Lighthouse est disponible en option (${eur(perf.price)}).` : ""),
    navigate: null,
    suggestions: ["Le référencement", "Vos réalisations", "Je veux un site"],
  };
}

function answerEngagement(catalog: Catalog): Omit<Reply, "state"> {
  const payantes = catalog.maintenancePlans.filter((p) => p.price > 0);
  return {
    text:
      "Aucun engagement de durée. La création se paie une fois, point. " +
      (payantes.length
        ? `La maintenance est un abonnement mensuel (${enumerate(payantes.map((p) => `${p.label} ${eur(p.price)}/mois`))}) que vous pouvez arrêter quand vous voulez, d'un simple email. `
        : "") +
      "Le site reste le vôtre dans tous les cas : arrêter la maintenance ne le coupe pas, il continue de fonctionner.",
    navigate: null,
    suggestions: ["Les formules de maintenance", "Le site m'appartient ?", "Vos tarifs"],
  };
}

function answerExpliquePage(path: string | undefined): Omit<Reply, "state"> {
  const page = PAGES.find((p) => p.url === path) ?? PAGES.find((p) => path?.startsWith(p.url + "/"));
  if (!page) {
    return {
      text: "Vous êtes sur une page du site Vanyo. Dites-moi ce que vous cherchez, je vous oriente.",
      navigate: null,
      suggestions: ["Vos tarifs", "Vos réalisations", "Je veux un site"],
    };
  }
  return {
    text: `Vous êtes sur « ${page.label} ». ${page.purpose} Vous voulez que je vous détaille un point en particulier ?`,
    navigate: null,
    suggestions: ["Vos tarifs", "Je veux un site", "Vous contacter"],
  };
}

/* ------------------------------------------------------------------ */
/*  Moteur                                                             */
/* ------------------------------------------------------------------ */

export function respond({
  analysis,
  state,
  catalog,
  index,
  path,
  answer,
}: {
  analysis: Analysis;
  state: DialogueState;
  catalog: Catalog;
  index: SearchIndex;
  path?: string;
  /** Réponse issue du formulaire intégré, quand le visiteur a cliqué. */
  answer?: FieldAnswer | null;
}): Reply {
  const tour = state.tour + 1;
  const next: DialogueState = {
    ...state,
    tour,
    slots: { ...state.slots },
    repondues: [...state.repondues],
  };
  const { intent, entities, confidence } = analysis;

  // Tout ce que le visiteur laisse échapper est mémorisé, quelle que soit
  // l'intention détectée : il ne faut jamais redemander une information.
  if (entities.metier) next.slots.metier = entities.metier;
  if (entities.ville) next.slots.ville = entities.ville;
  if (entities.pages) next.slots.pages = entities.pages;
  if (entities.budget) next.slots.budget = entities.budget;
  if (entities.besoins?.length) {
    next.slots.besoins = [...new Set([...(next.slots.besoins ?? []), ...entities.besoins])];
  }
  for (const cle of ["metier", "pages", "besoins"] as const) {
    const v = next.slots[cle];
    const rempli = Array.isArray(v) ? v.length > 0 : v !== undefined;
    if (rempli && !next.repondues.includes(cle)) next.repondues.push(cle);
  }

  // Une réponse cliquée est appliquée telle quelle : pas d'interprétation,
  // donc pas de contresens possible sur ce que le visiteur a désigné.
  if (answer) {
    const marquer = () => {
      if (!next.repondues.includes(answer.key)) next.repondues.push(answer.key);
    };
    if (answer.key === "metier" && answer.values[0]) {
      next.slots.metier = answer.values[0];
      marquer();
    } else if (answer.key === "siteExistant") {
      next.slots.siteExistant = answer.values[0] === "oui";
      marquer();
    } else if (answer.key === "besoins") {
      next.slots.besoins = [...new Set([...(next.slots.besoins ?? []), ...answer.values])];
      marquer();
    } else if (answer.key === "pages") {
      const n = Number(answer.values[0]);
      if (Number.isFinite(n) && n > 0) next.slots.pages = n;
      marquer();
    }
  }

  const wrap = (r: Omit<Reply, "state"> & { field?: Field | null }, s: DialogueState = next): Reply => ({
    field: null,
    ...r,
    state: s,
  });

  /* ── Politesse ─────────────────────────────────────────────── */
  if (intent === "salutation" && tour <= 2) {
    return wrap({
      text: vary(tour, "Bonjour ! Qu'est-ce qui vous amène — un projet de site, ou une question sur nos tarifs ?", "Bonjour ! Dites-moi ce que je peux faire pour vous."),
      navigate: null,
      suggestions: ["Je veux un site", "Combien ça coûte ?", "Vos réalisations"],
    });
  }
  if (intent === "remerciement") {
    return wrap({
      text: "Avec plaisir. Si vous voulez aller plus loin, le devis est gratuit et prend deux minutes.",
      navigate: null,
      suggestions: ["Faire mon devis", "Vous contacter"],
    });
  }
  if (intent === "aurevoir") {
    return wrap({
      text: `Très bonne journée ! Le devis reste ouvert quand vous voulez, et ${SITE.email} fonctionne aussi.`,
      navigate: null,
      suggestions: ["Faire mon devis"],
    });
  }
  if (intent === "hors_sujet") {
    return wrap({
      text: "Là je ne vais pas être utile — je ne sais parler que de Vanyo et de création de sites. En revanche sur ce terrain, posez-moi n'importe quelle question.",
      navigate: null,
      suggestions: ["Combien ça coûte ?", "Vos réalisations", "Je veux un site"],
    });
  }

  /* ── Entretien en cours ────────────────────────────────────── */
  if (next.mode === "entretien") {
    const attendue = next.posees[next.posees.length - 1] as keyof Slots | undefined;

    // Interprétation de la réponse à la question qu'on venait de poser.
    if (attendue === "siteExistant" && next.slots.siteExistant === undefined) {
      if (intent === "oui" || analysis.words.some((w) => ["deja", "oui", "existe", "refonte"].includes(w))) {
        next.slots.siteExistant = true;
      } else if (intent === "non" || analysis.words.some((w) => ["zero", "non", "aucun", "rien"].includes(w))) {
        next.slots.siteExistant = false;
      }
    }
    if (attendue === "metier" && !next.slots.metier && analysis.words.length > 0 && intent !== "non") {
      // Aucun secteur reconnu mais le visiteur a répondu quelque chose :
      // on garde sa formulation telle quelle plutôt que de le faire répéter.
      const brut = analysis.normalized.slice(0, 60).trim();
      if (brut.length >= 3) next.slots.metier = brut;
    }
    if (attendue === "besoins" && !next.slots.besoins?.length) {
      next.slots.besoins = entities.besoins ?? [];
    }
    if (attendue === "pages" && next.slots.pages === undefined && intent === "non") {
      next.slots.pages = 3; // « je ne sais pas » : on part sur une vitrine courte
    }

    // Le visiteur bifurque vers une vraie question : on y répond et on
    // reprendra l'entretien après. Rien n'est plus agaçant qu'un robot qui
    // ignore la question pour continuer son questionnaire.
    // Une digression n'en est une que si la question posée est restée sans
    // réponse. Sinon on prendrait « prendre des rendez-vous », donné comme
    // besoin, pour une demande de rendez-vous commercial.
    const toujoursEnAttente = pendingQuestion(next)?.key === attendue;

    const bifurque: Intent[] = ["prix", "delai", "realisations", "comparaison", "trop_cher", "maintenance", "contact", "devis"];
    if (toujoursEnAttente && bifurque.includes(intent) && confidence >= 0.4) {
      const r = answerByIntent(intent, { catalog, entities, tour, path, connaitMetier: Boolean(next.slots.metier) });
      if (r) {
        // On répond à la digression, puis on reprend le fil là où on en
        // était : la question restée sans réponse est reposée à la suite.
        const enAttente = pendingQuestion(next);
        if (enAttente) r.text += `

${enAttente.ask(next)}`;
        return wrap({
          ...r,
          suggestions: enAttente ? enAttente.suggestions : r.suggestions,
          field: enAttente ? enAttente.field(catalog) : null,
        });
      }
    }

    const q = nextQuestion(next);
    if (q) {
      next.posees = [...next.posees, q.key];
      return wrap({ text: q.ask(next), navigate: null, suggestions: q.suggestions, field: q.field(catalog) }, next);
    }
    return recommend(next, catalog);
  }

  /* ── Démarrage d'un entretien ──────────────────────────────── */
  if (intent === "veut_un_site" && confidence >= 0.4) {
    next.mode = "entretien";
    const q = nextQuestion(next);
    if (q) {
      next.posees = [...next.posees, q.key];
      return wrap({ text: q.ask(next), navigate: null, suggestions: q.suggestions, field: q.field(catalog) }, next);
    }
    return recommend(next, catalog);
  }

  /* ── Réponses directes ─────────────────────────────────────── */
  const direct = answerByIntent(intent, { catalog, entities, tour, path, connaitMetier: Boolean(next.slots.metier) });
  if (direct && confidence >= 0.3) return wrap(direct);

  /* ── Une ville citée sans autre intention claire ───────────── */
  if (entities.ville) return wrap(answerVille(entities));

  /* ── Repli documentaire ────────────────────────────────────── */
  const contexte = [next.slots.metier ?? "", path ?? ""].join(" ");
  const hits = search(index, analysis.normalized, { limit: 3, context: contexte });

  if (hits.length > 0 && hits[0].score > 1.2) {
    const top = hits[0].chunk;
    return wrap({
      text: `${condense(top.text)}${top.url !== "/" ? `\n\nLe détail est sur la page ${top.url}.` : ""}`,
      navigate: null,
      suggestions: ["Je veux un site", "Combien ça coûte ?", "Vous contacter"],
    });
  }

  /* ── Aveu d'ignorance, jamais d'invention ──────────────────── */
  return wrap({
    text:
      `Là je n'ai pas la réponse — et je préfère vous le dire plutôt que d'inventer. ` +
      `Écrivez-nous à ${SITE.email} ou passez par le formulaire de contact, vous aurez une vraie réponse sous 24 h ouvrées. ` +
      `Sinon, je sais tout dire sur les tarifs, les délais, les fonctionnalités et le déroulement d'un projet.`,
    navigate: null,
    suggestions: ["Vous contacter", "Combien ça coûte ?", "Vos délais"],
  });
}

/** Aiguillage des intentions vers leur réponse composée. */
function answerByIntent(
  intent: Intent,
  ctx: { catalog: Catalog; entities: Entities; tour: number; path?: string; connaitMetier?: boolean },
): Omit<Reply, "state"> | null {
  const { catalog, entities, tour, path, connaitMetier } = ctx;
  switch (intent) {
    case "prix":
      return answerPrix(catalog, tour, Boolean(connaitMetier));
    case "prix_formule":
      return answerFormules(catalog);
    case "delai":
      return answerDelai(catalog);
    case "maintenance":
      return answerMaintenance(catalog);
    case "mise_en_ligne":
      return answerMiseEnLigne(catalog);
    case "comparaison":
      return answerComparaison(tour);
    case "trop_cher":
      return answerTropCher(catalog);
    case "realisations":
      return answerRealisations();
    case "processus":
      return answerProcessus();
    case "avis":
      return answerAvis();
    case "ville":
      return answerVille(entities);
    case "contact":
      return answerContact();
    case "devis":
      return answerDevis();
    case "explique_page":
      return answerExpliquePage(path);
    case "services":
      return answerServices();
    case "seo":
      return answerSeo(catalog);
    case "autonomie":
      return answerAutonomie(catalog);
    case "responsive":
      return answerResponsive();
    case "refonte":
      return answerRefonte();
    case "identite":
      return answerIdentite();
    case "aide_formulaire":
      return answerAideFormulaire(path);
    case "menu":
      return answerMenu();
    case "propriete_code":
      return answerProprieteCode();
    case "paiement_modalites":
    case "acompte":
      return answerPaiement(catalog);
    case "garantie":
      return answerGarantie();
    case "rgpd":
      return answerRgpd();
    case "securite":
      return answerSecurite();
    case "contenu_textes":
      return answerContenuTextes(catalog);
    case "photos":
      return answerPhotos(catalog);
    case "logo":
      return answerLogo(catalog);
    case "multilingue":
      return answerMultilingue(catalog);
    case "reseaux_sociaux":
      return answerReseaux();
    case "statistiques":
      return answerStatistiques(catalog);
    case "formation":
      return answerFormation();
    case "modifications_apres":
      return answerModificationsApres(catalog);
    case "ecommerce":
      return answerEcommerce(catalog);
    case "accessibilite":
      return answerAccessibilite();
    case "vitesse":
      return answerVitesse(catalog);
    case "engagement_duree":
      return answerEngagement(catalog);
    default:
      return null;
  }
}
