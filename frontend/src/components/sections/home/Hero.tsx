import { Button } from "@/components/ui/Button";
import { SceneView } from "@/three/canvas/SceneView";
import { HeroFallback } from "@/three/fallbacks/HeroFallback";
import { primaryCta } from "@/lib/site";

/**
 * Home hero. Server Component: the headline, copy and CTAs are plain HTML in
 * the first response (fast LCP, SEO, usable even if 3D never loads).
 *
 * Layout: ONE shared container (same as the navbar) → 2-column grid.
 *   left  – eyebrow, h1, paragraph, CTAs
 *   right – the 3D ecosystem (or its SVG fallback), constrained to a square
 *           box inside its column, so it can never overflow the container.
 * Below `lg` the columns stack: text first, a smaller graphic underneath.
 */
export function Hero() {
  return (
    // pt matches the fixed navbar height (64px / 80px); overflow-hidden guarantees no sideways scroll.
    <section className="relative overflow-hidden pt-16 md:pt-20">
      <div className="container-site grid min-h-[calc(100dvh-80px)] grid-cols-1 items-center gap-10 py-12 lg:grid-cols-2 lg:py-0">
        {/* Left column — copy and CTAs */}
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-gold">
            Technology &amp; Digital Solutions Partner
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-balance md:text-5xl lg:text-6xl">
            Custom Software &amp; Digital Solutions to{" "}
            <span className="text-gold-gradient">Grow Your Business</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted md:text-lg">
            Web &amp; App Development, UI/UX Design, and Business Strategy – all tailored to your
            needs.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={primaryCta.href} size="lg">
              {primaryCta.label}
            </Button>
            <Button href="/services" variant="secondary" size="lg">
              Explore Our Solutions
            </Button>
          </div>
        </div>

        {/* Right column — 3D graphic, sized by this box (not the window) */}
        <div className="relative mx-auto aspect-square w-full max-w-[360px] lg:ml-auto lg:mr-0 lg:max-w-[520px]">
          <SceneView scene="hero" fallback={<HeroFallback />} className="absolute inset-0" />
        </div>
      </div>

      {/* Scroll cue */}
      <div aria-hidden="true" className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 lg:block">
        <div className="h-12 w-px overflow-hidden bg-line">
          <div className="h-1/2 w-full animate-scroll-cue bg-gold" />
        </div>
      </div>
    </section>
  );
}
