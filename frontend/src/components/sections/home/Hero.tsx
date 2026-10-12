import { Button } from "@/components/ui/Button";
import { SplitText } from "@/components/ui/SplitText";
import { SceneView } from "@/three/canvas/SceneView";
import { HeroFallback } from "@/three/fallbacks/HeroFallback";
import { primaryCta } from "@/lib/site";
import { getFeaturedProjects } from "@/lib/content";

/**
 * Home hero. Server Component: the headline, copy and CTAs are plain HTML in
 * the first response (fast LCP, SEO, usable even if 3D never loads).
 *
 * Layout: a cinematic full-bleed stage.
 *   - The 3D scene (FlowTubes: satin gold tubes winding through the dark)
 *     fills the whole section behind everything.
 *   - The copy is centred, over a soft dark vignette that keeps it readable
 *     whatever moves behind it; the hero fades into the page at the bottom.
 *   - `params` (featured projects' screens) feed the alternative
 *     FloatingDevices hero, so swapping heroes needs no data changes.
 */
export async function Hero() {
  // The three devices show real project screens (laptop, tablet, phone), from the featured case studies.
  const featured = await getFeaturedProjects(3);
  const params = {
    projects: featured.map((p) => ({
      slug: p.slug,
      client: p.client,
      accent: p.accent,
      screen: p.screens[0]?.label ?? "Home",
      screens: p.screens.map((s) => s.label),
    })),
  };
  return (
    // isolate: own stacking context, so the vignette and copy layer predictably above the 3D.
    <section className="relative isolate flex min-h-dvh flex-col overflow-hidden pt-16 md:pt-20">
      {/* Full-bleed 3D stage (decorative). */}
      <SceneView scene="hero" params={params} className="absolute inset-0" fallback={<HeroFallback />} />

      {/* Readability vignette behind the copy */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_50%,rgb(0_0_0/0.85),transparent_80%)]"
      />

      {/* Soft fade into the page, so the 3D never ends on a hard line */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink"
      />

      <div className="container-site relative my-auto flex flex-col items-center py-16 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-gold">
          Technology &amp; Digital Solutions Partner
        </p>
        {/* The headline is the LCP element, so its main text paints at once (never hidden in a
            reveal mask: Lighthouse measured that costing ~1 s of LCP on mobile). Only the gold
            outcome words rise in, as a pure-CSS reveal that doesn't wait for hydration. */}
        <h1 className="mt-5 max-w-5xl text-display-xl font-semibold text-balance">
          Custom Software &amp; Digital Solutions to{" "}
          <SplitText text="" accent="Grow Your Business" trigger="load" delay={150} />
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted md:text-lg">
          Web &amp; App Development, UI/UX Design, and Business Strategy – all tailored to your needs.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href={primaryCta.href} size="lg">
            {primaryCta.label}
          </Button>
          <Button href="/services" variant="secondary" size="lg">
            Explore Our Solutions
          </Button>
        </div>
      </div>
    </section>
  );
}
