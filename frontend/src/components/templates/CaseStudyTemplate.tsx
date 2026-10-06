import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScreenMock } from "@/components/portfolio/ScreenMock";
import { SceneView } from "@/three/canvas/SceneView";
import type { Project, Service } from "@/types/content";

type Props = {
  project: Project;
  /** Services delivered on this project (resolved from project.services). */
  services: Pick<Service, "slug" | "title" | "tagline">[];
  next: Pick<Project, "slug" | "client" | "title">;
};

/**
 * ONE template renders every /portfolio/[slug] case study:
 * hero (client · industry · year · services) → showcase (interactive 3D device
 * when `project.showcase` is set, otherwise a large screen visual) → challenge
 * & solution → deliverables & technologies → results → visuals → related
 * services → next project.
 */
export function CaseStudyTemplate({ project, services, next }: Props) {
  const primaryScreen = project.screens[0];

  return (
    <article>
      {/* Hero */}
      <section className="pb-12 pt-32 md:pt-40">
        <div className="container-site">
          <nav aria-label="Breadcrumb" className="text-sm text-subtle">
            <Link href="/portfolio" className="hover:text-gold">
              Portfolio
            </Link>
            <span aria-hidden="true"> / </span>
            <span className="text-muted">{project.client}</span>
          </nav>
          <p className="mt-6 text-sm font-medium uppercase tracking-[0.25em] text-gold">{project.client}</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-balance md:text-6xl">{project.title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{project.summary}</p>

          <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-line pt-8 md:grid-cols-4">
            <Meta label="Client">{project.client}</Meta>
            <Meta label="Industry">{project.industry}</Meta>
            <Meta label="Year">{project.year}</Meta>
            <Meta label="Services">
              {services.map((s, i) => (
                <span key={s.slug}>
                  <Link href={`/services/${s.slug}`} className="hover:text-gold">
                    {s.title}
                  </Link>
                  {i < services.length - 1 && ", "}
                </span>
              ))}
            </Meta>
          </dl>
        </div>
      </section>

      {/* Showcase */}
      <section aria-label="Project showcase" className="pb-24">
        <div className="container-site">
          {project.showcase ? (
            <div
              data-scene-host
              className="relative h-[70vh] min-h-[420px] overflow-hidden rounded-3xl border border-line bg-[radial-gradient(ellipse_at_center,rgb(212_175_55/0.08),transparent_70%)]"
            >
              <SceneView
                scene="device"
                params={{
                  showcase: {
                    device: project.showcase.device,
                    client: project.client,
                    accent: project.accent,
                    screens: project.screens.map((s) => s.label),
                  },
                }}
                fallback={
                  <div className="absolute inset-0 flex items-center justify-center p-10">
                    <ScreenMock client={project.client} accent={project.accent} screen={primaryScreen} className="max-h-full" />
                  </div>
                }
                className="absolute inset-0 touch-pan-y"
              />
              <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-ink/70 px-4 py-1.5 text-xs text-muted">
                Drag to rotate · tap the device to switch screens
              </p>
            </div>
          ) : (
            <div className="flex justify-center rounded-3xl border border-line bg-surface-2 p-6 md:p-16">
              <ScreenMock client={project.client} accent={project.accent} screen={primaryScreen} className="max-w-4xl" />
            </div>
          )}
        </div>
      </section>

      {/* Challenge & solution */}
      <section className="pb-24">
        <div className="container-site grid gap-6 lg:grid-cols-2">
          <Reveal className="rounded-3xl border border-line bg-surface-2 p-8 md:p-10">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-subtle">The challenge</p>
            <p className="mt-4 text-lg leading-relaxed text-fg">{project.challenge}</p>
          </Reveal>
          <Reveal delay={0.08} className="rounded-3xl border border-gold/30 bg-surface-2 p-8 md:p-10">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-gold">Our solution</p>
            <p className="mt-4 text-lg leading-relaxed text-fg">{project.solution}</p>
          </Reveal>
        </div>
      </section>

      {/* Deliverables & technologies */}
      <section className="border-t border-line py-24">
        <div className="container-site grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="What we delivered" title="Scope" />
            <ul className="mt-8 space-y-3">
              {project.deliverables.map((d) => (
                <li key={d} className="flex items-center gap-3">
                  <span aria-hidden="true" className="flex h-6 w-6 items-center justify-center rounded-full border border-gold/50 text-xs text-gold">
                    ✓
                  </span>
                  {d}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeading eyebrow="Technologies" title="Built with" />
            <ul className="mt-8 flex flex-wrap gap-2">
              {project.technologies.map((t) => (
                <li key={t} className="rounded-full border border-line-strong bg-glass px-4 py-2 text-sm">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-24">
        <div className="container-site">
          <SectionHeading eyebrow="Results" title="The impact" />
          <ul className="mt-12 grid gap-5 md:grid-cols-3">
            {project.results.map((r, i) => (
              <Reveal as="li" key={r.label} delay={i * 0.08} className="rounded-3xl border border-line bg-surface-2 p-8">
                <p className="text-gold-gradient text-5xl font-semibold tracking-tight md:text-6xl">{r.value}</p>
                <p className="mt-3 text-muted">{r.label}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Visuals */}
      <section className="border-t border-line py-24">
        <div className="container-site">
          <SectionHeading eyebrow="Visuals" title="Key screens" />
          <ul className="mt-12 grid items-center gap-8 md:grid-cols-2 lg:grid-cols-3">
            {project.screens.map((s, i) => (
              <Reveal as="li" key={s.label} delay={i * 0.08} className="flex flex-col items-center gap-3">
                <ScreenMock client={project.client} accent={project.accent} screen={s} variant={i} />
                <span className="text-sm text-subtle">{s.label}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {project.testimonial && (
        <section className="pb-24">
          <div className="container-site">
            <blockquote className="mx-auto max-w-3xl text-center">
              <p className="text-2xl font-medium leading-snug text-balance md:text-3xl">“{project.testimonial.quote}”</p>
              <footer className="mt-6 text-sm text-muted">
                {project.testimonial.author} · {project.testimonial.role}
              </footer>
            </blockquote>
          </div>
        </section>
      )}

      {/* Related services + next project */}
      <section className="border-t border-line pb-8 pt-24">
        <div className="container-site">
          <SectionHeading eyebrow="Related services" title="Capabilities behind this project" />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="group block h-full rounded-2xl border border-line p-6 transition-colors hover:border-gold/40">
                  <span className="text-lg font-semibold group-hover:text-gold">{s.title}</span>
                  <span className="mt-1 block text-sm text-muted">{s.tagline}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-16 flex flex-col gap-6 rounded-3xl border border-gold/30 bg-surface-2 p-8 md:flex-row md:items-center md:justify-between md:p-12">
            <div>
              <p className="text-sm text-subtle">Next case study</p>
              <Link href={`/portfolio/${next.slug}`} className="mt-1 block text-2xl font-semibold tracking-tight hover:text-gold">
                {next.client} — {next.title} →
              </Link>
            </div>
            <Button href="/contact#consultation">Start a similar project</Button>
          </div>
        </div>
      </section>
    </article>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.2em] text-subtle">{label}</dt>
      <dd className="mt-2 text-fg">{children}</dd>
    </div>
  );
}
