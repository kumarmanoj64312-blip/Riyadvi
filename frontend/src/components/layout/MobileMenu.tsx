"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, m, type Variants } from "motion/react";
import { useLenis } from "@/animation/LenisProvider";
import { Button } from "@/components/ui/Button";
import { mainNav, primaryCta, siteConfig, whatsappLink } from "@/lib/site";
import { cn } from "@/lib/cn";

type Props = {
  open: boolean;
  onClose: () => void;
  isActive: (href: string) => boolean;
};

// Motion variants: the panel fades/blurs in, then links rise in sequence.
const panel: Variants = {
  hidden: { opacity: 0, backdropFilter: "blur(0px)" },
  visible: {
    opacity: 1,
    backdropFilter: "blur(20px)",
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.05, delayChildren: 0.1 },
  },
  exit: { opacity: 0, transition: { duration: 0.25 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

/**
 * Full-screen mobile navigation overlay.
 * Accessibility: Escape closes, focus moves to the close button on open,
 * and page scroll is locked (both Lenis and native) while open.
 */
export function MobileMenu({ open, onClose, isActive }: Props) {
  const lenisRef = useLenis();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const lenis = lenisRef.current;
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);

    return () => {
      lenis?.start();
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, lenisRef]);

  return (
    <AnimatePresence>
      {open && (
        <m.div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          variants={panel}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex flex-col bg-ink/90 lg:hidden"
        >
          <div className="container-site flex h-16 items-center justify-end">
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line-strong text-fg"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <nav aria-label="Mobile" className="container-site flex flex-1 flex-col justify-center gap-2">
            {mainNav.map((link) => (
              <m.div key={link.href} variants={item}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={cn(
                    "block py-2 text-4xl font-semibold tracking-tight transition-colors",
                    isActive(link.href) ? "text-gold" : "text-fg hover:text-gold",
                  )}
                >
                  {link.label}
                </Link>
              </m.div>
            ))}
          </nav>

          <m.div variants={item} className="container-site flex flex-col gap-3 pb-10">
            <Button href={primaryCta.href} size="lg" onClick={onClose}>
              {primaryCta.label}
            </Button>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center text-sm text-muted hover:text-gold"
            >
              Chat on WhatsApp · {siteConfig.contact.phone}
            </a>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
