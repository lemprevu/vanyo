import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { BlogList } from "./BlogList";
import { getArticles } from "@/lib/data";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Conseils, tendances et bonnes pratiques sur la création de sites internet, le SEO, le design et la performance web par l'agence Vanyo.",
  alternates: { canonical: "/blog" },
};

export const revalidate = 60;

export default async function BlogPage() {
  const articles = await getArticles();
  return (
    <>
      <PageHeader
        eyebrow="Blog"
        title={<>Idées & <span className="text-gradient-violet">conseils web</span></>}
        subtitle="Nos articles pour comprendre le web, améliorer votre présence en ligne et faire les bons choix."
      />
      <BlogList articles={articles} />
    </>
  );
}
