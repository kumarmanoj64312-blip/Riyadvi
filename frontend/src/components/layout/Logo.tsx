import Link from "next/link";
import { siteConfig } from "@/lib/site";

/**
 * Text wordmark + geometric mark (inline SVG: zero requests, crisp at any
 * size). The mark is a node-and-link triangle — a small echo of the 3D
 * "connected ecosystem" hero.
 */
export function Logo() {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} — home`}
      className="flex items-center gap-2.5 text-fg"
    >
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
        <defs>
          <linearGradient id="logo-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-gold-light)" />
            <stop offset="100%" stopColor="var(--color-gold-dark)" />
          </linearGradient>
        </defs>
        <path
          d="M14 3 L25 22 L3 22 Z"
          fill="none"
          stroke="url(#logo-gold)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="14" cy="3.5" r="2.5" fill="var(--color-gold)" />
        <circle cx="24.5" cy="22" r="2.5" fill="var(--color-gold)" />
        <circle cx="3.5" cy="22" r="2.5" fill="var(--color-gold)" />
        <circle cx="14" cy="15.5" r="2" fill="var(--color-gold-light)" />
      </svg>
      <span className="text-lg font-semibold tracking-tight">
        Riyadvi<span className="text-gold">.</span>
      </span>
    </Link>
  );
}
