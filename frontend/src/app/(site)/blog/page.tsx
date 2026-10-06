import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BlogExplorer } from "@/components/blog/BlogExplorer";
import { PostCover } from "@/components/blog/PostCover";
import type { PostCardData } from "@/components/blog/PostCard";
import { getPosts, readingMinutes } from "@/lib/content";
import { formatDate } from "@/lib/format";
import type { Post } from "@/types/content";

export const metadata: Metadata = {
  title: "Blog",
  description: "Insights on digital strategy, web and app development, 3D, UI/UX and growth marketing from the Riyadvi team.",
};

const toCard = (p: Post): PostCardData => ({
  slug: p.slug,
  title: p.title,
  excerpt: p.excerpt,
  category: p.category,
  tags: p.tags,
  accent: p.accent,
  date: formatDate(p.publishedAt),
  readingMinutes: readingMinutes(p),
});

/** /blog — featured article + searchable, filterable article grid. */
export default async function BlogPage() {
  const posts = await getPosts();
  const featured = posts.find((p) => p.featured) ?? posts[0];

  return (
    <>
      <section className="pb-12 pt-36 md:pt-44">
        <div className="container-site">
          <SectionHeading
            as="h1"
            eyebrow="Insights"
            title="Ideas for growing businesses"
            description="Practical thinking on strategy, product, engineering and marketing — from the team that builds it."
          />

          {featured && (
            <Link
              href={`/blog/${featured.slug}`}
              className="group mt-12 grid overflow-hidden rounded-3xl border border-line bg-surface-2 transition-colors duration-500 hover:border-gold/40 lg:grid-cols-[1.2fr_1fr]"
            >
              <PostCover accent={featured.accent} category={featured.category} large className="aspect-[16/9] lg:aspect-auto lg:min-h-[340px]" />
              <div className="flex flex-col justify-center p-8 md:p-12">
                <p className="text-sm font-medium uppercase tracking-[0.25em] text-gold">Featured article</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-balance group-hover:text-gold md:text-4xl">{featured.title}</h2>
                <p className="mt-4 text-muted">{featured.excerpt}</p>
                <p className="mt-6 text-sm text-subtle">
                  {formatDate(featured.publishedAt)} · {readingMinutes(featured)} min read · {featured.author.name}
                </p>
              </div>
            </Link>
          )}
        </div>
      </section>

      <section aria-label="All articles" className="pb-24">
        <div className="container-site">
          <BlogExplorer posts={posts.map(toCard)} />
        </div>
      </section>
    </>
  );
}
