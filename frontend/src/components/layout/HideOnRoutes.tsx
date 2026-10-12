"use client";

import { usePathname } from "next/navigation";

/**
 * Renders its (server-rendered) children everywhere except on the given
 * routes. Used for the footer CTA band: the home page already ends with its
 * own contact section, and two "contact us" blocks in a row is repetition.
 */
export function HideOnRoutes({ routes, children }: { routes: string[]; children: React.ReactNode }) {
  const pathname = usePathname();
  return routes.includes(pathname) ? null : children;
}
