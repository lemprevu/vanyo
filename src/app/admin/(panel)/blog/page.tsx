import { Newspaper } from "lucide-react";
import { AdminModule } from "@/components/admin/Placeholder";

export default function Page() {
  return (
    <AdminModule
      icon={Newspaper}
      title="Blog"
      subtitle="Rédigez et publiez vos articles."
      features={["Créer / modifier / supprimer", "Catégories & tags", "SEO (titre, description)", "Image à la une"]}
    />
  );
}
