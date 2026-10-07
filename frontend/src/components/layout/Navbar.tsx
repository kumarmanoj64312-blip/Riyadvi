"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Button } from "@/components/ui/Button";
import { mainNav, primaryCta } from "@/lib/site";
import { cn } from "@/lib/cn";

/**
 * Sticky top navigation.
 * - Transparent over the hero, turns into frosted glass once you scroll.
 * - The scroll listener only calls setState when the threshold is *crossed*,
 *   not on every scroll event, so scrolling doesn't re-render the navbar.
 */
export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 24;
      setScrolled((prev) => (prev === next ? prev : next));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ease-premium",
          scrolled ? "glass border-x-0 border-t-0" : "border-b border-transparent",
        )}
      >
        {/* Skip link: first tab stop for keyboard users. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-ink"
        >
          Skip to content
        </a>

        <nav aria-label="Main" className="container-site flex h-16 items-center justify-between md:h-20">
          {/* Navbar logo opens the admin dashboard (logged-out users get the admin login). */}
          <Logo href="/admin" label="admin dashboard" />

          {/* Desktop links */}
          <ul className="hidden items-center gap-1 lg:flex">
            {mainNav.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-sm transition-colors duration-300",
                    isActive(link.href) ? "text-gold" : "text-muted hover:text-fg",
                  )}
                >
                  {link.label}
                  {/* Gold underline that grows in on the active link. */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-x-4 -bottom-0.5 h-px origin-left bg-gold transition-transform duration-500 ease-premium",
                      isActive(link.href) ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            {/* Wrapper controls visibility: putting `hidden` on the Button itself
                would conflict with its own `inline-flex` display class. */}
            <div className="hidden sm:block">
              <Button href={primaryCta.href} size="sm">
                {primaryCta.label}
              </Button>
            </div>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line-strong text-fg lg:hidden"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path d="M2 5h14M2 9h14M2 13h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* Rendered outside <header>: the header's backdrop-filter would otherwise
          become the containing block for this position:fixed overlay. */}
      <MobileMenu open={menuOpen} onClose={closeMenu} isActive={isActive} />
    </>
  );
}
