import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { SplitText } from "./SplitText";

type Props = {
  /** Small label above the title. Use sparingly: at most one per ~3 sections, or the page reads as a template. */
  eyebrow?: string;
  title: ReactNode;
  /** id on the heading element, for a section's `aria-labelledby`. */
  titleId?: string;
  description?: ReactNode;
  /** Optional element aligned right on desktop (e.g. a "View all" link). */
  action?: ReactNode;
  align?: "left" | "center";
  /** Heading level — h2 for page sections, h1 only for page headers. */
  as?: "h1" | "h2";
  className?: string;
};

/** Consistent eyebrow + title + description block used to open every section. */
export function SectionHeading({ eyebrow, title, titleId, description, action, align = "left", as: Tag = "h2", className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        align === "center" && "items-center text-center md:flex-col md:items-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-gold">{eyebrow}</p>}
        <Tag
          id={titleId}
          className={cn(
            "font-semibold text-balance",
            Tag === "h1" ? "text-display-xl" : "text-display-lg",
          )}
        >
          {/* Plain-string titles get the word reveal; JSX titles (with ids/links) render as-is. */}
          {typeof title === "string" ? <SplitText text={title} trigger={Tag === "h1" ? "load" : "view"} /> : title}
        </Tag>
        {description && <p className="mt-4 text-lg leading-relaxed text-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
