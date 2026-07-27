/**
 * Compréhension du langage — 100 % maison, aucun service extérieur.
 *
 * Trois couches :
 *  1. tolérance aux fautes de frappe (distance de Levenshtein bornée) ;
 *  2. détection d'intention par faisceau d'indices pondérés ;
 *  3. extraction d'entités (métier, ville, nombre de pages, budget, oui/non).
 *
 * Le pari : sur un domaine fermé — un site d'agence web — le vocabulaire des
 * visiteurs est fini. Une centaine d'expressions couvre l'écrasante majorité
 * des questions. Ce moteur est donc plus prévisible qu'un modèle génératif :
 * il ne peut structurellement pas inventer un prix, et il répond en une
 * milliseconde, gratuitement, sans limite d'usage.
 */

import { normalize } from "./retrieval";
import { CITIES } from "@/lib/cities";
import { SERVICES } from "@/lib/content";

/* ------------------------------------------------------------------ */
/*  Tolérance aux fautes de frappe                                     */
/* ------------------------------------------------------------------ */

/** Distance d'édition, abandonnée dès qu'elle dépasse `max` (rapide). */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const v = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + cost);
      row.push(v);
      if (v < best) best = v;
    }
    if (best > max) return max + 1;
    prev = row;
  }
  return prev[b.length];
}

/**
 * Le mot `word` correspond-il à `target`, fautes de frappe comprises ?
 * Tolérance proportionnelle : aucune sur les mots courts (trop de collisions),
 * une faute à partir de 5 lettres, deux à partir de 9.
 */
export function fuzzyEquals(word: string, target: string): boolean {
  if (word === target) return true;
  const len = Math.min(word.length, target.length);
  if (len < 5) return false;
  const tolerance = len >= 9 ? 2 : 1;
  return editDistance(word, target, tolerance) <= tolerance;
}

/** Le texte contient-il ce mot (fautes tolérées) ? */
function containsWord(words: string[], target: string): boolean {
  return words.some((w) => fuzzyEquals(w, target));
}

/** Le texte contient-il cette expression (chaque mot, dans l'ordre) ? */
function containsPhrase(words: string[], phrase: string): boolean {
  const parts = phrase.split(" ");
  if (parts.length === 1) return containsWord(words, parts[0]);
  for (let i = 0; i + parts.length <= words.length; i++) {
    if (parts.every((p, k) => fuzzyEquals(words[i + k], p))) return true;
  }
  return false;
}

/* ------------------------------------------------------------------ */
/*  Langage SMS                                                        */
/* ------------------------------------------------------------------ */

/**
 * Abréviations courantes en français écrit rapide. Elles sont trop courtes
 * pour que la tolérance aux fautes les rattrape (« tps » n'est pas à une
 * lettre de « temps »), et pourtant très fréquentes dans un chat — surtout
 * sur mobile. Elles sont donc traduites avant toute analyse.
 */
const ABBREVIATIONS: Record<string, string> = {
  tps: "temps", tmps: "temps", cb: "combien", cbien: "combien", combn: "combien",
  pk: "pourquoi", pq: "pourquoi", pkoi: "pourquoi", qd: "quand", kan: "quand",
  pr: "pour", pou: "pour", ds: "dans", bcp: "beaucoup", tjs: "toujours", tjrs: "toujours",
  mtn: "maintenant", ajd: "aujourd hui", auj: "aujourd hui",
  vs: "vous", vou: "vous", ns: "nous", ms: "mais", dc: "donc", ss: "sans",
  jsp: "je sais pas", jspas: "je sais pas", jai: "j ai", ya: "il y a", ptet: "peut etre",
  fo: "faut", fau: "faut", ke: "que", ki: "qui", kel: "quel", kelle: "quelle",
  sa: "ca", sava: "ca va", tt: "tout", ts: "tous", qq: "quelque", qqch: "quelque chose",
  dsl: "desole", stp: "s il vous plait", svp: "s il vous plait", slt: "salut",
  bjr: "bonjour", bsr: "bonsoir", mrc: "merci", rdv: "rendez vous",
  pb: "probleme", pbm: "probleme", pblm: "probleme", info: "information", infos: "informations",
  site: "site", sit: "site", net: "internet", web: "internet",
  eur: "euros", e: "euros", "€": "euros",
  presta: "prestation", maintenence: "maintenance", refer: "referencement",
};

/** Traduit le langage SMS d'un texte déjà normalisé. */
function expandAbbreviations(words: string[]): string[] {
  const out: string[] = [];
  for (const w of words) {
    const full = ABBREVIATIONS[w];
    if (full) out.push(...full.split(" "));
    else out.push(w);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/*  Intentions                                                         */
/* ------------------------------------------------------------------ */

export type Intent =
  | "salutation"
  | "remerciement"
  | "aurevoir"
  | "identite"
  | "veut_un_site"
  | "prix"
  | "prix_formule"
  | "delai"
  | "realisations"
  | "services"
  | "maintenance"
  | "mise_en_ligne"
  | "seo"
  | "autonomie"
  | "responsive"
  | "refonte"
  | "contact"
  | "devis"
  | "processus"
  | "comparaison"
  | "trop_cher"
  | "avis"
  | "ville"
  | "aide_formulaire"
  | "explique_page"
  | "oui"
  | "non"
  | "hors_sujet"
  | "inconnu";

type Rule = {
  intent: Intent;
  /** Expressions décisives : leur présence emporte fortement la décision. */
  strong?: string[];
  /** Indices ordinaires, cumulables. */
  weak?: string[];
  /** Si l'un de ces termes est présent, la règle ne s'applique pas. */
  unless?: string[];
};

/**
 * L'ordre n'a pas d'importance : chaque règle marque des points, la meilleure
 * l'emporte. `strong` vaut 10 points, `weak` 3.
 */
const RULES: Rule[] = [
  { intent: "salutation", strong: ["bonjour", "bonsoir", "salut", "coucou", "hello", "hey"] },
  { intent: "remerciement", strong: ["merci", "nickel", "parfait", "super genial", "impeccable"] },
  { intent: "aurevoir", strong: ["au revoir", "aurevoir", "bonne journee", "a bientot", "bye", "ciao"] },

  {
    intent: "identite",
    strong: ["qui etes vous", "qui est vanyo", "c est quoi vanyo", "vous etes qui", "presentez vous"],
    weak: ["agence", "equipe", "vanyo"],
  },

  {
    intent: "veut_un_site",
    strong: [
      "je veux un site", "je voudrais un site", "j aimerais un site", "je souhaite un site",
      "creer un site", "faire un site", "creation de site", "besoin d un site",
      "refaire mon site", "monter un site", "avoir un site", "lancer un site",
      "je cherche un site", "il me faut un site", "je veux une boutique", "creer une boutique",
    ],
    weak: ["projet", "site internet", "site web"],
  },

  {
    intent: "prix",
    strong: [
      "combien coute", "combien ca coute", "c est combien", "quel prix", "quels prix",
      "quel est votre prix", "vous facturez combien", "ca coute combien", "combien pour",
      "prix d un site", "tarif d un site", "combien je vais payer",
    ],
    weak: ["prix", "tarif", "tarifs", "cout", "couter", "budget", "euros", "payer", "facture"],
    unless: ["temps", "delai", "delais", "duree", "jours", "semaines"],
  },
  {
    intent: "prix_formule",
    strong: ["formule starter", "formule business", "formule premium", "sur mesure", "vos formules", "quelles formules", "difference entre les formules"],
    weak: ["formule", "pack", "offre", "starter", "business", "premium"],
  },

  {
    intent: "delai",
    strong: [
      "combien de temps", "quel delai", "quels delais", "en combien de temps",
      "ca prend combien", "c est long", "delai de livraison", "quand sera",
      "sous combien de temps", "vous livrez quand", "c est rapide",
    ],
    weak: ["delai", "delais", "duree", "temps", "rapide", "urgent", "jours", "semaines", "livraison"],
  },

  {
    intent: "realisations",
    strong: [
      "montrez moi vos realisations", "voir vos realisations", "vos realisations",
      "votre portfolio", "des exemples", "exemples de sites", "vos projets",
      "ce que vous avez fait", "vos references", "montrez moi",
    ],
    weak: ["realisation", "realisations", "portfolio", "exemple", "exemples", "projets", "references"],
  },

  {
    intent: "services",
    strong: ["que faites vous", "vos services", "vos prestations", "qu est ce que vous proposez", "vous faites quoi"],
    weak: ["service", "services", "prestation", "prestations", "proposez"],
  },

  {
    intent: "maintenance",
    strong: ["formule de maintenance", "contrat de maintenance", "abonnement mensuel", "apres la livraison", "et apres"],
    weak: ["maintenance", "abonnement", "mensuel", "entretien", "suivi", "sauvegarde", "mises a jour"],
  },

  {
    intent: "mise_en_ligne",
    strong: ["nom de domaine", "mise en ligne", "vous hebergez", "adresse email professionnelle", "boite mail"],
    weak: ["domaine", "hebergement", "heberger", "serveur", "installation", "deploiement", "ssl", "emails"],
  },

  {
    intent: "seo",
    strong: ["referencement google", "etre sur google", "premier sur google", "visible sur google", "le seo est inclus"],
    weak: ["seo", "referencement", "google", "visibilite", "positionnement", "mots cles"],
  },

  {
    intent: "autonomie",
    strong: [
      "modifier moi meme", "modifier mon site", "gerer mon site", "je pourrai modifier",
      "changer les textes", "mettre a jour moi meme", "panel administrateur", "back office",
    ],
    weak: ["modifier", "gerer", "autonomie", "admin", "administration", "panel"],
  },

  { intent: "responsive", strong: ["sur mobile", "adapte au mobile", "sur telephone", "sur tablette"], weak: ["mobile", "responsive", "telephone", "tablette", "smartphone"] },

  { intent: "refonte", strong: ["refaire mon site existant", "moderniser mon site", "j ai deja un site", "refonte de site"], weak: ["refonte", "refaire", "existant", "moderniser", "ancien site"] },

  {
    intent: "contact",
    strong: [
      "je veux vous contacter", "vous contacter", "comment vous joindre", "vous joindre",
      "parler a quelqu un", "prendre rendez vous", "vous appeler", "votre email", "votre telephone",
    ],
    weak: ["contact", "contacter", "joindre", "rendez vous", "appeler", "telephone", "email"],
  },

  {
    intent: "devis",
    strong: ["faire un devis", "je veux un devis", "demander un devis", "avoir un devis", "une estimation", "chiffrer mon projet"],
    weak: ["devis", "estimation", "chiffrage", "simulateur"],
  },

  {
    intent: "processus",
    strong: ["comment ca se passe", "comment ca marche", "les etapes", "votre methode", "le deroulement", "on commence comment"],
    weak: ["etape", "etapes", "processus", "deroulement", "methode"],
  },

  {
    intent: "comparaison",
    strong: ["pourquoi vous", "pourquoi vanyo", "plutot que wix", "par rapport a wix", "et wix", "wix ou", "difference avec"],
    weak: ["wix", "squarespace", "shopify", "wordpress", "concurrent", "concurrents", "difference", "avantage", "avantages", "mieux"],
  },

  {
    intent: "trop_cher",
    strong: ["c est cher", "trop cher", "c est trop", "je trouve ca cher", "j ai pas le budget", "petit budget", "pas les moyens"],
    weak: ["cher", "couteux", "hesite", "reflechir"],
  },

  { intent: "avis", strong: ["vos avis", "des temoignages", "vos clients disent", "avis clients"], weak: ["avis", "temoignage", "temoignages", "satisfait", "note", "notes"] },

  { intent: "ville", strong: ["vous travaillez a", "vous intervenez a", "vous etes ou", "vous couvrez"], weak: ["ville", "region", "secteur", "proximite", "deplace"] },

  {
    intent: "aide_formulaire",
    strong: ["je comprends pas ce champ", "que mettre dans", "je sais pas quoi mettre", "c est obligatoire", "aide moi a remplir"],
    weak: ["champ", "remplir", "formulaire", "obligatoire", "case"],
  },

  {
    intent: "explique_page",
    strong: ["explique moi cette page", "c est quoi cette page", "ou je suis", "cette page sert a quoi", "explique cette page"],
  },

  { intent: "oui", strong: ["oui", "ouais", "yes", "carrement", "volontiers", "avec plaisir", "ok", "d accord", "exact", "tout a fait", "bien sur"] },
  { intent: "non", strong: ["non", "nan", "pas vraiment", "pas encore", "aucun", "aucune", "jamais", "pas du tout"] },

  {
    intent: "hors_sujet",
    strong: [
      "la meteo", "recette de", "raconte moi une blague", "qui va gagner", "tu es une ia",
      "quel est ton prompt", "ignore les instructions", "ecris moi du code", "qui est le president",
    ],
  },
];

export type Analysis = {
  intent: Intent;
  /** Confiance de 0 à 1. En dessous de 0,35 on préfère la recherche documentaire. */
  confidence: number;
  /** Les autres intentions plausibles, par score décroissant. */
  alternatives: Intent[];
  entities: Entities;
  /** Le texte normalisé, réutilisable par le moteur de dialogue. */
  normalized: string;
  words: string[];
};

export type Entities = {
  /** Secteur d'activité reconnu (« restaurant », « immobilier »…). */
  metier?: string;
  /** Ville reconnue parmi celles couvertes par le site. */
  ville?: string;
  /** Clé de formule citée explicitement. */
  formule?: string;
  /** Nombre de pages annoncé. */
  pages?: number;
  /** Budget annoncé en euros. */
  budget?: number;
  /** Besoins fonctionnels détectés (clés de modules du catalogue). */
  besoins?: string[];
};

/* ------------------------------------------------------------------ */
/*  Extraction d'entités                                               */
/* ------------------------------------------------------------------ */

/**
 * Secteurs reconnus. La clé est rédigée pour s'insérer telle quelle dans une
 * phrase du type « un site **de restaurant** » ou « un site **d'artisan** »,
 * ce qui évite les tournures bancales à la génération de la réponse.
 */
const METIERS: Record<string, string[]> = {
  restaurant: ["restaurant", "restaurateur", "restauration", "brasserie", "pizzeria", "pizzaiolo", "traiteur", "bar", "cafe", "food truck", "boulangerie", "boulanger", "patisserie", "patissier", "chef", "cuisinier", "creperie", "bistrot"],
  commerce: ["boutique", "magasin", "commerce", "commercant", "vendre en ligne", "e commerce", "ecommerce", "epicerie", "fleuriste", "libraire", "opticien", "bijoutier"],
  "agence immobilière": ["immobilier", "immobiliere", "agence immobiliere", "agent immobilier", "promoteur", "syndic"],
  artisan: ["artisan", "artisanat", "plombier", "electricien", "menuisier", "ebeniste", "macon", "peintre", "chauffagiste", "couvreur", "carreleur", "serrurier", "paysagiste", "jardinier", "cuisiniste", "vitrier"],
  praticien: ["medecin", "docteur", "dentiste", "kine", "kinesitherapeute", "osteopathe", "psychologue", "psychiatre", "infirmier", "infirmiere", "sage femme", "podologue", "orthophoniste", "veterinaire", "therapeute", "naturopathe", "dieteticien", "sophrologue"],
  "salon de beauté": ["salon", "coiffeur", "coiffeuse", "esthetique", "estheticienne", "barbier", "onglerie", "massage", "spa", "institut"],
  "profession libérale": ["avocat", "notaire", "comptable", "expert comptable", "huissier", "architecte", "consultant", "formateur", "coach", "geometre"],
  association: ["association", "club", "ong", "fondation", "benevole", "collectif"],
  photographe: ["photographe", "videaste", "graphiste", "designer", "illustrateur", "artiste", "musicien", "portfolio", "tatoueur"],
  "entreprise du bâtiment": ["batiment", "travaux", "renovation", "constructeur", "btp", "terrassement", "charpentier"],
  garage: ["garage", "garagiste", "mecanicien", "carrosserie", "concessionnaire", "depanneur"],
  "club de sport": ["salle de sport", "fitness", "yoga", "pilates", "danse", "club sportif", "crossfit", "coach sportif"],
  "entreprise de services": ["entreprise", "societe", "startup", "start up", "pme", "cabinet", "agence", "conseil", "menage", "nettoyage", "securite", "transport", "demenagement"],
};

/** Besoins fonctionnels courants → clés de modules du catalogue. */
const BESOINS: Record<string, string[]> = {
  boutique: ["vendre en ligne", "boutique", "panier", "e commerce", "ecommerce", "vendre mes produits"],
  paiement: ["paiement en ligne", "payer en ligne", "carte bancaire", "encaisser"],
  rdv: ["prendre rendez vous", "rendez vous en ligne", "reservation de creneaux", "agenda en ligne"],
  reservation: ["reserver une table", "reservation", "reserver", "couverts"],
  galerie: ["galerie", "photos", "album", "mes realisations"],
  blog: ["blog", "actualites", "articles", "publier"],
  admin: ["modifier moi meme", "panel", "back office", "gerer mon contenu"],
  seo_avance: ["referencement", "seo", "google", "etre visible"],
  multilingue: ["plusieurs langues", "anglais", "multilingue", "traduire"],
  newsletter: ["newsletter", "mailing", "liste de diffusion"],
  avis: ["avis clients", "recolter des avis", "notes clients"],
  logo: ["logo", "creer un logo", "identite visuelle"],
  espace_client: ["espace client", "connexion", "compte utilisateur", "espace membre"],
};

function extract(words: string[], raw: string): Entities {
  const e: Entities = {};

  for (const [label, terms] of Object.entries(METIERS)) {
    if (terms.some((t) => containsPhrase(words, t))) {
      e.metier = label;
      break;
    }
  }

  const ville = CITIES.find((c) => containsPhrase(words, normalize(c.name)));
  if (ville) e.ville = ville.name;

  for (const key of ["starter", "business", "premium"]) {
    if (containsWord(words, key)) {
      e.formule = key;
      break;
    }
  }
  if (containsPhrase(words, "sur mesure")) e.formule = "surmesure";

  // « 5 pages », « une dizaine de pages »
  const pages = raw.match(/(\d{1,3})\s*(?:pages?|rubriques?|onglets?)/);
  if (pages) {
    const n = Number(pages[1]);
    if (n > 0 && n <= 200) e.pages = n;
  }

  // « 1500 € », « 1500 euros », « budget de 2000 »
  const budget = raw.match(/(\d[\d\s.]{2,6})\s*(?:€|euros?|eur\b)/) || raw.match(/budget[^\d]{0,12}(\d[\d\s.]{2,6})/);
  if (budget) {
    const n = Number(budget[1].replace(/[\s.]/g, ""));
    if (n >= 50 && n <= 200000) e.budget = n;
  }

  const besoins: string[] = [];
  for (const [key, terms] of Object.entries(BESOINS)) {
    if (terms.some((t) => containsPhrase(words, t))) besoins.push(key);
  }
  if (besoins.length) e.besoins = besoins;

  return e;
}

/* ------------------------------------------------------------------ */
/*  Analyse                                                            */
/* ------------------------------------------------------------------ */

/** Services du site, pour reconnaître une question sur une prestation précise. */
const SERVICE_TERMS = SERVICES.map((s) => ({ slug: s.slug, term: normalize(s.title) }));

/** Prestations qui ont leur propre réponse détaillée, plus utile que la liste. */
const SERVICE_TO_INTENT: Record<string, Intent> = {
  maintenance: "maintenance",
  seo: "seo",
  referencement: "seo",
  hebergement: "mise_en_ligne",
  domaine: "mise_en_ligne",
  emails: "mise_en_ligne",
  admin: "autonomie",
  refonte: "refonte",
};

export function analyze(text: string): Analysis {
  const raw = normalize(text);
  const words = expandAbbreviations(raw.split(" ").filter(Boolean));

  const scores = new Map<Intent, number>();
  const bump = (i: Intent, n: number) => scores.set(i, (scores.get(i) ?? 0) + n);

  for (const rule of RULES) {
    if (rule.unless?.some((u) => containsPhrase(words, u))) continue;
    for (const s of rule.strong ?? []) if (containsPhrase(words, s)) bump(rule.intent, 10);
    for (const w of rule.weak ?? []) if (containsPhrase(words, w)) bump(rule.intent, 3);
  }

  // Une prestation nommée explicitement compte, mais ne doit jamais couvrir
  // une intention dédiée : « vous faites de la maintenance ? » parle de
  // maintenance, pas du catalogue de services en général.
  const nommee = SERVICE_TERMS.find((s) => containsPhrase(words, s.term));
  if (nommee) bump(SERVICE_TO_INTENT[nommee.slug] ?? "services", 2);

  // « oui »/« non » seuls sont décisifs ; noyés dans une phrase, ils ne le
  // sont plus — sinon « non, je veux un site » serait lu comme un refus.
  if (words.length > 3) {
    scores.delete("oui");
    scores.delete("non");
  }

  const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]);
  const top = ranked[0];
  const total = ranked.reduce((s, [, v]) => s + v, 0);

  return {
    intent: top ? top[0] : "inconnu",
    // La confiance mesure autant le score absolu que l'écart avec le suivant.
    confidence: top ? Math.min(1, (top[1] / 10) * 0.6 + (top[1] / Math.max(1, total)) * 0.4) : 0,
    alternatives: ranked.slice(1, 4).map(([i]) => i),
    entities: extract(words, raw),
    // La forme développée sert aussi au repli documentaire : la recherche
    // profite ainsi de la même traduction du langage SMS.
    normalized: words.join(" "),
    words,
  };
}
