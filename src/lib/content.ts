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
};

export const ARTICLES: Article[] = [
  { slug: "site-rapide-2026", title: "Pourquoi la vitesse de votre site change tout en 2026", excerpt: "Un site lent fait fuir vos visiteurs et pénalise votre référencement. Voici comment atteindre l'excellence.", category: "Performance", date: "2026-06-14", readingTime: "5 min", color: "from-vanyo-500/40 to-violet-hi/30" },
  { slug: "seo-local-artisans", title: "SEO local : être trouvé par vos clients de proximité", excerpt: "Les bonnes pratiques pour dominer les recherches Google dans votre ville.", category: "SEO", date: "2026-05-28", readingTime: "6 min", color: "from-emerald-500/30 to-vanyo-500/30" },
  { slug: "design-qui-convertit", title: "Anatomie d'une page qui convertit", excerpt: "Les principes de design que nous appliquons pour transformer les visiteurs en clients.", category: "Design", date: "2026-05-10", readingTime: "7 min", color: "from-rose-500/30 to-vanyo-500/30" },
  { slug: "restaurant-en-ligne", title: "Restaurant : 5 éléments indispensables sur votre site", excerpt: "Menu, réservation, avis… ce qui fait vraiment la différence pour remplir votre salle.", category: "Restaurant", date: "2026-04-22", readingTime: "4 min", color: "from-amber-500/30 to-vanyo-500/30" },
  { slug: "refonte-sans-perdre-seo", title: "Refondre son site sans perdre son référencement", excerpt: "La méthode pour moderniser votre site tout en conservant votre position sur Google.", category: "SEO", date: "2026-04-05", readingTime: "6 min", color: "from-sky-500/30 to-vanyo-500/30" },
  { slug: "combien-coute-un-site", title: "Combien coûte réellement un site internet ?", excerpt: "On démystifie les prix et on vous explique où va votre budget.", category: "Conseils", date: "2026-03-18", readingTime: "5 min", color: "from-indigo-500/30 to-vanyo-500/30" },
];
