import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  /** Optional element aligned right on desktop (e.g. a "View all" link). */
  action?: ReactNode;
  align?: "left" | "center";
  /** Heading level — h2 for page sections, h1 only for page headers. */
  as?: "h1" | "h2";
  className?: string;
};

/** Consistent eyebrow + title + description block used to open every section. */
export function SectionHeading({ eyebrow, title, description, action, align = "left", as: Tag = "h2", className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        align === "center" && "items-center text-center md:flex-col md:items-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-gold">{eyebrow}</p>
        <Tag
          className={cn(
            "mt-3 font-semibold tracking-tight text-balance",
            Tag === "h1" ? "text-4xl md:text-6xl" : "text-3xl md:text-5xl",
          )}
        >
          {title}
        </Tag>
        {description && <p className="mt-4 text-lg leading-relaxed text-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
