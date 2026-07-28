import type { Intent } from "./nlu";

/**
 * Le nom lisible de chaque intention, pour le panel d'administration.
 *
 * Corriger une question consiste à la rattacher à l'une de ces rubriques.
 * Les libellés sont donc rédigés du point de vue de la personne qui corrige —
 * « Les prix et les formules », pas « prix » — pour que le choix se fasse sans
 * connaître le fonctionnement interne du moteur.
 *
 * Les intentions purement conversationnelles (salutation, remerciement…) et
 * celles que le moteur déduit seul (oui, non, inconnu) sont volontairement
 * absentes : y rattacher une question n'aurait aucun sens.
 */
export const INTENT_LABELS: Partial<Record<Intent, string>> & Record<string, string> = {
  prix: "Les prix en général",
  prix_formule: "Les formules et leurs différences",
  trop_cher: "Trouve ça cher, hésite sur le budget",
  paiement_modalites: "Modalités de paiement",
  acompte: "Acompte à la commande",

  delai: "Les délais de livraison",
  processus: "Le déroulement d'un projet",
  veut_un_site: "Veut lancer un projet (démarre l'entretien)",
  devis: "Demander un devis",
  contact: "Nous contacter",
  aide_formulaire: "Aide pour remplir un formulaire",

  services: "Les prestations proposées",
  realisations: "Voir les réalisations",
  avis: "Les avis clients",
  identite: "Qui est Vanyo",
  comparaison: "Comparaison avec Wix, WordPress…",
  ville: "Zone d'intervention, villes",

  maintenance: "La maintenance mensuelle",
  engagement_duree: "Engagement et résiliation",
  modifications_apres: "Faire évoluer le site après livraison",
  formation: "Prise en main, formation",
  autonomie: "Modifier le site soi-même",

  mise_en_ligne: "Domaine, hébergement, emails",
  seo: "Le référencement Google",
  statistiques: "Statistiques et trafic",
  vitesse: "Vitesse et performances",
  responsive: "Affichage mobile",
  accessibilite: "Accessibilité",
  securite: "Sécurité du site",
  rgpd: "RGPD, cookies, données",
  propriete_code: "Propriété du site et du code",
  garantie: "Garanties",

  ecommerce: "Vendre en ligne",
  multilingue: "Site en plusieurs langues",
  reseaux_sociaux: "Réseaux sociaux",
  contenu_textes: "Rédaction des textes",
  photos: "Les photos du site",
  logo: "Logo et charte graphique",
  refonte: "Refonte d'un site existant",

  menu: "Montrer le sommaire des sujets",
  explique_page: "Expliquer la page en cours",
  hors_sujet: "Hors sujet (à écarter poliment)",
};
