import { createClient } from "@/lib/supabase/server";
import { DevisManager } from "./DevisManager";
import type { Devis } from "@/lib/devis";
import { requirePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

const DEMO: Devis[] = [
  { id: "1", created_at: new Date().toISOString(), status: "Nouveau", prenom: "Camille", nom: "Laurent", entreprise: "Maison Laurent", email: "camille@maison-laurent.fr", telephone: "06 12 34 56 78", ville: "Lyon", code_postal: "69002", pays: "France", type_site: "Restaurant", nombre_pages: "6", budget: "2000 - 5000€", nom_domaine: "Oui", hebergement: "Je veux que vous vous en occupiez", logo: "Oui", charte_graphique: "Non", fonctionnalites: ["Réservation", "Galerie", "SEO", "Contact"], description: "Nous souhaitons un site élégant pour notre restaurant avec réservation en ligne et une belle galerie photo de nos plats.", rgpd: true, site_existant: "Non" },
  { id: "2", created_at: new Date(Date.now() - 3600e3).toISOString(), status: "Contacté", prenom: "Thomas", nom: "Nguyen", entreprise: "NovaImmo", email: "t.nguyen@novaimmo.fr", telephone: "07 98 76 54 32", ville: "Paris", pays: "France", type_site: "Immobilier", nombre_pages: "12", budget: "5000€ +", nom_domaine: "Oui", hebergement: "Oui", logo: "Oui", charte_graphique: "Oui", fonctionnalites: ["Espace Client", "Dashboard", "SEO", "Multilingue"], description: "Portail immobilier avec recherche avancée et espace client.", rgpd: true, site_existant: "Oui", lien_actuel: "https://novaimmo.fr" },
  { id: "3", created_at: new Date(Date.now() - 7200e3).toISOString(), status: "En cours", prenom: "Sarah", nom: "Benali", entreprise: "Boutique Lumé", email: "sarah@boutique-lume.com", type_site: "E-commerce", budget: "2000 - 5000€", fonctionnalites: ["Paiement", "Newsletter", "Blog"], description: "Boutique en ligne de bougies artisanales.", rgpd: true, nom_domaine: "Non", hebergement: "Je veux que vous vous en occupiez", logo: "À créer", charte_graphique: "Non" } as Devis,
];

export default async function AdminDevisPage() {
  await requirePermission("devis");
  const supabase = await createClient();

  if (!supabase) {
    return <DevisManager initial={DEMO} live={false} />;
  }

  const { data } = await supabase
    .from("devis")
    .select("*")
    .order("created_at", { ascending: false });

  return <DevisManager initial={(data as Devis[]) ?? []} live />;
}
