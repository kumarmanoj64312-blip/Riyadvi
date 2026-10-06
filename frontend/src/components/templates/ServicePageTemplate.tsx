import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SceneView } from "@/three/canvas/SceneView";
import { ServiceFallback } from "@/three/fallbacks/ServiceFallback";
import { ProjectCard, type ProjectCardData } from "@/components/portfolio/ProjectCard";
import type { Service } from "@/types/content";

type Props = {
  service: Service;
  /** Neighbouring services for the "Explore more" footer. */
  others: Pick<Service, "slug" | "title" | "tagline">[];
  /** Case studies from service.relatedProjects, resolved by the page. */
  relatedProjects: ProjectCardData[];
};

/**
 * ONE template renders every /services/[slug] page. All differences between
 * services live in data (src/data/services.ts or the DB), never in code.
 *
 * Sections: interactive hero · problem · solution · key features ·
 * industry use cases · technology stack · process · related work · CTA
 */
export function ServicePageTemplate({ service, others, relatedProjects }: Props) {
  const quoteHref = `/contact?service=${service.slug}#quote`;
  const draggable = service.sceneType === "3d-modeling";

  return (
    <article>
      {/* 1 · Interactive hero */}
      <section className="relative pt-28 md:pt-32">
        <div className="container-site grid items-center gap-8 lg:grid-cols-2">
          <div>
            <nav aria-label="Breadcrumb" className="text-sm text-subtle">
              <Link href="/services" className="hover:text-gold">
                Services
              </Link>
              <span aria-hidden="true"> / </span>
              <span className="text-muted">{service.title}</span>
            </nav>
            <p className="mt-6 text-sm font-medium uppercase tracking-[0.25em] text-gold">{service.title}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance md:text-6xl">{service.hero.headline}</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{service.hero.intro}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href={quoteHref} size="lg">
                Get a Quote
              </Button>
              <Button href="/contact#consultation" variant="secondary" size="lg">
                Book a free consultation
              </Button>
            </div>
          </div>

          {/* data-scene-host: the whole visual box drives hover/tilt. */}
          <div data-scene-host className="relative aspect-square w-full lg:aspect-[4/3.4]">
            <SceneView
              scene="service"
              params={{ serviceType: service.sceneType, variant: "hero" }}
              fallback={<ServiceFallback type={service.sceneType} />}
              className="absolute inset-0"
            />
            {draggable && (
              <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-subtle">
                Drag to rotate · hover to see the mesh
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 2 · Problem  +  3 · Solution */}
      <section className="py-24">
        <div className="container-site grid gap-6 lg:grid-cols-2">
          <Reveal className="rounded-3xl border border-line bg-surface-2 p-8 md:p-10">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-subtle">The problem</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">{service.problem.title}</h2>
            <ul className="mt-6 space-y-3">
              {service.problem.points.map((p) => (
                <li key={p} className="flex gap-3 text-muted">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-subtle" />
                  {p}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.08} className="relative overflow-hidden rounded-3xl border border-gold/30 bg-surface-2 p-8 md:p-10">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgb(212_175_55/0.14),transparent_60%)]" />
            <p className="relative text-sm font-medium uppercase tracking-[0.25em] text-gold">Our solution</p>
            <h2 className="relative mt-3 text-2xl font-semibold tracking-tight md:text-3xl">{service.solution.title}</h2>
            <p className="relative mt-6 text-lg leading-relaxed text-muted">{service.solution.description}</p>
          </Reveal>
        </div>
      </section>

      {/* 4 · Key features */}
      <section className="border-t border-line py-24">
        <div className="container-site">
          <SectionHeading eyebrow="Key features" title="What you get" />
          <ul className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {service.features.map((f, i) => (
              <Reveal as="li" key={f.title} delay={(i % 3) * 0.06} className="bg-ink p-8">
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.description}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* 5 · Industry use cases */}
      <section className="py-24">
        <div className="container-site">
          <SectionHeading eyebrow="Industry use cases" title="Where it makes an impact" />
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {service.useCases.map((u, i) => (
              <Reveal as="li" key={u.industry} delay={i * 0.06} className="rounded-2xl border border-line bg-surface-2 p-6">
                <h3 className="font-semibold text-gold">{u.industry}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{u.description}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* 6 · Technology stack  +  7 · Process */}
      <section className="border-t border-line py-24">
        <div className="container-site grid gap-16 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <SectionHeading eyebrow="Technology stack" title="Proven tools" />
            <ul className="mt-8 flex flex-wrap gap-2">
              {service.techStack.map((t) => (
                <li key={t} className="rounded-full border border-line-strong bg-glass px-4 py-2 text-sm">
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeading eyebrow="Process" title="How we deliver" />
            <ol className="mt-8 space-y-4">
              {service.process.map((step, i) => (
                <Reveal as="li" key={step.title} delay={i * 0.06} className="flex gap-5 rounded-2xl border border-line p-5">
                  <span className="font-mono text-2xl text-gold">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="mt-1 text-sm text-muted">{step.description}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* 8 · Related portfolio */}
      {relatedProjects.length > 0 && (
        <section className="py-24">
          <div className="container-site">
            <SectionHeading eyebrow="Related work" title={`${service.title} in action`} />
            <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {relatedProjects.map((p, i) => (
                <Reveal as="li" key={p.slug} delay={i * 0.08}>
                  <ProjectCard project={p} />
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 9 · CTA */}
      <section className="pb-8 pt-8">
        <div className="container-site">
          <div className="flex flex-col items-start gap-6 rounded-3xl border border-gold/30 bg-surface-2 p-8 md:flex-row md:items-center md:justify-between md:p-12">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Ready to start your {service.title.toLowerCase()} project?</h2>
              <p className="mt-2 text-muted">Tell us what you need — you&apos;ll get a clear scope and estimate within 48 hours.</p>
            </div>
            <Button href={quoteHref} size="lg">
              Get a Quote
            </Button>
          </div>

          <nav aria-label="Other services" className="mt-16">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-subtle">Explore more services</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link href={`/services/${o.slug}`} className="group block rounded-2xl border border-line p-4 transition-colors hover:border-gold/40">
                    <span className="font-medium group-hover:text-gold">{o.title}</span>
                    <span className="mt-1 block text-xs text-subtle">{o.tagline}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>
    </article>
  );
}
