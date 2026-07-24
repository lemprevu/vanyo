/**
 * Catalogue des métiers proposés en démonstration.
 * Chaque métier est une simple config : le panel est ensuite rendu par les
 * managers génériques. Ajouter un secteur = ajouter un objet ici.
 */
import {
  UtensilsCrossed, CalendarClock, Image as ImageIcon, Star, Mail, Settings,
  Building2, Key, ShoppingBag, Package, Ticket, Wrench, ClipboardList, Hammer,
  Scissors, Sparkles, Users, Stethoscope, CalendarDays, Newspaper, HandHeart,
  Camera, Aperture, Leaf, Store, Car, Gauge, ScrollText, FileSignature,
} from "lucide-react";
import type { MetierConfig, Row, Section } from "./types";

// Horodatages relatifs figés à l'évaluation du module.
const t0 = Date.now();
const ago = (ms: number) => new Date(t0 - ms).toISOString();
const H = 3600_000, D = 24 * H;

const ADMIN_UID = "u0";

/** Sections communes à tous les métiers, alignées sur le vrai panel admin Vanyo. */
const commonSections = (): Section[] => [
  {
    type: "blog", id: "blog", label: "Blog", icon: Newspaper,
    seed: [
      {
        id: "a1", created_at: ago(4 * D), slug: "3-conseils-pour-votre-site",
        title: "3 conseils pour un site qui convertit", excerpt: "Les leviers simples à ne pas négliger.",
        content: "Un site rapide, clair et à jour transforme bien plus de visiteurs en clients.",
        category: "Conseils", color: "from-vanyo-500/30 to-violet-hi/30", reading_time: "4 min",
        published: true, published_at: "2026-07-10",
      },
      {
        id: "a2", created_at: ago(10 * D), slug: "nouveautes-de-la-saison",
        title: "Les nouveautés de la saison", excerpt: "Ce qui change ce trimestre.",
        content: "Un point sur les évolutions récentes.", category: "Conseils",
        color: "from-amber-500/30 to-vanyo-500/30", reading_time: "3 min",
        published: false, published_at: "2026-07-01",
      },
    ],
  },
  {
    type: "users", id: "utilisateurs", label: "Utilisateurs", icon: Users,
    seed: [
      { id: ADMIN_UID, created_at: ago(60 * D), email: "contact@exemple.fr", role: "Administrateur", permissions: [] },
      { id: "u1", created_at: ago(12 * D), email: "collegue@exemple.fr", role: "Modérateur", permissions: ["messages", "avis"] },
    ],
  },
  { type: "performance", id: "performance", label: "Performance & SEO", icon: Gauge },
  { type: "signature", id: "signature", label: "Signature email", icon: FileSignature },
  { type: "journal", id: "journal", label: "Journal d'activité", icon: ScrollText },
];

const reviews = (arr: [string, string, number, string][]): Row[] =>
  arr.map(([name, company, rating, quote], i) => ({
    id: `r${i}`, created_at: ago(i * 3 * D), name, company, rating, quote,
    initials: name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase(),
    featured: i < 4, position: i,
  }));

const messages = (arr: [string, string, string, string, boolean][]): Row[] =>
  arr.map(([nom, email, sujet, message, lu], i) => ({
    id: `m${i}`, created_at: ago(i * 5 * H + H), nom, email, sujet, message, lu,
  }));

export const METIERS: MetierConfig[] = [
  // ─────────────────────────── RESTAURANT ───────────────────────────
  {
    id: "restaurant",
    label: "Restaurant",
    icon: UtensilsCrossed,
    tagline: "Réservations, carte du jour, avis clients…",
    businessName: "La Table d'Olivier",
    accent: "#C0392B",
    settings: { tagline: "Cuisine de saison — Lyon", email: "contact@latabledolivier.fr", phone: "04 78 12 34 56", address: "24 rue Mercière, 69002 Lyon", hours: "Mar – Sam · 12h – 14h / 19h – 22h" },
    sections: [
      {
        type: "requests", id: "reservations", label: "Réservations", icon: CalendarClock,
        nameField: "client", countsAsPending: true,
        statuses: ["Nouvelle", "Confirmée", "Honorée", "Annulée"],
        columns: ["couverts", "date"],
        fields: [
          { key: "client", label: "Client", type: "text", required: true },
          { key: "email", label: "Email", type: "text" },
          { key: "telephone", label: "Téléphone", type: "text" },
          { key: "date", label: "Date", type: "date" },
          { key: "heure", label: "Heure", type: "select", options: ["12:00", "12:30", "13:00", "19:30", "20:00", "20:30", "21:00"] },
          { key: "couverts", label: "Couverts", type: "number", suffix: " pers." },
          { key: "notes", label: "Demandes particulières", type: "textarea" },
        ],
        seed: [
          { id: "1", created_at: ago(1 * H), status: "Nouvelle", client: "Camille Laurent", email: "camille@mail.fr", telephone: "06 12 34 56 78", date: "2026-07-24", heure: "20:00", couverts: 4, notes: "Table près de la fenêtre si possible.", viewed: false },
          { id: "2", created_at: ago(4 * H), status: "Nouvelle", client: "Marc Dubois", email: "marc@mail.fr", telephone: "06 98 76 54 32", date: "2026-07-25", heure: "21:00", couverts: 2, notes: "Anniversaire de mariage.", viewed: false },
          { id: "3", created_at: ago(28 * H), status: "Confirmée", client: "Sophie Martel", email: "sophie@mail.fr", telephone: "07 11 22 33 44", date: "2026-07-23", heure: "12:30", couverts: 6, notes: "Un menu sans gluten.", viewed: true },
          { id: "4", created_at: ago(3 * D), status: "Honorée", client: "Antoine Lefèvre", email: "antoine@mail.fr", date: "2026-07-19", heure: "20:30", couverts: 3, viewed: true },
        ],
      },
      { type: "planning", id: "planning", label: "Planning", icon: CalendarDays, sourceId: "reservations", dateField: "date", timeField: "heure" },
      {
        type: "collection", id: "carte", label: "Carte & menu", icon: UtensilsCrossed,
        itemLabel: "un plat", titleField: "nom", layout: "grid", colorField: "color",
        fields: [
          { key: "nom", label: "Nom du plat", type: "text", required: true },
          { key: "categorie", label: "Catégorie", type: "select", options: ["Entrée", "Plat", "Dessert", "Boisson"], badge: true },
          { key: "prix", label: "Prix", type: "price", suffix: " €" },
          { key: "description", label: "Description", type: "textarea", hideInList: true },
          { key: "disponible", label: "Disponible à la carte", type: "boolean" },
          { key: "color", label: "Couleur du visuel", type: "color", hideInList: true },
        ],
        seed: [
          { id: "1", nom: "Velouté de potimarron", categorie: "Entrée", prix: 9, description: "Crème légère, éclats de noisette torréfiée.", disponible: true, color: "from-amber-500/30 to-vanyo-500/30" },
          { id: "2", nom: "Filet de bar, beurre blanc", categorie: "Plat", prix: 24, description: "Bar de ligne, légumes de saison.", disponible: true, color: "from-sky-500/30 to-vanyo-500/30" },
          { id: "3", nom: "Magret de canard", categorie: "Plat", prix: 22, description: "Sauce au miel, purée maison.", disponible: true, color: "from-rose-500/30 to-vanyo-500/30" },
          { id: "4", nom: "Tarte fine aux pommes", categorie: "Dessert", prix: 8, description: "Glace vanille de Madagascar.", disponible: true, color: "from-amber-500/30 to-vanyo-500/30" },
        ],
      },
      {
        type: "collection", id: "galerie", label: "Galerie photos", icon: ImageIcon,
        itemLabel: "une photo", titleField: "titre", layout: "grid", colorField: "color",
        fields: [
          { key: "titre", label: "Légende", type: "text", required: true },
          { key: "color", label: "Couleur", type: "color", hideInList: true },
        ],
        seed: [
          { id: "1", titre: "Notre salle", color: "from-amber-500/30 to-vanyo-500/30" },
          { id: "2", titre: "En cuisine", color: "from-rose-500/30 to-vanyo-500/30" },
          { id: "3", titre: "La terrasse", color: "from-emerald-500/30 to-vanyo-500/30" },
        ],
      },
      { type: "reviews", id: "avis", label: "Avis clients", icon: Star, seed: reviews([
        ["Camille Laurent", "", 5, "Une cuisine raffinée et un accueil parfait. On reviendra !"],
        ["Marc Dubois", "", 5, "Le meilleur bar beurre blanc de Lyon, sans exagérer."],
        ["Sophie Martel", "", 4, "Très bon moment, service un peu lent le samedi soir."],
      ]) },
      { type: "messages", id: "messages", label: "Messages", icon: Mail, seed: messages([
        ["Léa Fontaine", "lea@mail.fr", "Privatisation", "Bonjour, seriez-vous disponibles pour privatiser la salle un vendredi de septembre ?", false],
        ["Julien Roy", "julien@mail.fr", "Allergies", "Proposez-vous des plats sans lactose ? Merci.", true],
      ]) },
      { type: "settings", id: "parametres", label: "Paramètres", icon: Settings },
      ...commonSections(),
    ],
  },

  // ─────────────────────────── IMMOBILIER ───────────────────────────
  {
    id: "immobilier",
    label: "Immobilier",
    icon: Building2,
    tagline: "Biens, demandes de visite, contacts…",
    businessName: "Horizon Immobilier",
    accent: "#1F6FB2",
    settings: { tagline: "Agence immobilière — Bordeaux", email: "contact@horizon-immo.fr", phone: "05 56 00 11 22", address: "8 cours de l'Intendance, 33000 Bordeaux", hours: "Lun – Sam · 9h – 19h" },
    sections: [
      {
        type: "collection", id: "biens", label: "Biens", icon: Key,
        itemLabel: "un bien", titleField: "titre", layout: "list", colorField: "color",
        fields: [
          { key: "titre", label: "Titre de l'annonce", type: "text", required: true },
          { key: "type", label: "Type", type: "select", options: ["Appartement", "Maison", "Studio", "Terrain", "Local"], badge: true },
          { key: "transaction", label: "Transaction", type: "select", options: ["Vente", "Location"] },
          { key: "prix", label: "Prix", type: "price", suffix: " €" },
          { key: "surface", label: "Surface", type: "number", suffix: " m²" },
          { key: "pieces", label: "Pièces", type: "number", suffix: " p." },
          { key: "ville", label: "Ville", type: "text" },
          { key: "description", label: "Description", type: "textarea", hideInList: true },
          { key: "color", label: "Couleur du visuel", type: "color", hideInList: true },
        ],
        seed: [
          { id: "1", titre: "Appartement lumineux hypercentre", type: "Appartement", transaction: "Vente", prix: 349000, surface: 78, pieces: 3, ville: "Bordeaux", description: "Beaux volumes, parquet, proche tram.", color: "from-sky-500/30 to-vanyo-500/30" },
          { id: "2", titre: "Maison familiale avec jardin", type: "Maison", transaction: "Vente", prix: 525000, surface: 140, pieces: 5, ville: "Mérignac", description: "Jardin 400 m², garage, calme.", color: "from-emerald-500/30 to-vanyo-500/30" },
          { id: "3", titre: "Studio meublé étudiant", type: "Studio", transaction: "Location", prix: 620, surface: 24, pieces: 1, ville: "Talence", description: "Meublé, proche campus.", color: "from-indigo-500/30 to-vanyo-500/30" },
        ],
      },
      {
        type: "requests", id: "visites", label: "Demandes de visite", icon: CalendarClock,
        nameField: "client", countsAsPending: true,
        statuses: ["Nouvelle", "Planifiée", "Effectuée", "Sans suite"],
        columns: ["bien", "date"],
        fields: [
          { key: "client", label: "Client", type: "text", required: true },
          { key: "email", label: "Email", type: "text" },
          { key: "telephone", label: "Téléphone", type: "text" },
          { key: "bien", label: "Bien concerné", type: "text" },
          { key: "date", label: "Date souhaitée", type: "date" },
          { key: "message", label: "Message", type: "textarea" },
        ],
        seed: [
          { id: "1", created_at: ago(2 * H), status: "Nouvelle", client: "Thomas Nguyen", email: "thomas@mail.fr", telephone: "06 22 33 44 55", bien: "Appartement lumineux hypercentre", date: "2026-07-24", message: "Disponible en fin de journée.", viewed: false },
          { id: "2", created_at: ago(26 * H), status: "Planifiée", client: "Sarah Benali", email: "sarah@mail.fr", telephone: "07 88 99 00 11", bien: "Maison familiale avec jardin", date: "2026-07-25", message: "Nous venons en couple.", viewed: true },
        ],
      },
      { type: "planning", id: "planning", label: "Planning des visites", icon: CalendarDays, sourceId: "visites", dateField: "date" },
      { type: "reviews", id: "avis", label: "Avis clients", icon: Star, seed: reviews([
        ["Julien Moreau", "", 5, "Accompagnement au top, vendu en 3 semaines."],
        ["Inès Roux", "", 5, "Équipe réactive et de bon conseil."],
      ]) },
      { type: "messages", id: "messages", label: "Messages", icon: Mail, seed: messages([
        ["Paul Girard", "paul@mail.fr", "Estimation", "Bonjour, j'aimerais faire estimer ma maison à Caudéran.", false],
      ]) },
      { type: "settings", id: "parametres", label: "Paramètres", icon: Settings },
      ...commonSections(),
    ],
  },

  // ─────────────────────── BOUTIQUE / E-COMMERCE ───────────────────────
  {
    id: "boutique",
    label: "Boutique / E-commerce",
    icon: ShoppingBag,
    tagline: "Produits, commandes, codes promo…",
    businessName: "Atelier Céleste",
    accent: "#8B5CF6",
    settings: { tagline: "Bougies & décoration artisanale", email: "hello@atelier-celeste.fr", phone: "01 45 00 00 00", address: "Boutique en ligne", hours: "Expéditions sous 48 h", promo_active: true, promo_label: "Offre découverte", promo_percent: 10 },
    sections: [
      {
        type: "collection", id: "produits", label: "Produits", icon: Package,
        itemLabel: "un produit", titleField: "nom", layout: "grid", colorField: "color",
        fields: [
          { key: "nom", label: "Nom du produit", type: "text", required: true },
          { key: "categorie", label: "Catégorie", type: "select", options: ["Bougies", "Décoration", "Coffrets", "Accessoires"], badge: true },
          { key: "prix", label: "Prix", type: "price", suffix: " €" },
          { key: "stock", label: "Stock", type: "number", suffix: " u." },
          { key: "description", label: "Description", type: "textarea", hideInList: true },
          { key: "disponible", label: "En vente", type: "boolean" },
          { key: "color", label: "Couleur du visuel", type: "color", hideInList: true },
        ],
        seed: [
          { id: "1", nom: "Bougie Figue & Cassis", categorie: "Bougies", prix: 24, stock: 42, description: "Cire végétale, 45 h de combustion.", disponible: true, color: "from-rose-500/30 to-vanyo-500/30" },
          { id: "2", nom: "Coffret Cocooning", categorie: "Coffrets", prix: 49, stock: 12, description: "2 bougies + plaid + carte.", disponible: true, color: "from-violet-hi/30 to-vanyo-500/30" },
          { id: "3", nom: "Vase ondulé terracotta", categorie: "Décoration", prix: 32, stock: 0, description: "Grès émaillé fait main.", disponible: false, color: "from-amber-500/30 to-vanyo-500/30" },
        ],
      },
      {
        type: "requests", id: "commandes", label: "Commandes", icon: ClipboardList,
        nameField: "client", countsAsPending: true,
        statuses: ["Nouvelle", "Payée", "Expédiée", "Livrée", "Annulée"],
        columns: ["produits", "montant"],
        fields: [
          { key: "client", label: "Client", type: "text", required: true },
          { key: "email", label: "Email", type: "text" },
          { key: "produits", label: "Produits", type: "text" },
          { key: "montant", label: "Montant", type: "price", suffix: " €" },
          { key: "adresse", label: "Adresse de livraison", type: "textarea" },
        ],
        seed: [
          { id: "1", created_at: ago(3 * H), status: "Nouvelle", client: "Emma Petit", email: "emma@mail.fr", produits: "Coffret Cocooning ×1", montant: 49, adresse: "12 rue des Fleurs, 75011 Paris", viewed: false },
          { id: "2", created_at: ago(30 * H), status: "Payée", client: "Hugo Blanc", email: "hugo@mail.fr", produits: "Bougie Figue & Cassis ×2", montant: 48, adresse: "5 av. Jean Jaurès, 69007 Lyon", viewed: true },
          { id: "3", created_at: ago(4 * D), status: "Livrée", client: "Chloé Simon", email: "chloe@mail.fr", produits: "Vase ondulé ×1", montant: 32, adresse: "8 rue Nationale, 59000 Lille", viewed: true },
        ],
      },
      {
        type: "collection", id: "promos", label: "Codes promo", icon: Ticket,
        itemLabel: "un code", titleField: "code", layout: "list",
        fields: [
          { key: "code", label: "Code", type: "text", required: true },
          { key: "reduction", label: "Réduction", type: "number", suffix: " %", badge: true },
          { key: "description", label: "Description", type: "text" },
          { key: "actif", label: "Actif", type: "boolean" },
        ],
        seed: [
          { id: "1", code: "BIENVENUE10", reduction: 10, description: "Première commande", actif: true },
          { id: "2", code: "NOEL20", reduction: 20, description: "Opération fêtes", actif: false },
        ],
      },
      { type: "reviews", id: "avis", label: "Avis clients", icon: Star, seed: reviews([
        ["Emma Petit", "", 5, "Emballage soigné et bougies divines. Merci !"],
        ["Chloé Simon", "", 5, "Livraison rapide, produits de grande qualité."],
      ]) },
      { type: "messages", id: "messages", label: "Messages", icon: Mail, seed: messages([
        ["Nadia K.", "nadia@mail.fr", "Réassort", "Bonjour, le vase terracotta sera-t-il bientôt réapprovisionné ?", false],
      ]) },
      { type: "settings", id: "parametres", label: "Paramètres", icon: Settings },
      ...commonSections(),
    ],
  },

  // ─────────────────────── ARTISAN / SERVICES ───────────────────────
  {
    id: "artisan",
    label: "Artisan / Services",
    icon: Wrench,
    tagline: "Prestations, demandes de devis, réalisations…",
    businessName: "Dupont Rénovation",
    accent: "#E08A1E",
    settings: { tagline: "Rénovation & dépannage — Toulouse", email: "contact@dupont-renovation.fr", phone: "05 61 00 00 00", address: "Toulouse et alentours", hours: "Lun – Ven · 8h – 18h" },
    sections: [
      {
        type: "collection", id: "prestations", label: "Prestations", icon: Hammer,
        itemLabel: "une prestation", titleField: "nom", layout: "grid", colorField: "color",
        fields: [
          { key: "nom", label: "Prestation", type: "text", required: true },
          { key: "categorie", label: "Catégorie", type: "select", options: ["Plomberie", "Électricité", "Peinture", "Rénovation", "Dépannage"], badge: true },
          { key: "tarif", label: "Tarif indicatif", type: "text", placeholder: "Sur devis" },
          { key: "description", label: "Description", type: "textarea", hideInList: true },
          { key: "color", label: "Couleur", type: "color", hideInList: true },
        ],
        seed: [
          { id: "1", nom: "Rénovation de salle de bain", categorie: "Rénovation", tarif: "À partir de 3 500 €", description: "Clé en main : plomberie, carrelage, finitions.", color: "from-amber-500/30 to-vanyo-500/30" },
          { id: "2", nom: "Dépannage plomberie 24/7", categorie: "Dépannage", tarif: "À partir de 90 €", description: "Fuites, débouchage, urgences.", color: "from-sky-500/30 to-vanyo-500/30" },
          { id: "3", nom: "Mise aux normes électrique", categorie: "Électricité", tarif: "Sur devis", description: "Tableau, prises, sécurité.", color: "from-rose-500/30 to-vanyo-500/30" },
        ],
      },
      {
        type: "requests", id: "devis", label: "Demandes de devis", icon: ClipboardList,
        nameField: "client", countsAsPending: true,
        statuses: ["Nouveau", "Contacté", "Devis envoyé", "Accepté", "Refusé"],
        columns: ["prestation", "budget"],
        fields: [
          { key: "client", label: "Client", type: "text", required: true },
          { key: "email", label: "Email", type: "text" },
          { key: "telephone", label: "Téléphone", type: "text" },
          { key: "prestation", label: "Prestation", type: "text" },
          { key: "adresse", label: "Adresse du chantier", type: "text" },
          { key: "budget", label: "Budget estimé", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
        ],
        seed: [
          { id: "1", created_at: ago(2 * H), status: "Nouveau", client: "Fabrice Roux", email: "fabrice@mail.fr", telephone: "06 44 55 66 77", prestation: "Rénovation salle de bain", adresse: "14 rue du Taur, Toulouse", budget: "4 000 €", description: "Refaire entièrement une salle de bain de 6 m².", viewed: false },
          { id: "2", created_at: ago(27 * H), status: "Contacté", client: "Aurélie Mas", email: "aurelie@mail.fr", telephone: "07 33 22 11 00", prestation: "Mise aux normes électrique", adresse: "3 imp. des Lilas, Blagnac", budget: "Sur devis", description: "Tableau électrique ancien à remplacer.", viewed: true },
        ],
      },
      {
        type: "collection", id: "realisations", label: "Réalisations", icon: ImageIcon,
        itemLabel: "une réalisation", titleField: "titre", layout: "grid", colorField: "color",
        fields: [
          { key: "titre", label: "Titre", type: "text", required: true },
          { key: "type", label: "Type de travaux", type: "text" },
          { key: "lieu", label: "Lieu", type: "text" },
          { key: "color", label: "Couleur", type: "color", hideInList: true },
        ],
        seed: [
          { id: "1", titre: "Salle de bain contemporaine", type: "Rénovation complète", lieu: "Toulouse", color: "from-amber-500/30 to-vanyo-500/30" },
          { id: "2", titre: "Cuisine ouverte", type: "Rénovation", lieu: "Colomiers", color: "from-emerald-500/30 to-vanyo-500/30" },
        ],
      },
      { type: "reviews", id: "avis", label: "Avis clients", icon: Star, seed: reviews([
        ["Fabrice Roux", "", 5, "Travail soigné, délais respectés. Je recommande."],
        ["Aurélie Mas", "", 5, "Intervention rapide et tarif honnête."],
      ]) },
      { type: "messages", id: "messages", label: "Messages", icon: Mail, seed: messages([
        ["Karim B.", "karim@mail.fr", "Disponibilité", "Bonjour, intervenez-vous à Muret pour un dégât des eaux ?", false],
      ]) },
      { type: "settings", id: "parametres", label: "Paramètres", icon: Settings },
      ...commonSections(),
    ],
  },

  // ─────────────────────── BEAUTÉ / COIFFURE ───────────────────────
  {
    id: "beaute",
    label: "Beauté / Coiffure",
    icon: Scissors,
    tagline: "Rendez-vous, prestations, équipe…",
    businessName: "Studio Éclat",
    accent: "#D6567E",
    settings: { tagline: "Salon de coiffure & beauté — Nantes", email: "contact@studio-eclat.fr", phone: "02 40 00 00 00", address: "10 rue Crébillon, 44000 Nantes", hours: "Mar – Sam · 9h – 19h" },
    sections: [
      {
        type: "requests", id: "rdv", label: "Rendez-vous", icon: CalendarClock,
        nameField: "client", countsAsPending: true,
        statuses: ["Demandé", "Confirmé", "Honoré", "Annulé"],
        columns: ["prestation", "date"],
        fields: [
          { key: "client", label: "Cliente / Client", type: "text", required: true },
          { key: "email", label: "Email", type: "text" },
          { key: "telephone", label: "Téléphone", type: "text" },
          { key: "prestation", label: "Prestation", type: "select", options: ["Coupe", "Coloration", "Brushing", "Soin", "Manucure"] },
          { key: "date", label: "Date", type: "date" },
          { key: "heure", label: "Heure", type: "select", options: ["9:00", "10:30", "12:00", "14:00", "15:30", "17:00"] },
        ],
        seed: [
          { id: "1", created_at: ago(1 * H), status: "Demandé", client: "Laura Meyer", email: "laura@mail.fr", telephone: "06 12 12 12 12", prestation: "Coloration", date: "2026-07-24", heure: "14:00", viewed: false },
          { id: "2", created_at: ago(20 * H), status: "Confirmé", client: "Nadia Cherif", email: "nadia@mail.fr", telephone: "07 21 21 21 21", prestation: "Coupe", date: "2026-07-23", heure: "10:30", viewed: true },
        ],
      },
      { type: "planning", id: "planning", label: "Planning", icon: CalendarDays, sourceId: "rdv", dateField: "date", timeField: "heure" },
      {
        type: "collection", id: "prestations", label: "Prestations & tarifs", icon: Sparkles,
        itemLabel: "une prestation", titleField: "nom", layout: "list",
        fields: [
          { key: "nom", label: "Prestation", type: "text", required: true },
          { key: "duree", label: "Durée", type: "text", placeholder: "45 min" },
          { key: "prix", label: "Prix", type: "price", suffix: " €" },
          { key: "description", label: "Description", type: "textarea", hideInList: true },
        ],
        seed: [
          { id: "1", nom: "Coupe & brushing", duree: "45 min", prix: 39, description: "Diagnostic, coupe, coiffage." },
          { id: "2", nom: "Coloration complète", duree: "1h30", prix: 69, description: "Couleur sur mesure, soin inclus." },
          { id: "3", nom: "Manucure semi-permanente", duree: "50 min", prix: 35, description: "Pose vernis longue tenue." },
        ],
      },
      {
        type: "collection", id: "equipe", label: "Équipe", icon: Users,
        itemLabel: "un membre", titleField: "nom", layout: "grid", colorField: "color",
        fields: [
          { key: "nom", label: "Nom", type: "text", required: true },
          { key: "role", label: "Rôle", type: "text" },
          { key: "specialite", label: "Spécialité", type: "text" },
          { key: "color", label: "Couleur", type: "color", hideInList: true },
        ],
        seed: [
          { id: "1", nom: "Élodie", role: "Coiffeuse coloriste", specialite: "Balayage", color: "from-rose-500/30 to-vanyo-500/30" },
          { id: "2", nom: "Thomas", role: "Barbier", specialite: "Taille de barbe", color: "from-sky-500/30 to-vanyo-500/30" },
        ],
      },
      { type: "reviews", id: "avis", label: "Avis clients", icon: Star, seed: reviews([
        ["Laura Meyer", "", 5, "Élodie a sublimé ma couleur, je suis conquise !"],
        ["Nadia Cherif", "", 5, "Accueil chaleureux et résultat impeccable."],
      ]) },
      { type: "messages", id: "messages", label: "Messages", icon: Mail, seed: messages([
        ["Camille V.", "camille@mail.fr", "Mariage", "Bonjour, faites-vous les coiffures de mariée à domicile ?", false],
      ]) },
      { type: "settings", id: "parametres", label: "Paramètres", icon: Settings },
      ...commonSections(),
    ],
  },

  // ─────────────────────────── SANTÉ ───────────────────────────
  {
    id: "sante",
    label: "Santé / Cabinet",
    icon: Stethoscope,
    tagline: "Rendez-vous, praticiens, actes…",
    businessName: "Cabinet Saint-Roch",
    accent: "#2AA198",
    settings: { tagline: "Cabinet médical — Montpellier", email: "secretariat@cabinet-saintroch.fr", phone: "04 67 00 00 00", address: "5 place Saint-Roch, 34000 Montpellier", hours: "Lun – Ven · 8h – 19h" },
    sections: [
      {
        type: "requests", id: "rdv", label: "Rendez-vous", icon: CalendarDays,
        nameField: "patient", countsAsPending: true,
        statuses: ["Demandé", "Confirmé", "Honoré", "Annulé"],
        columns: ["motif", "date"],
        fields: [
          { key: "patient", label: "Patient", type: "text", required: true },
          { key: "email", label: "Email", type: "text" },
          { key: "telephone", label: "Téléphone", type: "text" },
          { key: "motif", label: "Motif", type: "text" },
          { key: "praticien", label: "Praticien", type: "select", options: ["Dr Martin", "Dr Lemoine"] },
          { key: "date", label: "Date", type: "date" },
          { key: "heure", label: "Heure", type: "select", options: ["8:30", "9:15", "10:00", "11:00", "14:00", "15:30", "16:30"] },
        ],
        seed: [
          { id: "1", created_at: ago(2 * H), status: "Demandé", patient: "Robert Alix", email: "robert@mail.fr", telephone: "06 55 44 33 22", motif: "Consultation générale", praticien: "Dr Martin", date: "2026-07-24", heure: "9:15", viewed: false },
          { id: "2", created_at: ago(22 * H), status: "Confirmé", patient: "Fatima Zahra", email: "fatima@mail.fr", telephone: "07 66 55 44 33", motif: "Renouvellement ordonnance", praticien: "Dr Lemoine", date: "2026-07-23", heure: "14:00", viewed: true },
        ],
      },
      { type: "planning", id: "planning", label: "Planning", icon: CalendarDays, sourceId: "rdv", dateField: "date", timeField: "heure" },
      {
        type: "collection", id: "praticiens", label: "Praticiens", icon: Users,
        itemLabel: "un praticien", titleField: "nom", layout: "grid", colorField: "color",
        fields: [
          { key: "nom", label: "Nom", type: "text", required: true },
          { key: "specialite", label: "Spécialité", type: "text" },
          { key: "horaires", label: "Horaires", type: "text" },
          { key: "color", label: "Couleur", type: "color", hideInList: true },
        ],
        seed: [
          { id: "1", nom: "Dr Martin", specialite: "Médecine générale", horaires: "Lun – Ven, matin", color: "from-teal-500/30 to-vanyo-500/30" },
          { id: "2", nom: "Dr Lemoine", specialite: "Médecine générale", horaires: "Mar – Sam, après-midi", color: "from-emerald-500/30 to-vanyo-500/30" },
        ],
      },
      {
        type: "collection", id: "actes", label: "Actes & tarifs", icon: ClipboardList,
        itemLabel: "un acte", titleField: "nom", layout: "list",
        fields: [
          { key: "nom", label: "Acte", type: "text", required: true },
          { key: "tarif", label: "Tarif", type: "price", suffix: " €" },
          { key: "remboursement", label: "Remboursement", type: "text" },
          { key: "description", label: "Description", type: "textarea", hideInList: true },
        ],
        seed: [
          { id: "1", nom: "Consultation", tarif: 26.5, remboursement: "70 % Sécu", description: "Consultation générale." },
          { id: "2", nom: "Visite à domicile", tarif: 35, remboursement: "70 % Sécu", description: "Sur justificatif." },
        ],
      },
      { type: "messages", id: "messages", label: "Messages", icon: Mail, seed: messages([
        ["Marie D.", "marie@mail.fr", "Résultats", "Bonjour, mes résultats d'analyse sont-ils disponibles ?", false],
      ]) },
      { type: "settings", id: "parametres", label: "Paramètres", icon: Settings },
      ...commonSections(),
    ],
  },

  // ─────────────────────────── ASSOCIATION ───────────────────────────
  {
    id: "association",
    label: "Association",
    icon: HandHeart,
    tagline: "Événements, adhésions, actualités…",
    businessName: "Les Jardins Solidaires",
    accent: "#3F9E5A",
    settings: { tagline: "Association d'insertion par le jardinage", email: "contact@jardins-solidaires.org", phone: "03 20 00 00 00", address: "22 rue de l'Espoir, 59000 Lille", hours: "Permanences : Mer & Sam" },
    sections: [
      {
        type: "collection", id: "evenements", label: "Événements", icon: CalendarDays,
        itemLabel: "un événement", titleField: "titre", layout: "grid", colorField: "color",
        fields: [
          { key: "titre", label: "Titre", type: "text", required: true },
          { key: "date", label: "Date", type: "date" },
          { key: "lieu", label: "Lieu", type: "text" },
          { key: "description", label: "Description", type: "textarea", hideInList: true },
          { key: "color", label: "Couleur", type: "color", hideInList: true },
        ],
        seed: [
          { id: "1", titre: "Grande journée plantation", date: "2026-09-14", lieu: "Jardin partagé Moulins", description: "Ouvert à tous, prévoir des gants.", color: "from-emerald-500/30 to-vanyo-500/30" },
          { id: "2", titre: "Atelier compostage", date: "2026-08-30", lieu: "Local associatif", description: "Apprenez à composter chez vous.", color: "from-lime-500/30 to-vanyo-500/30" },
        ],
      },
      {
        type: "requests", id: "adhesions", label: "Adhésions & contacts", icon: HandHeart,
        nameField: "nom", countsAsPending: true,
        statuses: ["Nouvelle", "Traitée", "Membre", "Archivée"],
        columns: ["type"],
        fields: [
          { key: "nom", label: "Nom", type: "text", required: true },
          { key: "email", label: "Email", type: "text" },
          { key: "telephone", label: "Téléphone", type: "text" },
          { key: "type", label: "Type", type: "select", options: ["Adhésion", "Bénévolat", "Don", "Information"] },
          { key: "message", label: "Message", type: "textarea" },
        ],
        seed: [
          { id: "1", created_at: ago(3 * H), status: "Nouvelle", nom: "Bénédicte Aubert", email: "bene@mail.fr", telephone: "06 10 20 30 40", type: "Bénévolat", message: "Je souhaite aider le samedi matin.", viewed: false },
          { id: "2", created_at: ago(2 * D), status: "Membre", nom: "Olivier Rey", email: "olivier@mail.fr", type: "Adhésion", message: "Adhésion annuelle.", viewed: true },
        ],
      },
      {
        type: "collection", id: "actus", label: "Actualités", icon: Newspaper,
        itemLabel: "une actualité", titleField: "titre", layout: "list", colorField: "color",
        fields: [
          { key: "titre", label: "Titre", type: "text", required: true },
          { key: "date", label: "Date", type: "date" },
          { key: "extrait", label: "Extrait", type: "textarea", hideInList: true },
          { key: "publie", label: "Publié", type: "boolean" },
          { key: "color", label: "Couleur", type: "color", hideInList: true },
        ],
        seed: [
          { id: "1", titre: "Bilan de la saison 2026", date: "2026-07-10", extrait: "Une récolte record grâce à vous !", publie: true, color: "from-emerald-500/30 to-vanyo-500/30" },
        ],
      },
      { type: "reviews", id: "avis", label: "Témoignages", icon: Star, seed: reviews([
        ["Olivier Rey", "", 5, "Une association humaine qui change des vies."],
      ]) },
      { type: "messages", id: "messages", label: "Messages", icon: Mail, seed: messages([
        ["Mairie de Lille", "culture@mail.fr", "Partenariat", "Nous aimerions vous proposer un partenariat pour 2027.", false],
      ]) },
      { type: "settings", id: "parametres", label: "Paramètres", icon: Settings },
      ...commonSections(),
    ],
  },

  // ─────────────────────── PHOTOGRAPHE / PORTFOLIO ───────────────────────
  {
    id: "photographe",
    label: "Photographe / Créatif",
    icon: Camera,
    tagline: "Portfolio, demandes de shooting, formules…",
    businessName: "Camille Noé Photographie",
    accent: "#6D4AFF",
    settings: { tagline: "Photographe mariage & portrait", email: "hello@camillenoe.fr", phone: "06 00 00 00 00", address: "Paris · déplacements France entière", hours: "Sur rendez-vous" },
    sections: [
      {
        type: "collection", id: "portfolio", label: "Portfolio", icon: Aperture,
        itemLabel: "une photo", titleField: "titre", layout: "grid", colorField: "color",
        fields: [
          { key: "titre", label: "Titre", type: "text", required: true },
          { key: "categorie", label: "Catégorie", type: "select", options: ["Mariage", "Portrait", "Événement", "Produit", "Mode"], badge: true },
          { key: "annee", label: "Année", type: "text" },
          { key: "color", label: "Couleur", type: "color", hideInList: true },
        ],
        seed: [
          { id: "1", titre: "Mariage à la campagne", categorie: "Mariage", annee: "2026", color: "from-vanyo-500/30 to-violet-hi/30" },
          { id: "2", titre: "Portrait studio", categorie: "Portrait", annee: "2026", color: "from-rose-500/30 to-vanyo-500/30" },
          { id: "3", titre: "Collection mode", categorie: "Mode", annee: "2025", color: "from-indigo-500/30 to-vanyo-500/30" },
        ],
      },
      {
        type: "requests", id: "demandes", label: "Demandes de shooting", icon: CalendarClock,
        nameField: "client", countsAsPending: true,
        statuses: ["Nouvelle", "En discussion", "Réservée", "Réalisée", "Annulée"],
        columns: ["type", "date"],
        fields: [
          { key: "client", label: "Client", type: "text", required: true },
          { key: "email", label: "Email", type: "text" },
          { key: "telephone", label: "Téléphone", type: "text" },
          { key: "type", label: "Type de shooting", type: "select", options: ["Mariage", "Portrait", "Événement", "Produit"] },
          { key: "date", label: "Date souhaitée", type: "date" },
          { key: "lieu", label: "Lieu", type: "text" },
          { key: "budget", label: "Budget", type: "text" },
          { key: "message", label: "Message", type: "textarea" },
        ],
        seed: [
          { id: "1", created_at: ago(2 * H), status: "Nouvelle", client: "Marion & Lucas", email: "marion@mail.fr", telephone: "06 77 88 99 00", type: "Mariage", date: "2026-09-05", lieu: "Château de Vaux", budget: "2 000 €", message: "Mariage 120 invités, reportage complet.", viewed: false },
          { id: "2", created_at: ago(30 * H), status: "En discussion", client: "Studio Mode", email: "studio@mail.fr", type: "Mode", date: "2026-08-12", lieu: "Paris 11e", budget: "Sur devis", message: "Shooting lookbook automne.", viewed: true },
        ],
      },
      { type: "planning", id: "planning", label: "Planning des shootings", icon: CalendarDays, sourceId: "demandes", dateField: "date" },
      {
        type: "collection", id: "formules", label: "Formules", icon: ClipboardList,
        itemLabel: "une formule", titleField: "nom", layout: "list",
        fields: [
          { key: "nom", label: "Formule", type: "text", required: true },
          { key: "prix", label: "Prix", type: "price", suffix: " €" },
          { key: "inclus", label: "Inclus", type: "tags", placeholder: "Séparés par des virgules", hideInList: true },
          { key: "description", label: "Description", type: "textarea", hideInList: true },
        ],
        seed: [
          { id: "1", nom: "Mariage Essentiel", prix: 1290, inclus: ["6h de reportage", "300 photos", "Galerie en ligne"], description: "Idéal pour un mariage intime." },
          { id: "2", nom: "Portrait Signature", prix: 290, inclus: ["1h de séance", "20 photos retouchées"], description: "En studio ou extérieur." },
        ],
      },
      { type: "reviews", id: "avis", label: "Avis clients", icon: Star, seed: reviews([
        ["Marion & Lucas", "", 5, "Des photos magiques, exactement notre univers."],
        ["Studio Mode", "", 5, "Professionnalisme et créativité au rendez-vous."],
      ]) },
      { type: "messages", id: "messages", label: "Messages", icon: Mail, seed: messages([
        ["Julie P.", "julie@mail.fr", "Disponibilité août", "Bonjour, êtes-vous libre le 22 août pour un portrait famille ?", false],
      ]) },
      { type: "settings", id: "parametres", label: "Paramètres", icon: Settings },
      ...commonSections(),
    ],
  },

  // ─────────────────────────── GARAGE AUTOMOBILE ───────────────────────────
  {
    id: "garage",
    label: "Garage automobile",
    icon: Car,
    tagline: "Rendez-vous atelier, prestations, véhicules d'occasion…",
    businessName: "Garage Delorme",
    accent: "#D6342A",
    settings: { tagline: "Mécanique, entretien & occasions", email: "contact@garage-delorme.fr", phone: "02 40 00 00 00", address: "Zone artisanale, Loire-Atlantique", hours: "Lun – Ven · 8h – 18h30 · Sam matin" },
    sections: [
      {
        type: "requests", id: "rendezvous", label: "Rendez-vous atelier", icon: CalendarClock,
        nameField: "client", countsAsPending: true,
        statuses: ["Nouvelle", "Confirmé", "Honoré", "Annulé"],
        columns: ["prestation", "vehicule"],
        fields: [
          { key: "client", label: "Client", type: "text", required: true },
          { key: "email", label: "Email", type: "text" },
          { key: "telephone", label: "Téléphone", type: "text" },
          { key: "vehicule", label: "Véhicule", type: "text", placeholder: "Marque, modèle, année" },
          { key: "prestation", label: "Prestation", type: "select", options: ["Révision", "Vidange", "Pneus", "Diagnostic panne", "Carrosserie", "Contrôle technique (préparation)"] },
          { key: "date", label: "Date souhaitée", type: "date" },
          { key: "heure", label: "Heure", type: "select", options: ["8:00", "9:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"] },
          { key: "notes", label: "Description de la panne / demande", type: "textarea" },
        ],
        seed: [
          { id: "1", created_at: ago(2 * H), status: "Nouvelle", client: "Kevin Ardant", email: "kevin@mail.fr", telephone: "06 33 22 11 00", vehicule: "Peugeot 308 (2019)", prestation: "Révision", date: "2026-07-25", heure: "9:00", notes: "Voyant moteur allumé depuis hier.", viewed: false },
          { id: "2", created_at: ago(26 * H), status: "Confirmé", client: "Sophie Renaud", email: "sophie@mail.fr", telephone: "07 44 55 66 77", vehicule: "Porsche 911 (2016)", prestation: "Diagnostic panne", date: "2026-07-24", heure: "14:00", notes: "Bruit suspect au freinage.", viewed: true },
          { id: "3", created_at: ago(3 * D), status: "Honoré", client: "Marc Guillou", email: "marc@mail.fr", vehicule: "Renault Clio (2021)", prestation: "Pneus", date: "2026-07-19", heure: "10:00", viewed: true },
        ],
      },
      { type: "planning", id: "planning", label: "Planning atelier", icon: CalendarDays, sourceId: "rendezvous", dateField: "date", timeField: "heure" },
      {
        type: "collection", id: "prestations", label: "Prestations & tarifs", icon: Wrench,
        itemLabel: "une prestation", titleField: "nom", layout: "list",
        fields: [
          { key: "nom", label: "Prestation", type: "text", required: true },
          { key: "categorie", label: "Catégorie", type: "select", options: ["Entretien", "Mécanique", "Pneumatiques", "Carrosserie", "Diagnostic"], badge: true },
          { key: "prix", label: "Prix indicatif", type: "text", placeholder: "À partir de 49€" },
          { key: "description", label: "Description", type: "textarea", hideInList: true },
        ],
        seed: [
          { id: "1", nom: "Vidange + filtre à huile", categorie: "Entretien", prix: "À partir de 79€", description: "Vidange moteur avec huile et filtre d'origine ou équivalent." },
          { id: "2", nom: "Révision complète", categorie: "Entretien", prix: "À partir de 149€", description: "Contrôle des points de sécurité, niveaux, freins, suspension." },
          { id: "3", nom: "Montage 4 pneus", categorie: "Pneumatiques", prix: "À partir de 39€ la pose", description: "Montage, équilibrage et valves neuves, pneu non inclus." },
          { id: "4", nom: "Diagnostic électronique", categorie: "Diagnostic", prix: "39€", description: "Lecture des défauts moteur via valise de diagnostic." },
        ],
      },
      {
        type: "collection", id: "occasions", label: "Véhicules d'occasion", icon: Gauge,
        itemLabel: "un véhicule", titleField: "titre", layout: "grid", colorField: "color", imageField: "image",
        fields: [
          { key: "titre", label: "Titre de l'annonce", type: "text", required: true },
          { key: "image", label: "Photo du véhicule", type: "image", hideInList: true },
          { key: "prix", label: "Prix", type: "price", suffix: " €" },
          { key: "annee", label: "Année", type: "text" },
          { key: "kilometrage", label: "Kilométrage", type: "text", placeholder: "45 000 km" },
          { key: "carburant", label: "Carburant", type: "select", options: ["Essence", "Diesel", "Hybride", "Électrique"] },
          { key: "description", label: "Description", type: "textarea", hideInList: true },
          { key: "vendu", label: "Vendu", type: "boolean" },
          { key: "color", label: "Couleur du visuel", type: "color", hideInList: true },
        ],
        seed: [
          { id: "1", titre: "Porsche Boxster S", prix: 32900, annee: "2018", kilometrage: "58 000 km", carburant: "Essence", description: "Toit dur, entretien exclusivement en concession.", vendu: false, color: "from-rose-500/30 to-vanyo-500/30" },
          { id: "2", titre: "Ferrari 348 (collection)", prix: 89000, annee: "1991", kilometrage: "72 000 km", carburant: "Essence", description: "Véhicule de collection, historique complet disponible.", vendu: false, color: "from-amber-500/30 to-vanyo-500/30" },
          { id: "3", titre: "Volkswagen Golf GTD", prix: 18900, annee: "2020", kilometrage: "41 000 km", carburant: "Diesel", description: "Première main, carnet d'entretien à jour.", vendu: false, color: "from-sky-500/30 to-vanyo-500/30" },
        ],
      },
      { type: "reviews", id: "avis", label: "Avis clients", icon: Star, seed: reviews([
        ["Kevin Ardant", "", 5, "Diagnostic rapide et prix honnête, je recommande."],
        ["Sophie Renaud", "", 5, "Une équipe qui s'y connaît vraiment, même sur les voitures de collection."],
      ]) },
      { type: "messages", id: "messages", label: "Messages", icon: Mail, seed: messages([
        ["Antoine V.", "antoine@mail.fr", "Rachat véhicule", "Bonjour, reprenez-vous les anciens véhicules à l'achat d'une occasion ?", false],
      ]) },
      { type: "settings", id: "parametres", label: "Paramètres", icon: Settings },
      ...commonSections(),
    ],
  },
];

export const METIERS_BY_ID: Record<string, MetierConfig> = Object.fromEntries(
  METIERS.map((m) => [m.id, m])
);

export function getMetier(id: string): MetierConfig | undefined {
  return METIERS_BY_ID[id];
}

// Icônes exportées pour l'écran de choix (évite un second import).
export { Store, Leaf, Key };
