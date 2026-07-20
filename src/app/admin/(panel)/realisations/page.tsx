import { Image as ImageIcon } from "lucide-react";
import { AdminModule } from "@/components/admin/Placeholder";

export default function Page() {
  return (
    <AdminModule
      icon={ImageIcon}
      title="Réalisations"
      subtitle="Gérez votre portfolio affiché sur le site."
      features={["Ajouter / modifier / supprimer", "Images & catégories", "Technologies", "Ordre d'affichage"]}
    />
  );
}
