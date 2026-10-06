/**
 * Joins class names, skipping falsy values.
 * Tiny on purpose — avoids pulling in clsx/tailwind-merge for one helper.
 *
 *   cn("btn", isActive && "btn--active", undefined) → "btn btn--active"
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
