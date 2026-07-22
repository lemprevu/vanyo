/**
 * Pages de référencement local (« création site internet à [ville] »).
 * Vanyo travaille à distance dans toute la France (pas d'agence physique) :
 * chaque page cible l'intention de recherche locale sans prétendre à une
 * présence sur place. Le contenu ci-dessous est volontairement unique par
 * ville (contexte économique réel, secteurs dominants) pour éviter tout
 * risque de contenu dupliqué aux yeux de Google.
 */

export type City = {
  slug: string;
  name: string;
  region: string;
  department: string;
  population: string;
  /** Paragraphe d'introduction unique : contexte économique local réel. */
  intro: string;
  /** 3 secteurs d'activité mis en avant pour cette ville (artisanat, tourisme, tech...). */
  sectors: string[];
  /** FAQ locale : 3 questions adaptées au contexte de la ville. */
  faq: { question: string; answer: string }[];
};

export const CITIES: City[] = [
  {
    slug: "nantes",
    name: "Nantes",
    region: "Pays de la Loire",
    department: "Loire-Atlantique",
    population: "320 000",
    intro:
      "Nantes s'est imposée comme l'une des métropoles françaises les plus dynamiques pour l'entrepreneuriat, portée par un tissu dense de start-ups, d'artisans et de commerces indépendants. Face à une concurrence locale de plus en plus visible en ligne, un site internet rapide et bien référencé fait souvent la différence entre un client qui vous trouve sur Google et un client qui trouve votre voisin.",
    sectors: ["Restaurants et commerces du centre-ville et de l'île de Nantes", "Artisans et professions libérales de l'agglomération", "Start-ups et scale-ups du quartier de la Création"],
    faq: [
      { question: "Vanyo a-t-il une agence à Nantes ?", answer: "Vanyo travaille à distance avec des clients dans toute la France, dont de nombreux à Nantes et en Loire-Atlantique. L'absence de local physique nous permet de proposer des tarifs plus compétitifs, sans compromis sur la qualité ni la réactivité : tous les échanges se font par téléphone, visio ou email." },
      { question: "Combien de temps pour lancer un site à Nantes ?", answer: "Comptez en moyenne 12 jours entre la validation du projet et la mise en ligne, que vous soyez à Nantes, à Rezé ou à Saint-Herblain." },
      { question: "Proposez-vous du référencement local pour être visible sur \"Nantes\" ?", answer: "Oui : structuration des balises, données structurées LocalBusiness si vous avez une adresse, fiche Google Business Profile optimisée et contenu ciblé sur votre zone de chalandise." },
    ],
  },
  {
    slug: "rennes",
    name: "Rennes",
    region: "Bretagne",
    department: "Ille-et-Vilaine",
    population: "220 000",
    intro:
      "Rennes conjugue un pôle étudiant majeur et un écosystème numérique reconnu (French Tech), ce qui pousse les entreprises locales à soigner particulièrement leur image en ligne. Dans une ville où la concurrence entre commerces du centre historique et zones commerciales périphériques est forte, un site rapide et bien structuré est un vrai levier de visibilité.",
    sectors: ["Commerces et restaurants du centre historique", "Entreprises tech et numériques de la métropole", "Artisans et professions de santé de l'agglomération rennaise"],
    faq: [
      { question: "Intervenez-vous pour des clients à Rennes ?", answer: "Oui, nous accompagnons des clients à Rennes et dans toute l'Ille-et-Vilaine, entièrement à distance : visio, téléphone et un panel d'administration pour suivre votre projet en temps réel." },
      { question: "Un site adapté à une clientèle étudiante et locale, est-ce possible ?", answer: "Absolument. Nous adaptons le ton, les visuels et les call-to-action selon votre cible : étudiants, familles ou professionnels, le site est pensé pour convertir votre audience réelle." },
      { question: "Le SEO local rennais est-il inclus ?", answer: "Oui, chaque site intègre une structure SEO pensée pour les recherches locales (\"à Rennes\", \"proche de moi\") en plus du référencement national." },
    ],
  },
  {
    slug: "paris",
    name: "Paris",
    region: "Île-de-France",
    department: "Paris",
    population: "2,1 million",
    intro:
      "À Paris, la concurrence en ligne est la plus rude de France : des milliers d'entreprises se disputent chaque requête Google dans tous les secteurs. Se différencier demande un site rapide, bien structuré, et un positionnement clair sur des mots-clés précis plutôt que sur des termes génériques déjà saturés.",
    sectors: ["Commerces et indépendants par arrondissement", "Cabinets de conseil et professions libérales", "Startups et sociétés de services"],
    faq: [
      { question: "Comment se démarquer à Paris face à une concurrence aussi forte ?", answer: "En ciblant des expressions précises (votre quartier, votre spécialité) plutôt que des mots-clés génériques hyper concurrentiels, et en construisant une autorité de contenu durable via le blog et les avis clients." },
      { question: "Vanyo peut-il gérer un projet parisien à distance ?", answer: "Oui, la totalité de nos échanges se fait en visio, téléphone et via votre panel d'administration — la distance n'a aucun impact sur la qualité ni les délais." },
      { question: "Proposez-vous un ciblage par arrondissement ?", answer: "Oui, nous pouvons structurer votre contenu et vos données structurées pour cibler un ou plusieurs arrondissements ou quartiers précis." },
    ],
  },
  {
    slug: "lyon",
    name: "Lyon",
    region: "Auvergne-Rhône-Alpes",
    department: "Rhône",
    population: "520 000",
    intro:
      "Deuxième pôle économique de France, Lyon abrite un tissu d'entreprises particulièrement varié : industrie, gastronomie, tech et commerce de proximité cohabitent dans une métropole où la recherche locale sur Google pèse lourd dans la décision d'achat.",
    sectors: ["Restaurants et bouchons lyonnais", "PME industrielles et de services de la métropole", "Commerces des Presqu'île, Croix-Rousse et Confluence"],
    faq: [
      { question: "Un site pour un restaurant lyonnais, qu'est-ce que ça inclut ?", answer: "Menu digital, réservation en ligne, galerie photo et avis clients mis en avant — les éléments qui pèsent le plus sur la décision d'un visiteur qui cherche où manger à Lyon ce soir." },
      { question: "Le référencement à Lyon est-il différent du national ?", answer: "La structure technique est la même, mais le contenu, les mots-clés et les données structurées sont adaptés pour capter les recherches \"à Lyon\" et par arrondissement." },
      { question: "Quels délais pour un projet lyonnais ?", answer: "12 jours en moyenne pour un site vitrine, un peu plus pour un projet e-commerce ou sur mesure." },
    ],
  },
  {
    slug: "bordeaux",
    name: "Bordeaux",
    region: "Nouvelle-Aquitaine",
    department: "Gironde",
    population: "260 000",
    intro:
      "Entre viticulture, tourisme et une économie tertiaire en forte croissance, Bordeaux voit ses entreprises se disputer une audience à la fois locale et touristique. Un site bilingue-friendly et rapide est souvent décisif pour capter une clientèle internationale de passage.",
    sectors: ["Domaines viticoles et cavistes", "Hébergements touristiques et restaurants", "Agences immobilières et professions libérales"],
    faq: [
      { question: "Un site pour un domaine viticole, est-ce une spécialité de Vanyo ?", answer: "Nous créons des sites vitrines et e-commerce adaptés à la vente de vin en ligne (avec les mentions légales requises) et à la présentation de domaines pour les visites et dégustations." },
      { question: "Le site peut-il cibler une clientèle touristique en plus des Bordelais ?", answer: "Oui, nous pouvons prévoir une structure multilingue et un contenu pensé pour les visiteurs de passage autant que pour la clientèle locale." },
      { question: "Proposez-vous un accompagnement pour l'immobilier bordelais ?", answer: "Oui, portails de biens, formulaires de visite et intégration de filtres de recherche font partie de nos réalisations courantes pour ce secteur." },
    ],
  },
  {
    slug: "toulouse",
    name: "Toulouse",
    region: "Occitanie",
    department: "Haute-Garonne",
    population: "500 000",
    intro:
      "Capitale de l'aéronautique et de la tech, Toulouse concentre une densité élevée d'ingénieurs, de sous-traitants industriels et de startups. C'est aussi une ville étudiante où les commerces de proximité doivent rivaliser d'efficacité en ligne pour capter une clientèle jeune et exigeante.",
    sectors: ["Sous-traitants et PME de l'aéronautique", "Startups et sociétés de services numériques", "Commerces et restaurants du centre-ville et de Saint-Cyprien"],
    faq: [
      { question: "Vanyo travaille-t-il avec des entreprises B2B toulousaines ?", answer: "Oui, nous réalisons des sites corporate et des landing pages pensés pour la génération de leads B2B, un besoin fréquent dans l'écosystème industriel et tech toulousain." },
      { question: "Un site pour capter la clientèle étudiante toulousaine, est-ce différent ?", answer: "Le ton, les visuels et les canaux de conversion (réseaux sociaux, mobile-first) sont adaptés à une audience jeune et mobile." },
      { question: "Gérez-vous aussi la maintenance après la mise en ligne ?", answer: "Oui, chaque formule inclut un niveau de maintenance et de support, où que vous soyez en France." },
    ],
  },
  {
    slug: "marseille",
    name: "Marseille",
    region: "Provence-Alpes-Côte d'Azur",
    department: "Bouches-du-Rhône",
    population: "870 000",
    intro:
      "Marseille conjugue un dynamisme entrepreneurial fort et un tourisme massif, avec des enjeux très différents selon les quartiers : commerces du Vieux-Port, industries des quartiers nord, ou start-ups d'Euroméditerranée. Un site doit clarifier immédiatement votre offre et votre zone d'intervention.",
    sectors: ["Commerces et restaurants du Vieux-Port et du Panier", "Logistique et industrie portuaire", "Startups du pôle Euroméditerranée"],
    faq: [
      { question: "Un site pour un commerce marseillais doit-il gérer plusieurs langues ?", answer: "C'est possible et recommandé si votre clientèle inclut des touristes internationaux, notamment pour les commerces proches du Vieux-Port." },
      { question: "Travaillez-vous avec des entreprises logistiques et portuaires ?", answer: "Oui, nous réalisons des sites corporate B2B adaptés à ce secteur, avec formulaires de contact et pages services détaillées." },
      { question: "Quels délais pour un site à Marseille ?", answer: "12 jours en moyenne, comme partout en France, la distance n'ayant aucun impact sur nos délais." },
    ],
  },
  {
    slug: "lille",
    name: "Lille",
    region: "Hauts-de-France",
    department: "Nord",
    population: "235 000",
    intro:
      "Carrefour entre la Belgique, le Royaume-Uni et Paris, Lille bénéficie d'un positionnement logistique et commercial unique. Sa métropole regroupe un tissu dense de commerces indépendants et d'entreprises de services qui doivent se démarquer dans une zone de chalandise transfrontalière.",
    sectors: ["Commerces indépendants du Vieux-Lille et Euralille", "Entreprises de services et sièges régionaux", "E-commerce et logistique liés à la proximité Benelux"],
    faq: [
      { question: "Un site pensé pour une clientèle transfrontalière, est-ce possible ?", answer: "Oui, nous pouvons intégrer une version ou un contenu adapté pour capter une audience belge en plus de la clientèle française." },
      { question: "Proposez-vous de l'e-commerce pour les commerces lillois ?", answer: "Oui, boutique en ligne complète avec paiement sécurisé, gestion des stocks et livraison, adaptée à une activité locale ou nationale." },
      { question: "Le référencement local lillois est-il pris en compte ?", answer: "Oui, structuration du contenu et des données pour les recherches \"à Lille\" et dans la métropole européenne de Lille." },
    ],
  },
  {
    slug: "strasbourg",
    name: "Strasbourg",
    region: "Grand Est",
    department: "Bas-Rhin",
    population: "290 000",
    intro:
      "Siège d'institutions européennes et ville frontalière avec l'Allemagne, Strasbourg a une économie tournée vers l'international autant que vers un tissu artisanal et commerçant très actif, notamment autour de la Petite France et du centre historique.",
    sectors: ["Commerces et restaurants du centre historique", "Institutions et entreprises à rayonnement européen", "Artisans et professions libérales de l'Eurométropole"],
    faq: [
      { question: "Un site bilingue français-allemand est-il possible ?", answer: "Oui, compte tenu de la proximité avec l'Allemagne, nous pouvons structurer un site multilingue pour capter cette audience transfrontalière." },
      { question: "Travaillez-vous avec des structures institutionnelles ?", answer: "Oui, nous réalisons des sites corporate sobres et professionnels adaptés à ce type de structure." },
      { question: "Le référencement à Strasbourg cible-t-il aussi l'Eurométropole ?", answer: "Oui, le contenu peut être structuré pour couvrir l'ensemble de l'Eurométropole, pas seulement l'hypercentre." },
    ],
  },
  {
    slug: "montpellier",
    name: "Montpellier",
    region: "Occitanie",
    department: "Hérault",
    population: "300 000",
    intro:
      "Ville la plus dynamique démographiquement de France depuis plusieurs années, Montpellier voit affluer de nouvelles entreprises, commerces et professionnels de santé chaque année. Cette croissance rapide crée une concurrence en ligne de plus en plus forte sur les recherches locales.",
    sectors: ["Professions de santé et paramédicales", "Commerces et restaurants du centre et d'Antigone", "Startups de la French Tech montpelliéraine"],
    faq: [
      { question: "Un site pour un professionnel de santé à Montpellier, quelles spécificités ?", answer: "Prise de rendez-vous en ligne, présentation claire des prestations et respect des règles de communication propres aux professions réglementées." },
      { question: "La croissance démographique de Montpellier influence-t-elle le SEO ?", answer: "Oui, l'arrivée constante de nouveaux habitants renforce l'intérêt d'un bon référencement local pour capter une clientèle qui découvre la ville." },
      { question: "Proposez-vous un accompagnement pour les startups montpelliéraines ?", answer: "Oui, sites vitrines évolutifs, landing pages de lancement et intégrations sur mesure selon votre stade de croissance." },
    ],
  },
  {
    slug: "nice",
    name: "Nice",
    region: "Provence-Alpes-Côte d'Azur",
    department: "Alpes-Maritimes",
    population: "340 000",
    intro:
      "Cinquième ville de France et pôle touristique majeur de la Côte d'Azur, Nice doit composer avec une clientèle mêlant résidents, touristes français et une forte clientèle internationale, notamment dans l'hôtellerie, la restauration et l'immobilier de standing.",
    sectors: ["Hôtellerie, restauration et tourisme", "Immobilier de standing et Côte d'Azur", "Commerces du Vieux-Nice et de la Promenade"],
    faq: [
      { question: "Un site multilingue est-il recommandé à Nice ?", answer: "Fortement, étant donné la part de clientèle internationale, notamment anglophone, italienne et russophone dans certains secteurs." },
      { question: "Gérez-vous des sites pour l'immobilier de luxe niçois ?", answer: "Oui, portails de biens haut de gamme avec galeries soignées, visites virtuelles et formulaires de contact qualifiés." },
      { question: "Un site pour un hôtel ou une résidence à Nice, que proposez-vous ?", answer: "Système de réservation, galerie photo optimisée, avis clients mis en avant et référencement sur les recherches touristiques locales." },
    ],
  },
  {
    slug: "angers",
    name: "Angers",
    region: "Pays de la Loire",
    department: "Maine-et-Loire",
    population: "155 000",
    intro:
      "Angers combine un centre-ville commerçant dynamique, un secteur agricole et horticole important (le végétal est une spécialité historique de la région) et une économie de services en croissance, ce qui en fait un marché local très diversifié pour la création de sites.",
    sectors: ["Commerces du centre-ville et de la Doutre", "Filière végétale et horticole angevine", "Artisans et PME de service du Maine-et-Loire"],
    faq: [
      { question: "Vanyo connaît-il la filière végétale angevine ?", answer: "Nous avons l'habitude de créer des sites pour des acteurs de secteurs spécialisés, avec un contenu qui valorise votre expertise technique auprès de vos clients professionnels ou particuliers." },
      { question: "Un commerce du centre-ville d'Angers, quel type de site recommandez-vous ?", answer: "Un site vitrine avec localisation claire, horaires à jour et mise en avant des avis clients, pour capter la recherche \"proche de moi\"." },
      { question: "Quels délais pour un projet à Angers ?", answer: "12 jours en moyenne, comme pour l'ensemble de nos projets en France." },
    ],
  },
  {
    slug: "reims",
    name: "Reims",
    region: "Grand Est",
    department: "Marne",
    population: "185 000",
    intro:
      "Capitale du Champagne, Reims attire une clientèle touristique et professionnelle exigeante autour de la filière viticole, tout en conservant un centre-ville commerçant actif desservant tout le département de la Marne.",
    sectors: ["Maisons de Champagne et cavistes", "Tourisme et hébergement", "Commerces et professions libérales du centre-ville"],
    faq: [
      { question: "Un site pour une maison de Champagne, qu'incluez-vous ?", answer: "Présentation de la maison et du savoir-faire, boutique en ligne conforme à la réglementation sur l'alcool, et prise de rendez-vous pour les visites et dégustations." },
      { question: "Le tourisme rémois influence-t-il votre approche SEO ?", answer: "Oui, nous intégrons des mots-clés liés au tourisme viticole en complément du référencement local classique." },
      { question: "Intervenez-vous aussi hors de Reims dans la Marne ?", answer: "Oui, dans tout le département et plus largement dans toute la France, à distance." },
    ],
  },
  {
    slug: "dijon",
    name: "Dijon",
    region: "Bourgogne-Franche-Comté",
    department: "Côte-d'Or",
    population: "160 000",
    intro:
      "Dijon s'appuie sur une réputation gastronomique et viticole forte (moutarde, vins de Bourgogne) tout en développant un secteur tertiaire et administratif important en tant que capitale régionale, ce qui diversifie fortement les profils de clients à accompagner.",
    sectors: ["Gastronomie et produits du terroir bourguignon", "Domaines viticoles de la Côte de Nuits et Côte de Beaune", "Entreprises tertiaires et administratives régionales"],
    faq: [
      { question: "Un site pour un domaine viticole bourguignon, est-ce une spécialité ?", answer: "Oui, nous créons des sites vitrines et e-commerce valorisant le terroir, l'histoire du domaine et permettant la vente en ligne dans le respect de la réglementation." },
      { question: "Travaillez-vous avec des artisans du terroir dijonnais ?", answer: "Oui, mise en valeur du savoir-faire, de l'origine des produits et intégration d'une boutique en ligne si besoin." },
      { question: "Un site pour une entreprise tertiaire dijonnaise, quelle approche ?", answer: "Un site corporate sobre et professionnel, pensé pour rassurer une clientèle B2B et générer des demandes de contact qualifiées." },
    ],
  },
  {
    slug: "grenoble",
    name: "Grenoble",
    region: "Auvergne-Rhône-Alpes",
    department: "Isère",
    population: "160 000",
    intro:
      "Capitale française de l'innovation et de la recherche, Grenoble concentre laboratoires, startups deeptech et sous-traitants industriels, aux côtés d'une économie de montagne (tourisme, sports d'hiver) qui anime les vallées alentour.",
    sectors: ["Startups deeptech et laboratoires de recherche", "Sous-traitance industrielle et micro-électronique", "Tourisme de montagne et stations environnantes"],
    faq: [
      { question: "Un site pour une startup deeptech grenobloise, quelles spécificités ?", answer: "Un contenu technique mais accessible, pensé pour rassurer investisseurs et clients B2B, avec une structure évolutive pour accompagner votre croissance." },
      { question: "Gérez-vous des sites pour des stations de montagne proches de Grenoble ?", answer: "Oui, sites vitrines touristiques avec mise en avant des activités, réservation et référencement saisonnier." },
      { question: "Le secteur industriel grenoblois est-il une clientèle fréquente ?", answer: "Oui, nous réalisons régulièrement des sites B2B pour la sous-traitance industrielle et la microélectronique." },
    ],
  },
  {
    slug: "saint-nazaire",
    name: "Saint-Nazaire",
    region: "Pays de la Loire",
    department: "Loire-Atlantique",
    population: "70 000",
    intro:
      "Ville industrielle et portuaire tournée vers la construction navale et l'aéronautique, Saint-Nazaire abrite aussi une économie touristique balnéaire l'été, avec des besoins numériques très différents selon la saison et le secteur d'activité.",
    sectors: ["Sous-traitance navale et aéronautique", "Commerces et tourisme balnéaire", "Artisans et PME de l'agglomération nazairienne"],
    faq: [
      { question: "Un site pour un sous-traitant industriel nazairien, quelle approche ?", answer: "Un site corporate clair, orienté génération de contacts B2B, mettant en avant vos certifications et références clients." },
      { question: "Le tourisme balnéaire influence-t-il le référencement ?", answer: "Oui, un contenu saisonnier optimisé permet de capter les recherches touristiques en période estivale sans négliger l'activité hors saison." },
      { question: "Intervenez-vous aussi sur la presqu'île guérandaise ?", answer: "Oui, dans toute la Loire-Atlantique et au-delà, entièrement à distance." },
    ],
  },
  {
    slug: "vannes",
    name: "Vannes",
    region: "Bretagne",
    department: "Morbihan",
    population: "55 000",
    intro:
      "Vannes bénéficie d'une forte attractivité résidentielle et touristique liée au Golfe du Morbihan, ce qui dynamise un tissu de commerces, d'hébergements et de professions libérales très sensible aux recherches locales sur mobile.",
    sectors: ["Commerces et restaurants du centre historique", "Hébergements touristiques du Golfe du Morbihan", "Professions libérales et artisans du Morbihan"],
    faq: [
      { question: "Un site pour un hébergement touristique à Vannes, que proposez-vous ?", answer: "Système de réservation ou de demande de disponibilité, galerie photo soignée et référencement sur les recherches touristiques du Golfe du Morbihan." },
      { question: "Le SEO mobile est-il important pour Vannes ?", answer: "Particulièrement, une large part des recherches touristiques et locales se faisant depuis un smartphone : tous nos sites sont conçus mobile-first." },
      { question: "Travaillez-vous avec des artisans du Morbihan ?", answer: "Oui, sites vitrines valorisant votre savoir-faire avec une mise en avant claire de votre zone d'intervention." },
    ],
  },
  {
    slug: "le-mans",
    name: "Le Mans",
    region: "Pays de la Loire",
    department: "Sarthe",
    population: "145 000",
    intro:
      "Connue mondialement pour les 24 Heures, la ville du Mans porte une économie industrielle (automobile, assurance) doublée d'un centre-ville historique attractif, avec des besoins numériques allant du site corporate B2B au commerce de proximité.",
    sectors: ["Industrie automobile et équipementiers", "Assurance et services financiers", "Commerces de la Cité Plantagenêt et du centre-ville"],
    faq: [
      { question: "Un site pour un équipementier automobile manceau, quelle approche ?", answer: "Un site corporate orienté B2B, mettant en avant certifications, références et capacités industrielles." },
      { question: "Le secteur de l'assurance est-il une clientèle fréquente au Mans ?", answer: "Oui, nous réalisons des sites professionnels sobres et rassurants adaptés à ce secteur réglementé." },
      { question: "Un commerce du centre-ville du Mans, quel type de site recommandez-vous ?", answer: "Un site vitrine simple, rapide, avec localisation et horaires clairs pour capter la recherche locale." },
    ],
  },
  {
    slug: "la-rochelle",
    name: "La Rochelle",
    region: "Nouvelle-Aquitaine",
    department: "Charente-Maritime",
    population: "78 000",
    intro:
      "Port historique et destination touristique majeure de la côte atlantique, La Rochelle vit une saisonnalité marquée qui impose aux commerces et hébergements locaux une présence en ligne capable de capter un afflux massif de visiteurs sur une période courte.",
    sectors: ["Tourisme, hébergement et restauration", "Nautisme et activités portuaires", "Commerces du Vieux-Port et du centre historique"],
    faq: [
      { question: "Un site pour un commerce saisonnier rochelais, quelle stratégie ?", answer: "Un contenu optimisé pour anticiper les pics de recherche estivaux, avec mise à jour facile des horaires et informations via votre panel d'administration." },
      { question: "Gérez-vous des sites pour le secteur nautique ?", answer: "Oui, sites vitrines et e-commerce pour la location, la vente d'équipement ou les activités nautiques, avec système de réservation si besoin." },
      { question: "Le référencement touristique est-il différent du référencement local classique ?", answer: "Il cible des expressions différentes (activités, points d'intérêt) en complément du référencement de proximité, les deux étant complémentaires pour La Rochelle." },
    ],
  },
];

export function getCity(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug);
}
