import { LazyContactForm } from "@/components/forms/LazyContactForm";
import { SplitText } from "@/components/ui/SplitText";
import { getServices } from "@/lib/content";
import { contactRequirements } from "@/lib/requirements";
import { siteConfig, whatsappLink } from "@/lib/site";

/**
 * Home › closing section: the page ends on a working contact form instead of
 * yet another button. The form is the same one as /contact (POST /api/contact
 * → MongoDB + team email), loaded only as the visitor scrolls near it.
 *
 * Lighting: a soft gold "stage light" that follows the cursor across the
 * section (`data-spotlight`: PointerFX writes --spot-x / --spot-y), on top of
 * a fixed warm glow so it still looks lit on touch screens and with reduced motion.
 */
export async function ContactClose() {
  const services = await getServices();
  const channels = [
    { label: "Email", value: siteConfig.contact.email, href: `mailto:${siteConfig.contact.email}` },
    { label: "WhatsApp", value: siteConfig.contact.phone, href: whatsappLink() },
  ];

  return (
    <section
      id="start"
      aria-labelledby="start-heading"
      data-spotlight=""
      className="spotlight relative overflow-hidden border-t border-line py-section"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgb(212_175_55/0.12),transparent_55%)]"
      />
      <div className="container-site relative grid gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <h2 id="start-heading" className="text-display-xl font-semibold text-balance">
            <SplitText text="Tell us what you are" accent="building next" />
          </h2>
          <p className="mt-6 max-w-[48ch] text-lg text-muted">
            Share a few details about your business and the project. We will get back to you with clear next steps.
          </p>
          <dl className="mt-10 space-y-5">
            {channels.map((c) => (
              <div key={c.label}>
                <dt className="text-sm text-subtle">{c.label}</dt>
                <dd className="mt-1">
                  <a
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="font-display text-xl font-medium text-fg transition-colors hover:text-gold"
                  >
                    {c.value}
                  </a>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Machined "double bezel" panel: an outer tray with an inset inner surface. */}
        <div className="rounded-[calc(var(--radius-card)+0.5rem)] border border-line bg-white/2 p-2">
          <div className="rounded-card bg-surface p-6 shadow-inner-edge md:p-10">
            <LazyContactForm requirements={contactRequirements(services)} />
          </div>
        </div>
      </div>
    </section>
  );
}
