import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "group relative inline-flex items-center justify-center gap-2 rounded-full font-medium " +
  "transition-[transform,background-color,border-color,box-shadow,color] duration-300 ease-premium " +
  "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  // Solid gold with a soft glow on hover — the main conversion action.
  primary:
    "bg-gold text-ink hover:bg-gold-light hover:shadow-[0_0_32px_-4px_var(--color-gold)]",
  // Outlined glass — secondary paths ("Explore", "Learn more").
  secondary:
    "border border-line-strong bg-glass text-fg hover:border-gold hover:text-gold",
  ghost: "text-muted hover:text-gold",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-base",
};

type StyleProps = { variant?: Variant; size?: Size; className?: string };

/** Classes only — for cases where another element must look like a button. */
export function buttonClasses({ variant = "primary", size = "md", className }: StyleProps = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonAsLink = StyleProps & ComponentProps<typeof Link> & { href: string };
type ButtonAsButton = StyleProps & ComponentProps<"button"> & { href?: undefined };

/**
 * One button API for both navigation and actions:
 *   <Button href="/contact">…</Button>  → renders a Next <Link>
 *   <Button type="submit">…</Button>    → renders a <button>
 */
export function Button(props: ButtonAsLink | ButtonAsButton) {
  const { variant, size, className, ...rest } = props;
  const classes = buttonClasses({ variant, size, className });

  if (rest.href !== undefined) {
    return <Link {...(rest as ComponentProps<typeof Link>)} className={classes} />;
  }
  return <button {...(rest as ComponentProps<"button">)} className={classes} />;
}
