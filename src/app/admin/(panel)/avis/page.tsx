import { Star } from "lucide-react";
import { AdminModule } from "@/components/admin/Placeholder";

export default function Page() {
  return (
    <AdminModule
      icon={Star}
      title="Avis clients"
      subtitle="Gérez les témoignages affichés sur le site."
      features={["Ajouter / modifier / supprimer", "Nom & entreprise", "Note (étoiles)", "Mise en avant"]}
    />
  );
}
