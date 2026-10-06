import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostTemplate } from "@/components/templates/BlogPostTemplate";
import { getPost, getPosts, getRelatedPosts, readingMinutes } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { siteConfig } from "@/lib/site";

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return { title: "Article not found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { type: "article", title: post.title, description: post.excerpt, publishedTime: post.publishedAt, tags: post.tags },
  };
}

/** /blog/[slug] — data → BlogPostTemplate, plus Article structured data for search engines. */
export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  const related = await getRelatedPosts(post);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: post.author.name },
    publisher: { "@type": "Organization", name: siteConfig.name },
    keywords: post.tags.join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // JSON.stringify output with "<" escaped is safe to inline in a script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <BlogPostTemplate
        post={post}
        date={formatDate(post.publishedAt)}
        minutes={readingMinutes(post)}
        related={related.map((p) => ({
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          category: p.category,
          tags: p.tags,
          accent: p.accent,
          date: formatDate(p.publishedAt),
          readingMinutes: readingMinutes(p),
        }))}
      />
    </>
  );
}
