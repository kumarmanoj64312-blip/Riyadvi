import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PostCover } from "@/components/blog/PostCover";
import { PostCard, type PostCardData } from "@/components/blog/PostCard";
import type { Post, PostBlock } from "@/types/content";

/**
 * Renders structured blocks to semantic HTML. Every value is rendered as text
 * by React, so CMS content can never inject markup (no dangerouslySetInnerHTML).
 * Adding a block type = one `case` here + the type in types/content.ts.
 */
function Block({ block }: { block: PostBlock }) {
  switch (block.type) {
    case "heading":
      return <h2 className="mt-12 text-2xl font-semibold tracking-tight md:text-3xl">{block.text}</h2>;
    case "list": {
      const List = block.ordered ? "ol" : "ul";
      return (
        <List
          className={`mt-5 space-y-2 pl-6 text-lg text-muted ${block.ordered ? "list-decimal" : "list-disc"} marker:text-gold`}
        >
          {block.items.map((item) => (
            <li key={item} className="pl-1">
              {item}
            </li>
          ))}
        </List>
      );
    }
    case "quote":
      return (
        <blockquote className="mt-8 border-l-2 border-gold pl-6">
          <p className="text-xl font-medium leading-snug text-fg md:text-2xl">“{block.text}”</p>
          {block.cite && <footer className="mt-2 text-sm text-subtle">— {block.cite}</footer>}
        </blockquote>
      );
    case "callout":
      return (
        <aside className="mt-8 rounded-2xl border border-gold/30 bg-gold/5 p-6">
          <p className="font-semibold text-gold">{block.title}</p>
          <p className="mt-2 text-muted">{block.text}</p>
        </aside>
      );
    default:
      return <p className="mt-5 text-lg leading-relaxed text-muted">{block.text}</p>;
  }
}

type Props = {
  post: Post;
  date: string;
  minutes: number;
  related: PostCardData[];
};

/** ONE template for every /blog/[slug] article. */
export function BlogPostTemplate({ post, date, minutes, related }: Props) {
  return (
    <article>
      {/* One page container + ONE centred reading column shared by header,
          cover, body, tags and CTA → identical left/right edges. */}
      <div className="container-site pb-16 pt-32 md:pt-40">
        <div className="mx-auto w-full max-w-5xl">
          <header className="pb-10">
            <nav aria-label="Breadcrumb" className="text-sm text-subtle">
              <Link href="/blog" className="hover:text-gold">
                Blog
              </Link>
              <span aria-hidden="true"> / </span>
              <span className="text-muted">{post.category}</span>
            </nav>
            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-balance md:text-5xl">
              {post.title}
            </h1>
            <p className="mt-5 text-xl text-muted">{post.excerpt}</p>
            <p className="mt-6 text-sm text-subtle">
              {post.author.name} · {post.author.role} · <time dateTime={post.publishedAt}>{date}</time> · {minutes} min
              read
            </p>
          </header>

          <PostCover
            accent={post.accent}
            category={post.category}
            large
            className="aspect-[16/9] rounded-3xl border border-line"
          />

          <div className="pt-6">
            {post.body.map((block, i) => (
              <Block key={i} block={block} />
            ))}

            <ul aria-label="Tags" className="mt-12 flex flex-wrap gap-2 border-t border-line pt-8">
              {post.tags.map((t) => (
                <li key={t} className="rounded-full border border-line-strong px-3 py-1 text-sm text-muted">
                  #{t}
                </li>
              ))}
            </ul>

            <div className="mt-12 flex flex-col items-start gap-5 rounded-3xl border border-gold/30 bg-surface-2 p-8 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-lg font-semibold">Want this applied to your business?</p>
                <p className="mt-1 text-sm text-muted">Start with our free 3-minute Business Health Checkup.</p>
              </div>
              <Button href="/business-health-checkup">Take the checkup</Button>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="border-t border-line pb-8 pt-20">
          <div className="container-site">
            <h2 id="related-heading" className="text-2xl font-semibold tracking-tight">
              Related articles
            </h2>
            <ul className="mt-8 grid gap-5 md:grid-cols-3">
              {related.map((p) => (
                <li key={p.slug}>
                  <PostCard post={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </article>
  );
}
