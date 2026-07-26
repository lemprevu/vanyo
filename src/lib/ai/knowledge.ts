/**
 * Base de connaissances de l'assistant Vanyo.
 *
 * Rien n'est ré-écrit ici : chaque fragment est *dérivé* du contenu réel du
 * site (catalogue commercial, pages éditoriales, FAQ, villes, réalisations).
 * Le jour où un prix change dans `catalog.ts` ou une FAQ dans `content.ts`,
 * l'assistant le sait immédiatement — il n'y a pas de copie à resynchroniser.
 *
 * C'est ce qui garantit la règle absolue du système : l'assistant ne peut
 * répondre qu'avec ce qui est réellement écrit sur le site.
 */

import { SITE } from "@/lib/site";
import {
  SERVICES,
  ADVANTAGES,
  PROCESS,
  PROJECTS,
  TESTIMONIALS,
  FAQ,
  ARTICLES,
  STATS,
} from "@/lib/content";
import { CITIES } from "@/lib/cities";
import {
  resolveCatalog,
  packHighlights,
  packDiscountPercent,
  PAGES_UNLIMITED,
  type Catalog,
  type CatalogOverrides,
} from "@/lib/catalog";

export type Chunk = {
  /** Identifiant stable, cité par le modèle dans ses sources. */
  id: string;
  /** Titre lisible du fragment. */
  title: string;
  /** Page du site d'où provient l'information (pour la navigation). */
  url: string;
  /** Rubrique, affichée dans le contexte transmis au modèle. */
  section: string;
  /** Le contenu factuel. C'est la seule chose que le modèle a le droit d'utiliser. */
  text: string;
  /** Termes supplémentaires pour la recherche (synonymes métier, formulations client). */
  keywords?: string[];
};

const eur = (n: number) => `${n.toLocaleString("fr-FR")} €`;

/* ------------------------------------------------------------------ */
/*  Pages du site                                                      */
/* ------------------------------------------------------------------ */

/**
 * Description de chaque page publique. Sert à la fois de connaissance
 * (« que trouve-t-on sur telle page ? ») et de table de navigation pour
 * l'outil `naviguer`.
 */
export const PAGES: { url: string; label: string; purpose: string; keywords: string[] }[] = [
  { url: "/", label: "Accueil", purpose: "Présentation générale de Vanyo, chiffres clés, aperçu des services, formules et avis.", keywords: ["accueil", "home", "page principale", "debut"] },
  { url: "/creation-sites", label: "Création de sites", purpose: "Le cœur de l'offre : types de sites réalisés, ce qui est inclus, pour qui.", keywords: ["creation", "faire un site", "je veux un site", "nouveau site"] },
  { url: "/services", label: "Services", purpose: "Le détail des 15 prestations : vitrine, e-commerce, SEO, hébergement, maintenance, logo…", keywords: ["prestations", "ce que vous faites", "offre"] },
  { url: "/realisations", label: "Réalisations", purpose: "Le portfolio : projets réalisés par catégorie (restaurant, immobilier, e-commerce, portfolio…).", keywords: ["portfolio", "projets", "exemples", "references", "travaux", "vos sites"] },
  { url: "/tarifs", label: "Tarifs", purpose: "Les formules et leurs prix, le comparatif détaillé, les options de mise en ligne et les formules de maintenance.", keywords: ["prix", "cout", "combien", "budget", "devis", "formules", "abonnement"] },
  { url: "/processus", label: "Processus", purpose: "Les 7 étapes d'un projet, de la prise de contact au suivi après livraison.", keywords: ["etapes", "comment ca marche", "deroulement", "methode"] },
  { url: "/pourquoi-vanyo", label: "Pourquoi Vanyo", purpose: "Les arguments et engagements : ce qui distingue Vanyo des autres solutions.", keywords: ["avantages", "pourquoi vous", "difference", "garanties"] },
  { url: "/avis", label: "Avis", purpose: "Les témoignages clients et leurs notes.", keywords: ["temoignages", "clients", "avis", "retours", "notes"] },
  { url: "/blog", label: "Blog", purpose: "Les articles de fond : performance, SEO, conversion, bonnes pratiques web.", keywords: ["articles", "actualites", "conseils", "guides"] },
  { url: "/faq", label: "FAQ", purpose: "Les réponses aux questions les plus fréquentes sur les prix, délais, autonomie, SEO, hébergement.", keywords: ["questions", "faq", "aide"] },
  { url: "/contact", label: "Contact", purpose: "Le formulaire de contact et les coordonnées pour joindre Vanyo.", keywords: ["contacter", "joindre", "parler", "email", "telephone", "rendez-vous", "appeler"] },
  { url: "/devis", label: "Devis", purpose: "Le formulaire de devis détaillé en 8 étapes, avec estimation de prix immédiate.", keywords: ["devis", "estimation", "chiffrage", "prix de mon projet", "simulateur"] },
  { url: "/villes", label: "Villes", purpose: "Les pages locales : création de site par ville, avec contexte économique et FAQ locale.", keywords: ["ville", "local", "region", "proximite", "pres de chez moi"] },
  { url: "/mentions-legales", label: "Mentions légales", purpose: "Les mentions légales du site.", keywords: ["mentions", "legal", "editeur"] },
  { url: "/confidentialite", label: "Confidentialité", purpose: "La politique de confidentialité et le traitement des données personnelles.", keywords: ["rgpd", "donnees", "vie privee", "cookies"] },
];

/* ------------------------------------------------------------------ */
/*  Construction de la base                                            */
/* ------------------------------------------------------------------ */

/**
 * Assemble tous les fragments à partir du contenu réel.
 * `overrides` = personnalisations de prix faites depuis Paramètres → Tarifs,
 * pour que l'assistant annonce exactement les prix affichés au visiteur.
 */
export function buildKnowledge(overrides?: CatalogOverrides | null): Chunk[] {
  const catalog = resolveCatalog(overrides);
  const chunks: Chunk[] = [];
  const add = (c: Chunk) => chunks.push(c);

  /* ── Identité ────────────────────────────────────────────── */
  add({
    id: "identite",
    title: `Qui est ${SITE.name}`,
    url: "/",
    section: "Présentation",
    text: `${SITE.name} est une ${SITE.tagline.toLowerCase()}. ${SITE.description} L'agence travaille 100 % à distance depuis la France, sans local physique — ce qui permet des tarifs plus compétitifs et des échanges par téléphone, visio ou email. Zone d'intervention : ${SITE.address}. Horaires : ${SITE.hours}. Email : ${SITE.email}.`,
    keywords: ["vanyo", "agence", "qui etes vous", "presentation", "adresse", "ou", "horaires", "distance"],
  });

  add({
    id: "chiffres",
    title: "Chiffres clés de l'agence",
    url: "/",
    section: "Présentation",
    text: STATS.map((s) => `${s.label} : ${s.value}${s.suffix ?? ""}`).join(" · ") + ".",
    keywords: ["chiffres", "statistiques", "experience", "nombre de sites", "delai moyen"],
  });

  /* ── Pages ───────────────────────────────────────────────── */
  add({
    id: "plan-du-site",
    title: "Les pages du site",
    url: "/",
    section: "Navigation",
    text:
      "Pages disponibles sur le site : " +
      PAGES.map((p) => `${p.label} (${p.url}) — ${p.purpose}`).join(" ; "),
    keywords: ["pages", "navigation", "menu", "plan du site", "ou trouver"],
  });

  for (const page of PAGES) {
    add({
      id: `page-${page.url === "/" ? "accueil" : page.url.slice(1)}`,
      title: `Page ${page.label}`,
      url: page.url,
      section: "Navigation",
      text: `La page « ${page.label} » se trouve à l'adresse ${page.url}. ${page.purpose}`,
      keywords: page.keywords,
    });
  }

  /* ── Services ────────────────────────────────────────────── */
  add({
    id: "services-liste",
    title: "Liste des services",
    url: "/services",
    section: "Services",
    text:
      "Vanyo propose " +
      SERVICES.length +
      " prestations : " +
      SERVICES.map((s) => `${s.title} — ${s.description}`).join(" ; "),
    keywords: ["services", "prestations", "que faites vous", "offre", "ce que vous proposez"],
  });

  for (const s of SERVICES) {
    add({
      id: `service-${s.slug}`,
      title: `Service : ${s.title}`,
      url: "/services",
      section: "Services",
      text: `${s.title} : ${s.description}`,
      keywords: [s.slug, s.title.toLowerCase()],
    });
  }

  /* ── Formules et prix ────────────────────────────────────── */
  const cheapest = catalog.packs
    .filter((p) => typeof p.base === "number")
    .reduce<number | null>((min, p) => (min === null || (p.base as number) < min ? (p.base as number) : min), null);

  add({
    id: "prix-general",
    title: "Combien coûte un site chez Vanyo",
    url: "/tarifs",
    section: "Tarifs",
    text:
      (cheapest !== null
        ? `Les sites Vanyo démarrent à ${eur(cheapest)} pour la formule la plus accessible. `
        : "") +
      "Le prix final dépend du nombre de pages, des fonctionnalités choisies, de la mise en ligne et du délai souhaité. " +
      "Le formulaire de devis sur /devis calcule une estimation immédiate et gratuite en 8 étapes, sans engagement. " +
      "Formules disponibles : " +
      catalog.packs
        .map((p) => `${p.name} — ${p.base === null ? "sur devis" : `à partir de ${eur(p.base)}`}`)
        .join(", ") +
      ".",
    keywords: [
      "prix", "combien", "cout", "coute", "tarif", "tarifs", "budget", "cher", "facturez",
      "combien ca coute", "quel est votre prix", "c est combien", "vous facturez combien",
      "prix d un site", "montant", "euros",
    ],
  });

  for (const p of catalog.packs) {
    const remise = packDiscountPercent(p);
    add({
      id: `formule-${p.key}`,
      title: `Formule ${p.name}`,
      url: "/tarifs",
      section: "Tarifs",
      text:
        `Formule ${p.name} — ${p.tagline}. ` +
        `Prix : ${p.base === null ? "sur devis (chiffrage personnalisé après échange)" : `${eur(p.base)}`}` +
        (p.originalPrice ? ` au lieu de ${eur(p.originalPrice)}, soit -${remise} %` : "") +
        `. Pages comprises : ${p.pagesLabel}. Délai : ${p.delai}. Support : ${p.support}. ` +
        (p.maintenanceOfferte > 0 ? `Maintenance offerte les ${p.maintenanceOfferte} premiers mois. ` : "") +
        `Compris sans supplément : ${packHighlights(p, catalog).join(", ")}. ` +
        `Page supplémentaire au-delà du forfait : ${eur(catalog.extraPagePrice)}.` +
        (p.highlight ? " C'est la formule la plus choisie." : ""),
      keywords: [p.key, p.name.toLowerCase(), "formule", "pack", "offre", "prix"],
    });
  }

  add({
    id: "page-supplementaire",
    title: "Prix d'une page supplémentaire",
    url: "/tarifs",
    section: "Tarifs",
    text: `Chaque page au-delà de celles comprises dans la formule est facturée ${eur(catalog.extraPagePrice)}. La formule Premium inclut un nombre de pages illimité (${PAGES_UNLIMITED} au maximum technique).`,
    keywords: ["page supplementaire", "pages en plus", "combien de pages", "ajouter une page"],
  });

  /* ── Modules / fonctionnalités ───────────────────────────── */
  for (const group of catalog.modules.reduce<string[]>((acc, m) => (acc.includes(m.group) ? acc : [...acc, m.group]), [])) {
    const mods = catalog.modules.filter((m) => m.group === group);
    add({
      id: `modules-${group.toLowerCase()}`,
      title: `Fonctionnalités — ${group}`,
      url: "/tarifs",
      section: "Fonctionnalités",
      text:
        `Fonctionnalités de la catégorie « ${group} » : ` +
        mods.map((m) => `${m.label} (${m.price === 0 ? "compris" : eur(m.price)}) — ${m.description}`).join(" ; "),
      keywords: [group.toLowerCase(), "options", "fonctionnalites", "modules"],
    });
  }

  for (const m of catalog.modules) {
    add({
      id: `module-${m.key}`,
      title: `Fonctionnalité : ${m.label}`,
      url: "/tarifs",
      section: "Fonctionnalités",
      text: `${m.label} — ${m.description} Tarif : ${m.price === 0 ? "compris dans les formules" : eur(m.price)} en une fois. Catégorie : ${m.group}. Cette option se coche dans le formulaire de devis.`,
      keywords: [m.key, m.label.toLowerCase()],
    });
  }

  /* ── Mise en ligne ───────────────────────────────────────── */
  add({
    id: "mise-en-ligne",
    title: "Mise en ligne, domaine et hébergement",
    url: "/tarifs",
    section: "Mise en ligne",
    text:
      "Options de mise en ligne : " +
      catalog.deploiements
        .map(
          (d) =>
            `${d.label} (${d.price === 0 ? "inclus" : eur(d.price)}) — ${d.description} Comprend : ${d.includes.join(", ")}`,
        )
        .join(" ; ") +
      ".",
    keywords: [
      "mise en ligne", "deploiement", "installation", "nom de domaine", "domaine",
      "hebergement", "heberger", "ssl", "https", "emails professionnels", "adresse mail",
    ],
  });

  /* ── Maintenance ─────────────────────────────────────────── */
  add({
    id: "maintenance-formules",
    title: "Formules de maintenance mensuelle",
    url: "/tarifs",
    section: "Maintenance",
    text:
      "Maintenance mensuelle, sans engagement de durée : " +
      catalog.maintenancePlans
        .map(
          (p) =>
            `${p.label} (${p.price === 0 ? "0 €" : `${eur(p.price)}/mois`})${p.recommended ? " — recommandée" : ""} — ${p.description} Comprend : ${p.features.join(", ")}`,
        )
        .join(" ; ") +
      ".",
    keywords: [
      "maintenance", "abonnement", "mensuel", "par mois", "suivi", "mises a jour",
      "sauvegarde", "securite", "entretien", "contrat",
    ],
  });

  add({
    id: "maintenance-options",
    title: "Suppléments mensuels de maintenance",
    url: "/tarifs",
    section: "Maintenance",
    text:
      "Suppléments cumulables, ajoutés à une formule de maintenance active : " +
      catalog.maintenanceOptions.map((o) => `${o.label} (+${eur(o.price)}/mois) — ${o.description}`).join(" ; ") +
      ".",
    keywords: ["supplement", "option mensuelle", "en plus par mois", "ajouter maintenance"],
  });

  /* ── Délais ──────────────────────────────────────────────── */
  add({
    id: "delais",
    title: "Délais de livraison",
    url: "/tarifs",
    section: "Délais",
    text:
      "Délais : " +
      catalog.delais.map((d) => `${d.label} (${d.price === 0 ? "inclus" : `+${eur(d.price)}`}) — ${d.description}`).join(" ; ") +
      ". Le délai standard dépend de la formule : " +
      catalog.packs.map((p) => `${p.name} → ${p.delai}`).join(", ") +
      ".",
    keywords: ["delai", "delais", "combien de temps", "quand", "rapidite", "livraison", "urgent", "vite"],
  });

  /* ── Processus ───────────────────────────────────────────── */
  add({
    id: "processus",
    title: "Les étapes d'un projet",
    url: "/processus",
    section: "Processus",
    text:
      "Le déroulement d'un projet Vanyo se fait en " +
      PROCESS.length +
      " étapes : " +
      PROCESS.map((p) => `${p.step}. ${p.title} — ${p.description}`).join(" ; "),
    keywords: ["processus", "etapes", "comment ca se passe", "deroulement", "methode", "organisation"],
  });

  /* ── Arguments ───────────────────────────────────────────── */
  add({
    id: "avantages",
    title: "Pourquoi choisir Vanyo",
    url: "/pourquoi-vanyo",
    section: "Arguments",
    text: ADVANTAGES.map((a) => `${a.title} : ${a.description}`).join(" ; "),
    keywords: [
      "pourquoi vanyo", "avantages", "difference", "pourquoi vous", "garantie",
      "wix", "squarespace", "shopify", "wordpress", "comparaison", "plutot que",
    ],
  });

  /* ── Réalisations ────────────────────────────────────────── */
  add({
    id: "realisations",
    title: "Réalisations et portfolio",
    url: "/realisations",
    section: "Réalisations",
    text:
      "Projets présentés dans le portfolio : " +
      PROJECTS.map((p) => `${p.title} (${p.category}) — ${p.tags.join(", ")}`).join(" ; ") +
      ". Le portfolio est filtrable par catégorie sur la page /realisations.",
    keywords: ["realisations", "portfolio", "exemples", "projets", "vos sites", "references", "montrez"],
  });

  /* ── Avis ────────────────────────────────────────────────── */
  add({
    id: "avis",
    title: "Avis clients",
    url: "/avis",
    section: "Avis",
    text: TESTIMONIALS.map((t) => `${t.name} (${t.company}, ${t.rating}/5) : « ${t.quote} »`).join(" ; "),
    keywords: ["avis", "temoignages", "clients", "satisfaction", "retours", "notes", "avis google"],
  });

  /* ── FAQ ─────────────────────────────────────────────────── */
  for (const [i, f] of FAQ.entries()) {
    add({
      id: `faq-${i}`,
      title: f.question,
      url: "/faq",
      section: "FAQ",
      text: `Question fréquente : « ${f.question} » — Réponse : ${f.answer}`,
      keywords: ["faq", "question"],
    });
  }

  /* ── Blog ────────────────────────────────────────────────── */
  add({
    id: "blog-index",
    title: "Articles du blog",
    url: "/blog",
    section: "Blog",
    text:
      "Articles publiés : " +
      ARTICLES.map((a) => `« ${a.title} » (${a.category}, ${a.readingTime}) — ${a.excerpt} → /blog/${a.slug}`).join(" ; "),
    keywords: ["blog", "articles", "conseils", "guides", "lecture"],
  });

  for (const a of ARTICLES) {
    if (!a.content) continue;
    // On garde le corps de l'article, débarrassé du balisage de titre, pour
    // que l'assistant puisse répondre sur le fond et non seulement citer.
    const body = a.content.replace(/^## /gm, "").replace(/\s+/g, " ").slice(0, 2400);
    add({
      id: `article-${a.slug}`,
      title: `Article : ${a.title}`,
      url: `/blog/${a.slug}`,
      section: "Blog",
      text: `${a.title} (${a.category}) — ${body}`,
      keywords: [a.slug, a.category.toLowerCase()],
    });
  }

  /* ── Villes ──────────────────────────────────────────────── */
  add({
    id: "villes-index",
    title: "Villes couvertes",
    url: "/villes",
    section: "Villes",
    text:
      "Vanyo travaille à distance partout en France. Des pages locales existent pour : " +
      CITIES.map((c) => `${c.name} (${c.department}, ${c.region}) → /villes/${c.slug}`).join(", ") +
      ".",
    keywords: ["ville", "villes", "region", "departement", "local", "pres de chez moi", "secteur"],
  });

  for (const c of CITIES) {
    add({
      id: `ville-${c.slug}`,
      title: `Création de site à ${c.name}`,
      url: `/villes/${c.slug}`,
      section: "Villes",
      text:
        `${c.name} (${c.department}, ${c.region}, ${c.population} habitants). ${c.intro} ` +
        `Secteurs mis en avant : ${c.sectors.join(" ; ")}. ` +
        c.faq.map((f) => `${f.question} ${f.answer}`).join(" "),
      keywords: [c.slug, c.name.toLowerCase(), c.department.toLowerCase(), c.region.toLowerCase()],
    });
  }

  /* ── Formulaires ─────────────────────────────────────────── */
  add({
    id: "formulaire-devis",
    title: "Comment fonctionne le formulaire de devis",
    url: "/devis",
    section: "Formulaires",
    text:
      "Le formulaire de devis (/devis) se remplit en 8 étapes : 1. Projet (type de site et objectifs, plusieurs choix possibles) ; " +
      "2. Formule (ou « conseillez-moi » si vous hésitez) ; 3. Pages & contenu (nombre de pages, qui fournit textes et images) ; " +
      "4. Fonctionnalités (les options à cocher) ; 5. Mise en ligne (installation, domaine, emails) ; 6. Maintenance (formule mensuelle et suppléments) ; " +
      "7. Style & vision (style visuel, couleurs, inspirations) ; 8. Coordonnées. " +
      "L'estimation de prix se met à jour en direct à chaque réponse. Le formulaire est gratuit, sans engagement, et une réponse est apportée sous 24 h ouvrées. " +
      "Aucun paiement n'est demandé dans le formulaire.",
    keywords: ["formulaire", "devis", "remplir", "etapes", "champs", "estimation", "simulateur", "comment demander"],
  });

  add({
    id: "formulaire-contact",
    title: "Comment nous contacter",
    url: "/contact",
    section: "Formulaires",
    text:
      `Le formulaire de contact (/contact) demande nom, email, sujet et message. Vous pouvez aussi écrire directement à ${SITE.email}. ` +
      `Réponse sous 24 h ouvrées, du lundi au vendredi (${SITE.hours}). Pour un projet précis, le formulaire de devis (/devis) est plus adapté : il permet d'obtenir une estimation chiffrée immédiate.`,
    keywords: ["contact", "contacter", "joindre", "email", "ecrire", "appeler", "rendez-vous", "parler a quelqu un"],
  });

  /* ── Engagements ─────────────────────────────────────────── */
  add({
    id: "engagements",
    title: "Ce qui est garanti dans chaque projet",
    url: "/pourquoi-vanyo",
    section: "Arguments",
    text:
      "Chaque site livré par Vanyo est responsive (mobile, tablette, ordinateur), optimisé pour la vitesse et le référencement Google dès la conception, " +
      "et livré avec un panel d'administration permettant de modifier soi-même textes, images et contenus sans compétence technique. " +
      "Le code et le site appartiennent au client. Une refonte préserve le référencement existant. " +
      "L'agence est 100 % à distance : pas de local, donc des tarifs plus compétitifs.",
    keywords: [
      "garantie", "inclus", "responsive", "mobile", "seo", "autonomie", "modifier moi meme",
      "proprietaire", "code source", "refonte", "engagement",
    ],
  });

  return chunks;
}

/** Petit récapitulatif chiffré, injecté systématiquement dans le prompt. */
export function catalogSummary(catalog: Catalog): string {
  return (
    "Formules : " +
    catalog.packs
      .map((p) => `${p.name} ${p.base === null ? "(sur devis)" : eur(p.base)}, ${p.pagesLabel}`)
      .join(" | ") +
    `. Page supplémentaire ${eur(catalog.extraPagePrice)}. ` +
    "Maintenance : " +
    catalog.maintenancePlans.map((m) => `${m.label} ${m.price === 0 ? "0 €" : `${eur(m.price)}/mois`}`).join(" | ") +
    "."
  );
}
