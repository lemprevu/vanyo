// Réexporte l'image de partage par défaut : évite de dupliquer le rendu
// (voir opengraph-image.tsx) tout en générant la balise twitter:image.
export { default, alt, size, contentType } from "./opengraph-image";
