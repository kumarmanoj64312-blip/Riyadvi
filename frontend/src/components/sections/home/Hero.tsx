import { Button } from "@/components/ui/Button";
import { SceneView } from "@/three/canvas/SceneView";
import { HeroFallback } from "@/three/fallbacks/HeroFallback";
import { primaryCta } from "@/lib/site";

/**
 * Home hero. Server Component: the headline, copy and CTAs are plain HTML in
 * the first response (fast LCP, SEO, usable even if 3D never loads).
 *
 * Layering (bottom → top):
 *   1. <SceneView>   – 3D ecosystem (or its SVG fallback), fills the section
 *   2. gradient      – keeps text readable over the visuals
 *   3. content       – pointer-events: none on the wrapper so the cursor
 *                      reaches the 3D nodes *through* empty text areas;
 *                      buttons re-enable pointer events for themselves.
 */
export function Hero() {
  return (
    <section className="relative flex min-h-dvh flex-col justify-end overflow-hidden pb-16 pt-28 lg:justify-center lg:pb-0">
      <SceneView scene="hero" fallback={<HeroFallback />} className="absolute inset-0" />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,var(--color-ink)_45%,transparent_75%)] lg:bg-[linear-gradient(to_right,var(--color-ink)_20%,transparent_65%)]"
      />

      <div className="container-site pointer-events-none relative">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-gold">
          Technology &amp; Digital Solutions Partner
        </p>
        <h1 className="mt-6 max-w-3xl text-[2.6rem] font-semibold leading-[1.02] tracking-tight text-balance sm:text-6xl lg:text-7xl">
          Custom Software &amp; Digital Solutions to{" "}
          <span className="text-gold-gradient">Grow Your Business</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          Web &amp; App Development, UI/UX Design, and Business Strategy – all tailored to your
          needs.
        </p>
        <div className="pointer-events-auto mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button href={primaryCta.href} size="lg">
            {primaryCta.label}
          </Button>
          <Button href="/services" variant="secondary" size="lg">
            Explore Our Solutions
          </Button>
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
