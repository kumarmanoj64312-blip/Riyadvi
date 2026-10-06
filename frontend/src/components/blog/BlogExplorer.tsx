"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { PostCard, type PostCardData } from "@/components/blog/PostCard";
import { cn } from "@/lib/cn";

const ALL = "All";

/**
 * Blog search + category + tag filters, client-side over the server-rendered
 * list (fast and fine at this scale). With a CMS this would become a search
 * query parameter passed to the data layer — the UI wouldn't change.
 */
export function BlogExplorer({ posts }: { posts: PostCardData[] }) {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL);
  const [tag, setTag] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query); // typing stays responsive

  const categories = useMemo(() => [ALL, ...new Set(posts.map((p) => p.category))], [posts]);
  const tags = useMemo(() => [...new Set(posts.flatMap((p) => p.tags))].sort(), [posts]);

  const results = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return posts.filter(
      (p) =>
        (category === ALL || p.category === category) &&
        (!tag || p.tags.includes(tag)) &&
        (!q || [p.title, p.excerpt, ...p.tags].some((s) => s.toLowerCase().includes(q))),
    );
  }, [posts, category, tag, deferredQuery]);

  return (
    <div>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Categories" className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              className={cn(
                "h-9 rounded-full border px-4 text-sm transition-colors",
                category === c ? "border-gold bg-gold text-ink" : "border-line-strong text-muted hover:text-fg",
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <label className="relative block lg:w-80">
          <span className="sr-only">Search articles</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            className="h-11 w-full rounded-full border border-line-strong bg-surface-2 px-5 text-sm text-fg placeholder:text-subtle focus:border-gold focus:outline-none"
          />
        </label>
      </div>

      <div role="group" aria-label="Tags" className="mt-4 flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={tag === t}
            onClick={() => setTag(tag === t ? null : t)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              tag === t ? "border-gold text-gold" : "border-line text-subtle hover:text-fg",
            )}
          >
            #{t}
          </button>
        ))}
      </div>

      <p aria-live="polite" className="mt-6 text-sm text-subtle">
        {results.length} {results.length === 1 ? "article" : "articles"}
      </p>

      <m.ul layout={!reduce} className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {results.map((p) => (
            <m.li
              key={p.slug}
              layout={!reduce}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35 }}
            >
              <PostCard post={p} />
            </m.li>
          ))}
        </AnimatePresence>
      </m.ul>

      {results.length === 0 && (
        <p className="mt-6 rounded-2xl border border-line p-10 text-center text-muted">
          No articles match.{" "}
          <button type="button" className="text-gold underline" onClick={() => (setQuery(""), setCategory(ALL), setTag(null))}>
            Clear filters
          </button>
        </p>
      )}
    </div>
  );
}
