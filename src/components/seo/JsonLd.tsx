/**
 * Injection de données structurées Schema.org (JSON-LD).
 * Un seul composant générique : chaque page passe l'objet à sérialiser.
 * `dangerouslySetInnerHTML` est sûr ici car le contenu vient de JSON.stringify
 * sur des données serveur, jamais d'une saisie utilisateur brute non échappée.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
