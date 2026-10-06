import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { footerNav, primaryCta, siteConfig, whatsappLink } from "@/lib/site";
import { getServices } from "@/lib/content";

/**
 * Global footer (Server Component — ships zero JS).
 * Top band is the site-wide closing CTA ("Footer CTA" in the homepage spec),
 * so every page ends with a conversion path.
 */
export async function Footer() {
  const year = new Date().getFullYear();
  const services = await getServices();
  const groups = [
    { title: "Services", links: services.map((s) => ({ label: s.title, href: `/services/${s.slug}` })) },
    ...footerNav,
  ];

  return (
    <footer className="relative border-t border-line bg-surface">
      {/* Closing CTA band */}
      <div className="container-site py-20 md:py-28">
        <div className="relative overflow-hidden rounded-3xl border border-line bg-surface-2 px-6 py-14 text-center md:px-16">
          {/* Soft gold radial glow — pure CSS, no image request. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgb(212_175_55/0.18),transparent_60%)]"
          />
          <p className="relative text-sm font-medium uppercase tracking-[0.2em] text-gold">
            Let&apos;s build what&apos;s next
          </p>
          <h2 className="relative mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-balance md:text-5xl">
            Ready to grow your business with the right technology partner?
          </h2>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href={primaryCta.href} size="lg">
              {primaryCta.label}
            </Button>
            <Button href="/business-health-checkup" variant="secondary" size="lg">
              Take the Business Health Checkup
            </Button>
          </div>
        </div>
      </div>

      {/* Link columns */}
      <div className="container-site grid gap-12 border-t border-line py-16 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted">{siteConfig.description}</p>
          <ul className="mt-6 space-y-2 text-sm">
            <li>
              <a href={`mailto:${siteConfig.contact.email}`} className="text-muted hover:text-gold">
                {siteConfig.contact.email}
              </a>
            </li>
            <li>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-gold">
                WhatsApp · {siteConfig.contact.phone}
              </a>
            </li>
          </ul>
        </div>

        {groups.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h3 className="text-sm font-semibold text-fg">{group.title}</h3>
            <ul className="mt-4 space-y-3">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted transition-colors hover:text-gold">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="container-site flex flex-col gap-2 border-t border-line py-6 text-xs text-subtle sm:flex-row sm:justify-between">
        <p>
          © {year} {siteConfig.name}. All rights reserved.
        </p>
        <p>Building digital growth since {siteConfig.founded}.</p>
      </div>
    </footer>
  );
}
