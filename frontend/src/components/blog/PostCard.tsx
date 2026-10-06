import Link from "next/link";
import { PostCover } from "@/components/blog/PostCover";

/** Serializable card data (dates pre-formatted on the server → no hydration drift). */
export type PostCardData = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  accent: string;
  date: string;
  readingMinutes: number;
};

export function PostCard({ post }: { post: PostCardData }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface-2 transition-colors duration-500 hover:border-gold/40"
    >
      <PostCover accent={post.accent} category={post.category} className="aspect-[16/9] transition-transform duration-700 ease-premium group-hover:scale-[1.02]" />
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs text-subtle">
          {post.date} · {post.readingMinutes} min read
        </p>
        <h3 className="mt-2 text-lg font-semibold leading-snug tracking-tight group-hover:text-gold">{post.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-muted">{post.excerpt}</p>
        <ul className="mt-auto flex flex-wrap gap-1.5 pt-5">
          {post.tags.map((t) => (
            <li key={t} className="rounded-full border border-line px-2.5 py-0.5 text-[11px] text-muted">
              {t}
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
}
