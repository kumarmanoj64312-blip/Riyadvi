import { cn } from "@/lib/cn";
import { techIconPath, techMonogram } from "@/lib/techIcons";

/**
 * A technology's logo (Simple Icons, see lib/techIcons.ts), or a text
 * monogram when there is no official mark.
 *
 * Monochrome (currentColor) on purpose: one accent colour across the page,
 * so 17 brand colours don't turn the section into a sticker wall.
 * Decorative: the technology's name is always printed next to it.
 */
export function TechLogo({ slug, className }: { slug: string; className?: string }) {
  const path = techIconPath(slug);
  if (!path) {
    return (
      <span
        aria-hidden="true"
        className={cn("inline-flex items-center justify-center font-display text-[0.55em] font-bold leading-none", className)}
      >
        {techMonogram(slug)}
      </span>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("shrink-0 fill-current", className)}>
      <path d={path} />
    </svg>
  );
}
