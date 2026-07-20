import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { ARTICLES } from "@/lib/content";
import { getArticleBySlug } from "@/lib/data";
import { ButtonLink } from "@/components/ui/Button";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article introuvable" };
  return { title: article.title, description: article.excerpt };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const paragraphs = article.content
    ? article.content.split("\n").map((p) => p.trim()).filter(Boolean)
    : null;

  return (
    <article className="container-v max-w-3xl py-10">
      <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-white/55 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Retour au blog
      </Link>

      <span className="mt-8 inline-block rounded-full bg-vanyo-500/12 px-3 py-1 text-xs font-medium text-vanyo-200">
        {article.category}
      </span>
      <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {article.title}
      </h1>
      <div className="mt-4 flex items-center gap-5 text-sm text-white/45">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          {new Date(article.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
        </span>
        <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {article.readingTime}</span>
      </div>

      <div className={`mt-8 aspect-[16/8] overflow-hidden rounded-2xl bg-gradient-to-br ${article.color}`}>
        <div className="h-full w-full bg-grid opacity-30" />
      </div>

      <div className="prose-vanyo mt-10 space-y-5 text-pretty leading-relaxed text-white/70">
        <p className="text-lg text-white/80">{article.excerpt}</p>

        {paragraphs ? (
          paragraphs.map((p, i) => <p key={i}>{p}</p>)
        ) : (
          <>
            <p>
              Chez Vanyo, nous sommes convaincus qu'un bon site n'est pas seulement beau : il doit
              être rapide, trouvable sur Google et pensé pour vos objectifs. Dans cet article, nous
              partageons notre approche et nos conseils concrets.
            </p>
            <h2 className="text-xl font-semibold text-white">Ce qu'il faut retenir</h2>
            <p>
              La réussite d'un projet web repose sur trois piliers : une stratégie claire, une
              exécution soignée et un suivi dans la durée. Chaque décision de design ou de technique
              doit servir votre visiteur — et donc votre activité.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Un design épuré qui met en avant l'essentiel.</li>
              <li>Des performances au top pour ne perdre aucun visiteur.</li>
              <li>Un référencement solide dès la conception.</li>
              <li>Un contenu qui parle à vos clients.</li>
            </ul>
            <p>
              Envie d'aller plus loin sur votre propre projet ? Parlons-en. Le premier échange est
              gratuit et sans engagement.
            </p>
          </>
        )}
      </div>

      <div className="mt-12 rounded-2xl border border-white/8 bg-white/[0.02] p-6 text-center">
        <h3 className="text-lg font-semibold text-white">Un projet en tête ?</h3>
        <p className="mt-1 text-sm text-white/55">Recevez un devis gratuit sous quelques heures.</p>
        <div className="mt-5">
          <ButtonLink href="/devis">Demander un devis</ButtonLink>
        </div>
      </div>
    </article>
  );
}
