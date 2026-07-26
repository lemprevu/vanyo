/**
 * Recherche dans la base de connaissances (RAG).
 *
 * Choix d'architecture : recherche lexicale BM25 avec normalisation française,
 * racinisation légère et expansion par synonymes — plutôt que des embeddings
 * vectoriels.
 *
 * Pourquoi : le corpus fait ~150 fragments courts et très factuels. À cette
 * échelle, BM25 + synonymes est *plus* précis qu'une similarité vectorielle
 * (qui rapproche les formulations vagues), tout en étant instantané, gratuit,
 * et sans dépendance extérieure ni base vectorielle à synchroniser. La table
 * de synonymes ci-dessous est ce qui fait que « Combien coûte un site ? »,
 * « Quel est votre prix ? », « C'est combien ? » et « Vous facturez
 * combien ? » retombent tous sur le même fragment.
 *
 * Si le contenu grossit d'un ordre de grandeur, la fonction `search()` peut
 * être doublée d'un index vectoriel sans changer son interface.
 */

import type { Chunk } from "./knowledge";

/* ------------------------------------------------------------------ */
/*  Normalisation                                                      */
/* ------------------------------------------------------------------ */

/** Minuscules + suppression des accents et de la ponctuation. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Mots vides français : trop fréquents pour discriminer quoi que ce soit. */
const STOPWORDS = new Set(
  ("a ai au aux avec ce ces dans de des du elle en est et eux il ils je la le les leur lui ma mais me meme mes moi mon " +
    "ne nos notre nous on ou par pas pour qu que qui sa se ses son sur ta te tes toi ton tu un une vos votre vous y " +
    "c d j l m n s t si comme donc alors plus moins tres bien tout tous toute toutes cela ca ceci celui celle " +
    "etre avoir faire fait fais dire quoi dont lors chez sans sous entre vers apres avant aussi encore deja " +
    "bonjour bonsoir salut merci svp stp").split(" "),
);

/**
 * Racinisation très légère : on coupe les terminaisons françaises les plus
 * courantes pour que « tarifs » ≈ « tarif », « coûte » ≈ « cout »,
 * « hébergement » ≈ « héberge ». Volontairement conservateur — un stemmer
 * agressif crée plus de faux positifs qu'il n'améliore le rappel.
 */
function stem(w: string): string {
  if (w.length <= 4) return w;
  for (const suf of ["ements", "ement", "ations", "ation", "ances", "ance", "euses", "euse", "eurs", "eur", "ives", "ive", "aux", "ales", "ale", "els", "elle", "ies", "ie", "es", "s", "e"]) {
    if (w.length - suf.length >= 4 && w.endsWith(suf)) return w.slice(0, w.length - suf.length);
  }
  return w;
}

/**
 * Synonymes et reformulations. Chaque clé est un terme (déjà normalisé) ;
 * les valeurs sont ajoutées à la requête pour élargir la recherche.
 *
 * C'est ici qu'on encode le vocabulaire réel des visiteurs : ils écrivent
 * rarement les mots exacts du site.
 */
const SYNONYMS: Record<string, string[]> = {
  // Prix
  cout: ["prix", "tarif", "combien"],
  coute: ["prix", "tarif", "combien"],
  couter: ["prix", "tarif", "combien"],
  prix: ["tarif", "cout", "combien", "budget"],
  tarif: ["prix", "cout", "combien"],
  facture: ["prix", "tarif", "cout"],
  facturez: ["prix", "tarif", "cout"],
  budget: ["prix", "tarif", "formule"],
  cher: ["prix", "tarif", "cout"],
  gratuit: ["prix", "devis", "estimation"],
  euro: ["prix", "tarif"],
  euros: ["prix", "tarif"],
  payer: ["prix", "tarif", "paiement"],
  paiement: ["prix", "tarif"],
  // Offre
  formule: ["pack", "offre", "tarif", "starter", "business", "premium"],
  offre: ["formule", "pack", "tarif"],
  pack: ["formule", "offre"],
  abonnement: ["maintenance", "mensuel"],
  mensuel: ["maintenance", "abonnement"],
  mois: ["mensuel", "maintenance"],
  // Délais
  delai: ["temps", "duree", "rapidite", "livraison"],
  temps: ["delai", "duree"],
  duree: ["delai", "temps"],
  rapide: ["delai", "vitesse", "performance"],
  urgent: ["delai", "prioritaire"],
  quand: ["delai", "temps"],
  // Réalisations
  exemple: ["realisation", "portfolio", "projet"],
  exemples: ["realisation", "portfolio", "projet"],
  realisation: ["portfolio", "projet", "exemple"],
  portfolio: ["realisation", "projet", "exemple"],
  travail: ["realisation", "portfolio"],
  montrer: ["realisation", "portfolio"],
  montre: ["realisation", "portfolio"],
  voir: ["realisation", "portfolio", "page"],
  // Contact
  contacter: ["contact", "joindre", "email", "telephone"],
  joindre: ["contact", "email", "telephone"],
  parler: ["contact", "echange", "rendez"],
  appeler: ["contact", "telephone"],
  rendez: ["contact", "echange"],
  discuter: ["contact", "echange"],
  // Technique
  seo: ["referencement", "google", "visibilite"],
  referencement: ["seo", "google", "visibilite"],
  google: ["seo", "referencement"],
  hebergement: ["heberger", "serveur", "mise en ligne"],
  domaine: ["nom de domaine", "adresse", "mise en ligne"],
  mail: ["email", "adresse", "boite"],
  boutique: ["ecommerce", "vente", "vendre"],
  vendre: ["ecommerce", "boutique", "vente"],
  ecommerce: ["boutique", "vendre", "vente"],
  restaurant: ["reservation", "menu"],
  responsive: ["mobile", "telephone", "tablette"],
  mobile: ["responsive", "telephone"],
  modifier: ["admin", "panel", "autonomie", "gerer"],
  gerer: ["admin", "panel", "modifier"],
  admin: ["panel", "administration", "modifier"],
  refonte: ["refaire", "moderniser", "existant"],
  refaire: ["refonte", "existant"],
  logo: ["charte", "identite", "graphique"],
  // Concurrence
  wix: ["comparaison", "avantage", "pourquoi"],
  squarespace: ["comparaison", "avantage", "pourquoi"],
  wordpress: ["comparaison", "avantage", "pourquoi"],
  shopify: ["comparaison", "ecommerce", "comparaison"],
  concurrent: ["comparaison", "avantage"],
  difference: ["avantage", "pourquoi", "comparaison"],
  // Divers
  devis: ["estimation", "chiffrage", "formulaire", "prix"],
  estimation: ["devis", "prix", "chiffrage"],
  etape: ["processus", "deroulement"],
  processus: ["etape", "deroulement", "methode"],
  avis: ["temoignage", "client", "retour"],
  garantie: ["engagement", "inclus"],
  maintenance: ["suivi", "abonnement", "entretien", "mise a jour"],
  ville: ["local", "region", "proximite"],
};

/**
 * Termes ambigus : « combien » veut dire « quel prix » la plupart du temps,
 * mais pas dans « combien de temps » ni « combien de pages ». On n'ajoute
 * donc leurs synonymes que si la requête ne contient aucun terme concurrent
 * qui lève l'ambiguïté.
 */
const AMBIGUOUS: Record<string, { expand: string[]; blockedBy: string[] }> = {
  combien: {
    expand: ["prix", "tarif", "cout", "budget"],
    blockedBy: ["temps", "delai", "delais", "duree", "jours", "semaines", "mois", "pages", "page", "personnes", "villes"],
  },
};

export type Token = string;

/** Découpe et normalise un texte en tokens racinisés, sans mots vides. */
export function tokenize(text: string): Token[] {
  return normalize(text)
    .split(" ")
    .filter((w) => w.length > 1 && !STOPWORDS.has(w))
    .map(stem);
}

/** Tokens de la requête, enrichis des synonymes connus. */
function expandQuery(query: string): Token[] {
  const raw = normalize(query).split(" ").filter(Boolean);
  const out = new Set<Token>();

  for (const w of raw) {
    if (w.length > 1 && !STOPWORDS.has(w)) out.add(stem(w));

    const ambiguous = AMBIGUOUS[w];
    if (ambiguous && !raw.some((other) => ambiguous.blockedBy.includes(other))) {
      for (const syn of ambiguous.expand) for (const t of tokenize(syn)) out.add(t);
    }

    for (const syn of SYNONYMS[w] ?? []) {
      for (const t of tokenize(syn)) out.add(t);
    }
  }
  // Bigrammes utiles ("nom de domaine", "mise en ligne") : on ajoute les
  // paires de mots pleins, ce qui renforce les fragments qui les contiennent.
  return [...out];
}

/* ------------------------------------------------------------------ */
/*  Index BM25                                                         */
/* ------------------------------------------------------------------ */

type Doc = { chunk: Chunk; tf: Map<Token, number>; length: number };

export type SearchIndex = {
  docs: Doc[];
  df: Map<Token, number>;
  avgLength: number;
};

/** Construit l'index. À faire une seule fois par jeu de données (mis en cache). */
export function buildIndex(chunks: Chunk[]): SearchIndex {
  const docs: Doc[] = [];
  const df = new Map<Token, number>();

  for (const chunk of chunks) {
    // Le titre et les mots-clés pèsent plus lourd que le corps : ce sont eux
    // qui portent l'intention, le corps porte le détail.
    const tokens = [
      ...tokenize(chunk.title),
      ...tokenize(chunk.title),
      ...tokenize(chunk.title),
      ...(chunk.keywords ?? []).flatMap((k) => [...tokenize(k), ...tokenize(k), ...tokenize(k), ...tokenize(k)]),
      ...tokenize(chunk.section),
      ...tokenize(chunk.text),
    ];

    const tf = new Map<Token, number>();
    for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
    for (const t of tf.keys()) df.set(t, (df.get(t) ?? 0) + 1);

    docs.push({ chunk, tf, length: tokens.length });
  }

  const avgLength = docs.reduce((s, d) => s + d.length, 0) / Math.max(1, docs.length);
  return { docs, df, avgLength };
}

const K1 = 1.4;
const B = 0.72;

export type SearchHit = { chunk: Chunk; score: number };

/**
 * Renvoie les `limit` fragments les plus pertinents pour la requête.
 * `context` (page en cours, message précédent…) élargit doucement la requête
 * pour que « et le prix ? » après une question sur la maintenance retrouve
 * bien la maintenance.
 */
export function search(
  index: SearchIndex,
  query: string,
  { limit = 8, context = "" }: { limit?: number; context?: string } = {},
): SearchHit[] {
  const terms = expandQuery(query);
  const contextTerms = context ? expandQuery(context) : [];
  if (terms.length === 0 && contextTerms.length === 0) return [];

  const N = index.docs.length;
  const scored: SearchHit[] = [];

  for (const doc of index.docs) {
    let score = 0;

    const accumulate = (list: Token[], weight: number) => {
      for (const t of list) {
        const f = doc.tf.get(t);
        if (!f) continue;
        const n = index.df.get(t) ?? 0;
        const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
        const norm = f * (K1 + 1);
        const denom = f + K1 * (1 - B + (B * doc.length) / index.avgLength);
        score += weight * idf * (norm / denom);
      }
    };

    accumulate(terms, 1);
    // Le contexte compte, mais ne doit jamais dominer la question posée.
    accumulate(contextTerms, 0.25);

    if (score > 0) scored.push({ chunk: doc.chunk, score });
  }

  scored.sort((a, b) => b.score - a.score);

  // Garde-fou : on écarte le bruit très en dessous du meilleur résultat,
  // pour ne pas noyer le modèle dans des fragments hors sujet.
  const best = scored[0]?.score ?? 0;
  return scored.filter((h) => h.score >= best * 0.12).slice(0, limit);
}
