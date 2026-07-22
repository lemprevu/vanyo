/**
 * Contenu éditorial statique du site.
 * (Le blog, les réalisations et les avis peuvent aussi provenir de Supabase ;
 *  ces données servent de contenu par défaut / de secours.)
 */

export type Stat = { label: string; value: number; suffix?: string; decimals?: number };

export const STATS: Stat[] = [
  { label: "Sites réalisés", value: 180, suffix: "+" },
  { label: "Clients satisfaits", value: 98, suffix: "%" },
  { label: "Livraison moyenne", value: 12, suffix: " j" },
  { label: "Temps de réponse", value: 2, suffix: " h" },
  { label: "Années d'expérience", value: 8, suffix: "+" },
];

export type Service = {
  slug: string;
  title: string;
  description: string;
  icon: string; // nom d'icône lucide
};

export const SERVICES: Service[] = [
  { slug: "vitrine", title: "Site vitrine", description: "Une présence en ligne élégante qui inspire confiance dès la première seconde.", icon: "Globe" },
  { slug: "restaurant", title: "Site restaurant", description: "Menu, réservation, galerie : tout pour remplir votre salle.", icon: "UtensilsCrossed" },
  { slug: "ecommerce", title: "Site e-commerce", description: "Boutique rapide et sécurisée, pensée pour vendre.", icon: "ShoppingCart" },
  { slug: "landing", title: "Landing page", description: "Une page unique redoutablement efficace pour convertir.", icon: "Rocket" },
  { slug: "portfolio", title: "Portfolio", description: "Mettez en valeur votre travail avec style.", icon: "LayoutGrid" },
  { slug: "refonte", title: "Refonte de site", description: "On modernise votre site existant sans perdre votre référencement.", icon: "RefreshCw" },
  { slug: "maintenance", title: "Maintenance", description: "Mises à jour, sauvegardes et sérénité au quotidien.", icon: "Wrench" },
  { slug: "seo", title: "SEO", description: "Optimisation technique et contenu pour grimper sur Google.", icon: "Search" },
  { slug: "referencement", title: "Référencement", description: "Stratégie de visibilité locale et nationale.", icon: "TrendingUp" },
  { slug: "optimisation", title: "Optimisation", description: "Performances, cœur web vitaux et score Lighthouse au maximum.", icon: "Gauge" },
  { slug: "domaine", title: "Nom de domaine", description: "On réserve et configure votre adresse idéale.", icon: "AtSign" },
  { slug: "hebergement", title: "Hébergement", description: "Infrastructure rapide, sécurisée et évolutive.", icon: "Server" },
  { slug: "emails", title: "Emails professionnels", description: "Des adresses @votredomaine pour une image sérieuse.", icon: "Mail" },
  { slug: "admin", title: "Panel administrateur", description: "Gérez votre contenu vous-même, simplement.", icon: "LayoutDashboard" },
  { slug: "support", title: "Support", description: "Une équipe réactive et humaine à vos côtés.", icon: "LifeBuoy" },
];

export type Advantage = { title: string; description: string; icon: string };

export const ADVANTAGES: Advantage[] = [
  { title: "Design moderne", description: "Des interfaces épurées et haut de gamme, inspirées des meilleures.", icon: "Sparkles" },
  { title: "Optimisé Google", description: "Structure SEO propre pour être trouvé par vos clients.", icon: "Search" },
  { title: "Ultra rapide", description: "Chargement quasi instantané, même en mobile.", icon: "Zap" },
  { title: "Responsive", description: "Parfait sur mobile, tablette et ordinateur.", icon: "Smartphone" },
  { title: "Sécurisé", description: "HTTPS, protection des données et bonnes pratiques.", icon: "ShieldCheck" },
  { title: "Administration simple", description: "Un back-office clair pour tout gérer sans technicien.", icon: "LayoutDashboard" },
  { title: "Support réactif", description: "On reste disponible bien après la mise en ligne.", icon: "LifeBuoy" },
  { title: "Livraison rapide", description: "Votre site en ligne en quelques jours, pas en quelques mois.", icon: "Rocket" },
  { title: "Hébergement inclus", description: "On s'occupe de toute la partie technique.", icon: "Server" },
  { title: "Nom de domaine", description: "Réservation et configuration comprises.", icon: "AtSign" },
  { title: "Accompagnement", description: "Un interlocuteur unique du début à la fin.", icon: "Handshake" },
];

export type ProcessStep = { step: number; title: string; description: string; icon: string };

export const PROCESS: ProcessStep[] = [
  { step: 1, title: "Prise de contact", description: "On échange sur votre projet, vos objectifs et vos envies.", icon: "PhoneCall" },
  { step: 2, title: "Analyse des besoins", description: "On définit ensemble le périmètre, les pages et les fonctionnalités.", icon: "ClipboardList" },
  { step: 3, title: "Maquette", description: "Vous validez un design sur mesure avant tout développement.", icon: "PenTool" },
  { step: 4, title: "Développement", description: "On code un site rapide, propre et évolutif.", icon: "Code2" },
  { step: 5, title: "Validation", description: "Vous testez, on ajuste jusqu'à la perfection.", icon: "CheckCircle2" },
  { step: 6, title: "Mise en ligne", description: "Domaine, hébergement, SEO : on gère le lancement.", icon: "Rocket" },
  { step: 7, title: "Suivi", description: "Maintenance, améliorations et support continu.", icon: "HeartHandshake" },
];

export type Project = {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  color: string; // dégradé pour le visuel
  link?: string | null;
};

export const PROJECT_CATEGORIES = [
  "Tous",
  "Restaurant",
  "Entreprise",
  "Immobilier",
  "Association",
  "Commerce",
  "Portfolio",
  "Landing Page",
];

export const PROJECTS: Project[] = [
  { slug: "maison-laurent", title: "Maison Laurent", category: "Restaurant", tags: ["Next.js", "Réservation", "SEO"], color: "from-amber-500/30 to-vanyo-500/30" },
  { slug: "novaimmo", title: "NovaImmo", category: "Immobilier", tags: ["Portail", "Recherche", "CRM"], color: "from-sky-500/30 to-vanyo-500/30" },
  { slug: "atelier-cassard", title: "Atelier Cassard", category: "Portfolio", tags: ["Portfolio", "Animations"], color: "from-violet-hi/30 to-vanyo-500/30" },
  { slug: "greenroots", title: "GreenRoots", category: "Association", tags: ["Don en ligne", "Blog"], color: "from-emerald-500/30 to-vanyo-500/30" },
  { slug: "boutique-lume", title: "Boutique Lumé", category: "Commerce", tags: ["E-commerce", "Stripe"], color: "from-rose-500/30 to-vanyo-500/30" },
  { slug: "axio-conseil", title: "Axio Conseil", category: "Entreprise", tags: ["Corporate", "SEO"], color: "from-blue-500/30 to-vanyo-500/30" },
  { slug: "flow-app", title: "Flow", category: "Landing Page", tags: ["SaaS", "Conversion"], color: "from-vanyo-500/30 to-violet-hi/30" },
  { slug: "le-jardin", title: "Le Jardin", category: "Restaurant", tags: ["Menu digital", "Réservation"], color: "from-lime-500/30 to-vanyo-500/30" },
  { slug: "prestige-immo", title: "Prestige Immo", category: "Immobilier", tags: ["Luxe", "Visite 3D"], color: "from-indigo-500/30 to-vanyo-500/30" },
];

export type Plan = {
  name: string;
  price: string;
  originalPrice?: string | null;
  priceNote: string;
  highlight?: boolean;
  description: string;
  features: string[];
};

export const PLANS: Plan[] = [
  {
    name: "Starter",
    price: "690€",
    priceNote: "à partir de",
    description: "Idéal pour lancer une présence en ligne soignée.",
    features: [
      "Site vitrine 1 à 3 pages",
      "Design sur mesure",
      "100% responsive",
      "Formulaire de contact",
      "SEO de base",
      "Mise en ligne incluse",
    ],
  },
  {
    name: "Business",
    price: "1 490€",
    priceNote: "à partir de",
    highlight: true,
    description: "Le choix des entreprises qui veulent convertir.",
    features: [
      "Site 5 à 8 pages",
      "Design premium & animations",
      "SEO avancé",
      "Blog / actualités",
      "Panel administrateur",
      "Nom de domaine + emails pro",
      "Support 3 mois",
    ],
  },
  {
    name: "Premium",
    price: "2 990€",
    priceNote: "à partir de",
    description: "Pour un projet ambitieux et évolutif.",
    features: [
      "Site sur mesure illimité",
      "E-commerce ou espace client",
      "Animations avancées",
      "SEO complet + suivi",
      "Panel admin complet",
      "Hébergement premium 1 an",
      "Support prioritaire 12 mois",
    ],
  },
  {
    name: "Sur Mesure",
    price: "Sur devis",
    priceNote: "",
    description: "Application web, plateforme ou besoin spécifique.",
    features: [
      "Cahier des charges dédié",
      "Fonctionnalités avancées",
      "Intégrations & API",
      "Équipe dédiée",
      "Accompagnement long terme",
    ],
  },
];

export type Testimonial = {
  name: string;
  company: string;
  rating: number;
  quote: string;
  initials: string;
};

export const TESTIMONIALS: Testimonial[] = [
  { name: "Camille Laurent", company: "Maison Laurent", rating: 5, initials: "CL", quote: "Vanyo a transformé notre restaurant en ligne. Les réservations ont bondi et le site est magnifique." },
  { name: "Thomas Nguyen", company: "NovaImmo", rating: 5, initials: "TN", quote: "Professionnalisme irréprochable. Un portail immobilier rapide, moderne et parfaitement référencé." },
  { name: "Sarah Benali", company: "Boutique Lumé", rating: 5, initials: "SB", quote: "Notre boutique en ligne convertit enfin. L'équipe est à l'écoute et d'une réactivité folle." },
  { name: "Julien Moreau", company: "Axio Conseil", rating: 5, initials: "JM", quote: "Un site corporate qui inspire confiance. On nous complimente régulièrement dessus." },
  { name: "Léa Fontaine", company: "GreenRoots", rating: 5, initials: "LF", quote: "Ils ont compris notre cause et créé un site qui donne envie de s'engager. Merci Vanyo." },
  { name: "Marc Dubois", company: "Atelier Cassard", rating: 5, initials: "MD", quote: "Mon portfolio est enfin à la hauteur de mon travail. Design et animations bluffants." },
];

export type Faq = { question: string; answer: string };

export const FAQ: Faq[] = [
  { question: "Combien coûte la création d'un site ?", answer: "Nos sites démarrent à 690€ pour une vitrine et s'adaptent à votre projet. Après un échange gratuit, vous recevez un devis clair et détaillé, sans surprise." },
  { question: "Quels sont les délais de livraison ?", answer: "En moyenne 12 jours pour un site vitrine. Les projets plus complexes (e-commerce, application) prennent quelques semaines. On s'engage sur des délais précis dès le départ." },
  { question: "Est-ce que je pourrai modifier mon site moi-même ?", answer: "Oui. Nous livrons un panel d'administration simple et intuitif qui vous permet de modifier textes, images, articles et bien plus, sans aucune compétence technique." },
  { question: "Le référencement Google est-il inclus ?", answer: "Chaque site est optimisé SEO dès la conception : structure propre, vitesse, balises, sitemap. Nous proposons aussi un accompagnement SEO avancé pour aller plus loin." },
  { question: "Vous occupez-vous du nom de domaine et de l'hébergement ?", answer: "Absolument. Nous pouvons tout gérer pour vous : réservation du domaine, hébergement rapide et sécurisé, emails professionnels. Vous n'avez rien à faire." },
  { question: "Que se passe-t-il après la mise en ligne ?", answer: "On ne vous laisse pas seul. Selon votre formule, vous bénéficiez de maintenance, de mises à jour et d'un support réactif pour faire évoluer votre site." },
  { question: "Mon site sera-t-il adapté aux mobiles ?", answer: "Oui, tous nos sites sont pensés « mobile first » et parfaitement responsives sur mobile, tablette et ordinateur." },
  { question: "Puis-je faire refaire un site déjà existant ?", answer: "Bien sûr. Nous réalisons des refontes complètes en préservant (et souvent en améliorant) votre référencement existant." },
];

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readingTime: string;
  color: string;
  /** Corps de l'article : paragraphes séparés par un saut de ligne (les lignes
   *  commençant par "## " sont rendues comme des titres H2 par ArticlePage).
   *  Optionnel : absent uniquement pour un article Supabase sans contenu saisi. */
  content?: string;
};

export const ARTICLES: Article[] = [
  {
    slug: "site-rapide-2026", title: "Pourquoi la vitesse de votre site change tout en 2026",
    excerpt: "Un site lent fait fuir vos visiteurs et pénalise votre référencement. Voici comment atteindre l'excellence.",
    category: "Performance", date: "2026-06-14", readingTime: "5 min", color: "from-vanyo-500/40 to-violet-hi/30",
    content: `Chaque seconde de chargement supplémentaire coûte des visiteurs. Les études sur le comportement des internautes convergent toutes vers la même conclusion : passé 3 secondes de chargement, plus de la moitié des visiteurs mobiles quittent la page avant même qu'elle ne s'affiche complètement. En 2026, la vitesse n'est plus un détail technique réservé aux développeurs — c'est un facteur de conversion et de référencement à part entière.
## Les Core Web Vitals, la référence de Google
Google évalue la qualité d'une page à travers trois métriques concrètes. Le LCP (Largest Contentful Paint) mesure le temps d'affichage du plus gros élément visible — idéalement sous 2,5 secondes. L'INP (Interaction to Next Paint) évalue la réactivité de l'interface aux clics et au défilement. Le CLS (Cumulative Layout Shift) traque les décalages visuels inattendus, ces éléments qui bougent pendant le chargement et provoquent des clics involontaires. Un site qui échoue sur ces trois critères est pénalisé dans les résultats de recherche, quelle que soit la qualité de son contenu.
## Ce qui ralentit vraiment un site
Dans notre expérience, trois causes reviennent systématiquement : des images non compressées ou mal dimensionnées, un JavaScript excessif chargé avant même d'être nécessaire, et un hébergement sous-dimensionné qui met plusieurs centaines de millisecondes à répondre à la moindre requête.
## Notre approche chez Vanyo
- Compression et formats modernes (AVIF, WebP) pour toutes les images, avec un chargement différé hors de l'écran visible
- Un code minimal, sans bibliothèque superflue, pour ne charger que le strict nécessaire
- Un hébergement rapide avec mise en cache agressive du contenu statique
- Des polices optimisées pour éviter tout décalage de mise en page à l'affichage
Un site rapide n'est pas un luxe : c'est la base sur laquelle repose tout le reste — SEO, conversion, image de marque. Nous intégrons cette exigence dès la conception, pas comme une optimisation de dernière minute.`,
  },
  {
    slug: "seo-local-artisans", title: "SEO local : être trouvé par vos clients de proximité",
    excerpt: "Les bonnes pratiques pour dominer les recherches Google dans votre ville.",
    category: "SEO", date: "2026-05-28", readingTime: "6 min", color: "from-emerald-500/30 to-vanyo-500/30",
    content: `Un artisan, un commerce ou un cabinet qui travaille avec une clientèle locale n'a pas besoin d'être visible dans toute la France : il doit dominer les recherches dans sa ville et sa zone de chalandise. C'est un jeu différent du référencement national, avec ses propres règles.
## Google Business Profile, la brique incontournable
Avant même votre site, c'est souvent votre fiche Google Business Profile qui apparaît en premier dans une recherche locale, accompagnée de la carte et des avis. Une fiche complète (horaires exacts, photos récentes, catégorie précise, réponses aux avis) influence directement votre position dans ce fameux "pack local" des trois résultats mis en avant par Google.
## Les données structurées LocalBusiness
Sur votre site, les données structurées de type LocalBusiness indiquent explicitement à Google votre adresse, vos horaires et votre zone de service. C'est un langage que les moteurs de recherche comprennent nativement, bien plus fiable qu'une simple mention textuelle de votre ville dans une page.
## Du contenu vraiment local, pas juste votre ville répétée
Répéter le nom de sa ville dix fois sur une page ne trompe plus personne, ni Google ni vos visiteurs. Ce qui fonctionne, c'est un contenu qui prouve votre ancrage local : mention de quartiers précis, de spécificités de votre zone d'intervention, de réalisations locales concrètes.
## Les avis clients, un signal de confiance et de référencement
- Les avis récents et réguliers comptent plus qu'un grand nombre d'avis anciens
- Répondre à chaque avis, y compris négatif, améliore votre crédibilité
- Les avis mentionnant votre ville renforcent votre pertinence locale aux yeux de Google
Chez Vanyo, chaque site que nous livrons à une entreprise avec une clientèle locale intègre cette approche dès la structure : balises adaptées, données structurées et contenu qui reflète une présence locale réelle.`,
  },
  {
    slug: "design-qui-convertit", title: "Anatomie d'une page qui convertit",
    excerpt: "Les principes de design que nous appliquons pour transformer les visiteurs en clients.",
    category: "Design", date: "2026-05-10", readingTime: "7 min", color: "from-rose-500/30 to-vanyo-500/30",
    content: `Un site magnifique qui ne convertit pas est un échec commercial, aussi soigné soit-il visuellement. La conversion — transformer un visiteur en client — obéit à des principes précis, pas au hasard esthétique.
## La hiérarchie visuelle avant tout
Un visiteur décide en quelques secondes s'il reste ou s'il part. Le titre principal doit répondre immédiatement à la question "qu'est-ce que c'est et pourquoi ça me concerne ?". Tout le reste — sous-titre, visuel, bouton d'action — doit renforcer ce message, jamais le diluer.
## Un seul call-to-action clair par section
Une page qui propose cinq boutons différents dans le même espace visuel dilue l'attention et réduit le taux de clic global. Un bouton d'action clair, contrasté et répété à intervalles réguliers dans la page convertit toujours mieux qu'une multitude de choix.
## La preuve sociale au bon endroit
- Des avis clients affichés près des moments de décision, pas relégués en bas de page
- Des chiffres concrets (nombre de clients, taux de satisfaction) plutôt que des formules vagues
- Des réalisations similaires au secteur du visiteur, pour qu'il se projette
## La vitesse de chargement comme composant du design
Un design qui met cinq secondes à s'afficher n'existe pas aux yeux d'un visiteur pressé. La performance technique fait partie intégrante d'un bon design de conversion, pas d'une couche séparée ajoutée après coup.
## Les formulaires courts et rassurants
Chaque champ supplémentaire dans un formulaire réduit le taux de complétion. Nous limitons systématiquement les formulaires de contact et de devis aux informations réellement nécessaires à la première prise de contact.
Chez Vanyo, chaque page est pensée comme un tunnel : de l'attention initiale jusqu'à l'action, sans rupture ni distraction inutile.`,
  },
  {
    slug: "restaurant-en-ligne", title: "Restaurant : 5 éléments indispensables sur votre site",
    excerpt: "Menu, réservation, avis… ce qui fait vraiment la différence pour remplir votre salle.",
    category: "Restaurant", date: "2026-04-22", readingTime: "4 min", color: "from-amber-500/30 to-vanyo-500/30",
    content: `Un client qui cherche où manger ce soir prend sa décision en quelques minutes, souvent sur son téléphone, en comparant plusieurs établissements. Le site d'un restaurant doit répondre à cette décision rapide, pas raconter une histoire de marque sur plusieurs écrans.
## 1. Un menu à jour, lisible sur mobile
Rien ne fait fuir plus vite un visiteur qu'un menu en PDF illisible sur smartphone ou, pire, une carte visiblement obsolète. Un menu digital structuré, avec prix et allergènes à jour, rassure immédiatement.
## 2. La réservation en ligne, sans appel obligatoire
De plus en plus de clients évitent d'appeler et préfèrent réserver en quelques clics, à toute heure. Un système de réservation intégré au site capte ces clients qui, sinon, iraient voir ailleurs.
## 3. Une galerie photo qui donne envie
Les photos de plats et de salle pèsent lourd dans la décision. Des visuels nets, bien éclairés et récents valent largement plus que du texte descriptif.
## 4. Les avis clients mis en avant
- Une note globale visible dès la page d'accueil
- Quelques avis récents sélectionnés, pas une liste noyée
- Une réponse du restaurant aux avis, signe d'un établissement à l'écoute
## 5. Les informations pratiques sans effort
Horaires, adresse, parking à proximité, accès handicapé : ces informations doivent être visibles sans avoir à chercher, idéalement dès l'écran d'accueil sur mobile.
Un site de restaurant qui réunit ces cinq éléments transforme un visiteur hésitant en réservation concrète — c'est exactement ce que nous construisons pour nos clients de la restauration.`,
  },
  {
    slug: "refonte-sans-perdre-seo", title: "Refondre son site sans perdre son référencement",
    excerpt: "La méthode pour moderniser votre site tout en conservant votre position sur Google.",
    category: "SEO", date: "2026-04-05", readingTime: "6 min", color: "from-sky-500/30 to-vanyo-500/30",
    content: `Une refonte de site mal préparée peut effacer des années de référencement en quelques jours. C'est l'une des craintes les plus légitimes des entreprises qui envisagent de moderniser un site vieillissant — et l'une des erreurs les plus fréquentes chez les prestataires peu rigoureux.
## Cartographier l'existant avant de toucher à quoi que ce soit
Avant la moindre ligne de code, un audit complet des URLs existantes, de leur trafic et de leur positionnement est indispensable. Chaque page qui génère du trafic ou des liens externes doit être identifiée et son équivalent prévu sur le nouveau site.
## Les redirections 301, pas une option
Quand une URL change (et c'est fréquent lors d'une refonte), une redirection permanente 301 vers la nouvelle adresse est impérative. Sans elle, les visiteurs tombent sur une erreur 404 et le référencement accumulé sur l'ancienne page est perdu.
## Conserver la structure de contenu qui fonctionne
Il est tentant de tout réécrire lors d'une refonte. Mais un contenu déjà bien positionné sur Google mérite d'être amélioré, pas remplacé à l'aveugle — perdre les mots-clés et la structure qui fonctionnaient serait contre-productif.
## Une bascule surveillée, pas un pari
- Mise en ligne suivie de près dans les jours suivants (indexation, erreurs d'exploration)
- Sitemap mis à jour et soumis immédiatement à Google Search Console
- Comparaison du trafic avant/après pour détecter toute anomalie rapidement
## Profiter de la refonte pour corriger les vraies faiblesses techniques
Une refonte est aussi l'occasion d'améliorer ce qui pénalisait le site : vitesse de chargement, structure des titres, données structurées manquantes. C'est le moment idéal pour repartir sur des bases techniques saines.
Chez Vanyo, chaque refonte suit ce protocole strict : nous ne sacrifions jamais un référencement existant sur l'autel d'un nouveau design, aussi beau soit-il.`,
  },
  {
    slug: "combien-coute-un-site", title: "Combien coûte réellement un site internet ?",
    excerpt: "On démystifie les prix et on vous explique où va votre budget.",
    category: "Conseils", date: "2026-03-18", readingTime: "5 min", color: "from-indigo-500/30 to-vanyo-500/30",
    content: `"Combien ça coûte un site internet ?" est sans doute la question la plus posée et la moins bien répondue du secteur, tant les écarts de prix affichés partout en ligne peuvent dérouter. La réponse honnête est : ça dépend de ce que vous achetez réellement.
## Ce qui justifie un écart de prix de 1 à 10
Un site à 50€ par mois sur une plateforme grand public et un site sur mesure à plusieurs milliers d'euros ne sont pas le même produit. Le premier loue un gabarit préconçu et partagé par des milliers d'autres sites ; le second est conçu, codé et optimisé spécifiquement pour votre activité, votre secteur et vos objectifs.
## Ce qui compose réellement le budget d'un site sur mesure
- La conception : structure, parcours utilisateur, design adapté à votre image de marque
- Le développement : un code propre, rapide, sans dépendance à une plateforme tierce
- Le référencement : structure technique, contenu, données structurées dès la livraison
- L'accompagnement : mise en ligne, formation à l'administration, support après livraison
## Le vrai coût d'un site "pas cher"
Un site bâclé génère un coût invisible mais réel : occasions manquées faute de conversion, position Google médiocre, refonte anticipée quelques mois plus tard faute d'évolutivité. Le prix affiché n'est jamais le coût total.
## Comment évaluer un devis reçu
Un devis sérieux détaille ce qui est inclus (nombre de pages, panel d'administration, référencement, hébergement, maintenance) plutôt que d'afficher un simple forfait vague. Méfiez-vous des prix anormalement bas sans détail des prestations.
Chez Vanyo, nos formules démarrent à 690€ pour un site vitrine complet, avec un devis détaillé et sans surprise après un premier échange gratuit — vous savez exactement ce que vous payez et pourquoi.`,
  },
  {
    slug: "ia-generative-referencement",
    title: "SEO IA : comment être trouvé et cité par ChatGPT, Perplexity et Gemini",
    excerpt: "Une nouvelle génération de moteurs de recherche s'appuie sur l'IA générative. Voici comment structurer votre site pour y apparaître.",
    category: "SEO IA", date: "2026-07-02", readingTime: "7 min", color: "from-violet-hi/40 to-vanyo-500/30",
    content: `De plus en plus d'internautes posent directement leurs questions à ChatGPT, Perplexity, Gemini ou Copilot plutôt que de taper une requête sur Google. Ces outils ne se contentent pas de lister des liens : ils synthétisent une réponse et citent leurs sources. Être cité — ou non — dans cette réponse devient un enjeu de visibilité aussi important que le classement Google.
## Comment une IA générative choisit ses sources
Ces modèles s'appuient sur du contenu déjà indexé et structuré de manière claire : des réponses directes à des questions précises, des données factuelles vérifiables, et des pages dont le contenu textuel est facilement extractible (pas caché derrière des animations ou des scripts complexes).
## Les données structurées, un langage que les IA comprennent aussi
Les balises Schema.org (FAQPage, Article, Organization) ne servent pas qu'à Google : elles donnent aux IA génératives un contexte explicite sur la nature de votre contenu, votre organisation et votre expertise, ce qui facilite grandement la citation.
## Des FAQ complètes et honnêtes
- Formulez vos questions comme les tape réellement un utilisateur, pas comme un slogan marketing
- Répondez de façon complète et autonome, sans renvoyer systématiquement à "contactez-nous"
- Couvrez les objections réelles (prix, délais, garanties), pas seulement les questions flatteuses
## Une structure de contenu extractible
Des titres clairs (H1, H2, H3) qui résument le contenu qui suit, des listes à puces pour les informations factuelles, et des paragraphes qui répondent chacun à une seule idée : cette structure, bonne pour le lecteur humain pressé, est exactement celle qu'une IA extrait le plus facilement pour construire sa réponse.
## L'autorité de marque compte aussi pour les IA
Les mentions de votre entreprise sur d'autres sites (presse, annuaires, partenaires), vos avis clients et la cohérence de vos informations (nom, coordonnées) partout en ligne renforcent la confiance qu'un modèle accorde à votre contenu comme source fiable.
Optimiser pour les IA génératives n'est pas une discipline séparée du SEO classique : c'est son prolongement naturel, avec une exigence de clarté et d'honnêteté encore plus grande.`,
  },
  {
    slug: "vanyo-vs-wix-webflow-shopify",
    title: "Vanyo, Wix, Webflow, Shopify : quelle solution choisir pour votre site ?",
    excerpt: "Comparatif honnête entre un site sur mesure et les plateformes grand public les plus connues.",
    category: "Comparatif", date: "2026-06-28", readingTime: "8 min", color: "from-sky-500/30 to-violet-hi/30",
    content: `Wix, Webflow, Shopify et les constructeurs de site grand public ont démocratisé la création de sites internet — un vrai progrès pour des besoins très simples. Mais ils ont aussi des limites structurelles qu'il vaut mieux connaître avant de choisir, plutôt que de les découvrir après coup.
## Wix et Squarespace : simplicité, au prix de la performance
Ces constructeurs "glisser-déposer" permettent de démarrer vite, sans compétence technique. Leur revers : un code généré automatiquement, souvent lourd, qui pénalise les Core Web Vitals et donc le référencement. Vous êtes aussi locataire de la plateforme : abonnement à vie, migration complexe si vous voulez partir.
## Webflow : plus de contrôle, mais une courbe d'apprentissage réelle
Webflow offre un contrôle visuel plus poussé et un code plus propre que Wix. Il reste toutefois une plateforme fermée, avec un abonnement récurrent, et sa prise en main reste technique pour qui veut aller au-delà des gabarits fournis.
## Shopify : excellent pour le volume, coûteux sur la durée
Pour de l'e-commerce à fort volume, Shopify est un choix solide et éprouvé. Mais ses frais de transaction, ses applications payantes qui s'accumulent et son coût mensuel croissant en font une solution qui peut devenir coûteuse à mesure que votre activité grandit.
## Ce qu'un site sur mesure change concrètement
- Un code écrit spécifiquement pour votre activité, sans superflu ni dépendance à un éditeur tiers
- Une performance technique optimisée dès la conception, pas contrainte par une plateforme générique
- Une propriété totale : votre site vous appartient, sans abonnement obligatoire à vie
- Un référencement pensé dès la structure, pas ajouté après coup via un plugin
## Pour qui le sur-mesure a-t-il vraiment du sens ?
Si votre activité repose sur votre visibilité en ligne (génération de devis, réservations, vente), la différence de performance et de référencement d'un site sur mesure se traduit directement en clients supplémentaires — un écart qui dépasse largement la différence de prix initiale sur la durée.
Chez Vanyo, nous ne vendons pas un gabarit : nous construisons un site qui vous appartient entièrement, pensé pour votre activité précise plutôt que pour convenir à tout le monde.`,
  },
  {
    slug: "accessibilite-site-web-wcag",
    title: "Accessibilité web : pourquoi et comment rendre votre site accessible à tous",
    excerpt: "L'accessibilité n'est pas qu'une obligation légale : c'est aussi un levier de référencement et de conversion.",
    category: "Accessibilité", date: "2026-06-05", readingTime: "6 min", color: "from-emerald-500/30 to-sky-500/30",
    content: `Un site accessible est un site utilisable par le plus grand nombre : malvoyants naviguant au lecteur d'écran, utilisateurs à mobilité réduite naviguant au clavier, personnes daltoniennes, ou simplement un visiteur en plein soleil qui a besoin d'un bon contraste. L'accessibilité profite à tous vos visiteurs, pas seulement à une minorité.
## Les fondamentaux des normes WCAG
Les recommandations WCAG (Web Content Accessibility Guidelines) définissent des critères concrets : un contraste de couleur suffisant entre texte et fond, des images accompagnées d'un texte alternatif, une navigation possible entièrement au clavier, et une structure de titres cohérente qui permet de comprendre la page sans la voir.
## Ce que Google Lighthouse évalue précisément
- Le contraste des couleurs sur l'ensemble des textes du site
- La présence d'attributs alt sur les images porteuses de sens
- Les labels associés à chaque champ de formulaire
- L'ordre logique de navigation au clavier (tabulation)
## Un impact direct sur le référencement
Google valorise les sites accessibles dans son évaluation globale de la qualité d'une page. Un score d'accessibilité élevé s'accompagne souvent d'une meilleure structure sémantique HTML — exactement ce que les moteurs de recherche utilisent pour comprendre le contenu d'une page.
## L'accessibilité, un risque juridique croissant
En France comme dans l'Union européenne, les obligations d'accessibilité numérique se renforcent, notamment pour les organismes publics et, de plus en plus, pour certains acteurs privés. Anticiper ce sujet évite des refontes correctives dans l'urgence.
## Notre approche chez Vanyo
Chaque site que nous livrons respecte les fondamentaux d'accessibilité dès la conception : contraste vérifié, structure sémantique propre, navigation clavier fonctionnelle et attributs alternatifs sur les visuels porteurs de sens. Ce n'est pas une option facturée en supplément : c'est une exigence de base de notre travail.`,
  },
  {
    slug: "schema-org-donnees-structurees",
    title: "Données structurées Schema.org : le langage secret qui parle à Google",
    excerpt: "Comprendre les données structurées et pourquoi elles font une vraie différence sur votre référencement.",
    category: "SEO technique", date: "2026-05-19", readingTime: "6 min", color: "from-indigo-500/30 to-violet-hi/30",
    content: `Deux sites peuvent afficher exactement le même contenu visuel et pourtant être compris très différemment par Google, selon que l'un utilise des données structurées et l'autre non. Les données structurées Schema.org sont un langage additionnel, invisible pour le visiteur, qui explique explicitement à un moteur de recherche la nature de chaque élément de la page.
## Ce que Google comprend grâce au Schema.org
Sans données structurées, un moteur de recherche doit deviner qu'un bloc de texte est un avis client, qu'une liste de questions est une FAQ, ou qu'une page appartient à une organisation précise. Avec le balisage JSON-LD, cette information est donnée explicitement, sans ambiguïté.
## Les types de schema les plus utiles pour un site d'entreprise
- Organization : identité de l'entreprise, coordonnées, réseaux sociaux
- LocalBusiness : pour les entreprises avec une adresse physique et une zone de service locale
- FAQPage : chaque question-réponse devient éligible à un affichage enrichi dans Google
- Article : renforce la fiabilité d'un contenu de blog, notamment pour Google Discover
- BreadcrumbList : affiche le fil d'Ariane directement dans les résultats de recherche
## Les rich results, la récompense visible
Quand les données structurées sont correctement implémentées, Google peut afficher des éléments enrichis dans les résultats : étoiles d'avis, questions dépliables, fil d'Ariane. Ces éléments visuels augmentent mécaniquement le taux de clic, à position égale dans les résultats.
## Un prérequis pour l'ère des IA génératives
Au-delà de Google, les moteurs de recherche conversationnels s'appuient de plus en plus sur ces mêmes données structurées pour comprendre et citer correctement une source. Un site bien balisé a un avantage réel dans cette nouvelle génération de recherche.
Chez Vanyo, les données structurées font partie de notre socle technique standard : Organization, FAQ, Article et fil d'Ariane sont intégrés dès la conception, sur chaque site que nous livrons.`,
  },
  {
    slug: "site-e-commerce-qui-vend",
    title: "E-commerce : les leviers qui transforment les visiteurs en acheteurs",
    excerpt: "Une boutique en ligne qui a du trafic mais peu de ventes souffre presque toujours des mêmes défauts.",
    category: "E-commerce", date: "2026-04-30", readingTime: "7 min", color: "from-rose-500/30 to-indigo-500/30",
    content: `Beaucoup de boutiques en ligne reçoivent du trafic sans parvenir à le convertir en ventes. Le problème est rarement le produit lui-même : il se situe presque toujours dans le tunnel d'achat, la confiance perçue ou la friction technique.
## L'abandon de panier, le symptôme le plus révélateur
Un taux d'abandon de panier élevé pointe généralement vers les mêmes causes : des frais de livraison découverts trop tard, un processus de paiement trop long, ou une obligation de créer un compte avant de finaliser l'achat.
## La confiance se construit avant le paiement
- Des avis clients visibles directement sur la fiche produit, pas seulement sur une page dédiée
- Des informations claires sur les délais et frais de livraison, dès la fiche produit
- Une politique de retour explicite et facile à trouver
- Des moyens de paiement reconnus et rassurants
## Des fiches produit qui répondent aux vraies questions
Une bonne fiche produit ne se limite pas à une description marketing : elle anticipe les questions concrètes (dimensions, matière, entretien, compatibilité) qu'un acheteur se pose avant de sortir sa carte bancaire.
## La vitesse, un facteur de conversion direct en e-commerce
Sur une boutique en ligne, chaque seconde de chargement supplémentaire sur une fiche produit ou au moment du paiement se traduit directement en ventes perdues — c'est l'un des secteurs où l'impact de la performance technique est le plus mesurable.
## Le mobile, canal d'achat majoritaire
Une part croissante des achats en ligne se fait désormais sur smartphone. Un tunnel d'achat pensé mobile-first, avec un paiement simplifié et peu d'étapes, n'est plus une option mais une nécessité.
Chez Vanyo, nos boutiques en ligne sont conçues autour de ce tunnel de conversion, pas seulement autour du design des fiches produit — l'objectif reste toujours la vente, pas seulement la visite.`,
  },
  {
    slug: "site-immobilier-agence",
    title: "Site immobilier : générer des contacts qualifiés plutôt que de simples visites",
    excerpt: "Les fonctionnalités qui font la différence pour une agence ou un mandataire immobilier en ligne.",
    category: "Immobilier", date: "2026-03-25", readingTime: "6 min", color: "from-sky-500/30 to-emerald-500/30",
    content: `Un site immobilier a un objectif précis : transformer un visiteur qui parcourt des annonces en demande de visite ou en estimation qualifiée. Le nombre de visites sur le site n'a aucune valeur si elles ne se transforment jamais en contact réel.
## Un moteur de recherche de biens qui ne frustre pas
Les filtres (budget, type de bien, nombre de pièces, localisation) doivent être immédiats et sans rechargement de page. Un visiteur qui doit deviner comment affiner sa recherche abandonne rapidement pour un site concurrent plus fluide.
## Des fiches de bien qui donnent envie de visiter
- Une galerie photo de qualité, avec un nombre suffisant de clichés par pièce
- Une visite virtuelle ou vidéo quand c'est possible, particulièrement appréciée pour les biens haut de gamme
- Une carte de localisation et les commodités à proximité
- Un formulaire de demande de visite directement accessible, sans étape superflue
## L'estimation en ligne, un formidable générateur de contacts
Un simulateur ou formulaire d'estimation capte des prospects vendeurs bien avant qu'ils ne contactent une agence par téléphone — c'est souvent la fonctionnalité la plus rentable d'un site immobilier bien conçu.
## Le référencement local, déterminant dans l'immobilier
Les recherches immobilières sont presque systématiquement localisées ("appartement à vendre + ville"). Une structure de contenu qui couvre chaque secteur géographique d'intervention démultiplie les opportunités d'être trouvé au bon moment.
## La réactivité, facteur de conversion décisif
Dans l'immobilier, le premier professionnel à répondre à une demande a un net avantage. Les notifications immédiates de nouvelles demandes, directement dans le panel d'administration, permettent de ne jamais laisser un contact sans réponse rapide.
Chez Vanyo, nos sites immobiliers intègrent ces fonctionnalités en standard : recherche fluide, demandes de visite centralisées et structure pensée pour le référencement local de chaque secteur couvert.`,
  },
  {
    slug: "maintenance-securite-site-web",
    title: "Maintenance et sécurité : ce qui se passe après la mise en ligne de votre site",
    excerpt: "Un site n'est jamais vraiment terminé : voici pourquoi la maintenance conditionne sa durée de vie et sa sécurité.",
    category: "Maintenance", date: "2026-02-20", readingTime: "5 min", color: "from-teal-500/30 to-vanyo-500/30",
    content: `Un site internet livré n'est pas un projet clos : c'est un système vivant, exposé en permanence sur internet, qui nécessite une attention continue pour rester rapide, sécurisé et fonctionnel dans la durée.
## Les mises à jour, une nécessité de sécurité
Les briques logicielles qui composent un site (frameworks, bibliothèques, plugins) reçoivent régulièrement des correctifs de sécurité. Un site jamais mis à jour accumule des failles connues, exploitables par des outils automatisés qui scannent le web en permanence.
## Le certificat HTTPS, non négociable
Un site sans certificat SSL valide est signalé "non sécurisé" par les navigateurs, ce qui fait fuir immédiatement les visiteurs et pénalise le référencement. Le renouvellement et la bonne configuration de ce certificat font partie des bases invisibles mais critiques.
## Les sauvegardes, votre assurance en cas de problème
- Une sauvegarde régulière et automatisée du contenu et de la base de données
- Un test occasionnel de restauration, pour s'assurer que la sauvegarde fonctionne réellement le jour où elle est nécessaire
- Une conservation sur plusieurs points dans le temps, pas uniquement la dernière version
## La surveillance des performances dans le temps
Un site rapide au lancement peut ralentir progressivement : contenu qui s'accumule, images ajoutées sans compression, extensions installées sans discernement. Un suivi régulier permet de détecter et corriger ces dérives avant qu'elles n'affectent sérieusement l'expérience visiteur.
## Un support réactif en cas d'imprévu
Un formulaire qui cesse d'envoyer des emails, une page qui affiche une erreur : ces incidents doivent être résolus en heures, pas en semaines, pour ne pas perdre de prospects pendant que le problème persiste.
Chez Vanyo, chaque formule inclut un niveau de maintenance adapté, avec une équipe qui reste disponible bien après la mise en ligne — un site n'est jamais vraiment "fini", et c'est très bien ainsi.`,
  },
];
