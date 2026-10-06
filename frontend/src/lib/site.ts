/**
 * Site-wide configuration: brand facts, contact channels and navigation.
 * Components import from here instead of hardcoding strings, so changing a
 * phone number or adding a nav item is a one-line edit.
 */

export const siteConfig = {
  name: "Riyadvi Software Technologies",
  shortName: "Riyadvi",
  founded: 2021,
  tagline: "A Technology & Digital Solutions Partner",
  description:
    "Riyadvi is a technology and digital solutions partner combining strategy, design and engineering — custom software, web & app development, UI/UX, AR/VR and digital marketing that help businesses grow.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  // TODO(owner): replace placeholders with Riyadvi's real contact details via env.
  contact: {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@riyadvisoftwaretechnologies.com",
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "+91 00000 00000",
    // International format, digits only — used to build the wa.me link.
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "910000000000",
    calendly: process.env.NEXT_PUBLIC_CALENDLY_URL ?? "https://calendly.com/",
  },
} as const;

export type NavLink = { label: string; href: string };

/** Primary navigation (navbar + mobile menu). */
export const mainNav: NavLink[] = [
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

/** Global conversion CTA shown in the navbar and footer. */
export const primaryCta: NavLink = {
  label: "Book a Free Consultation",
  href: "/contact#consultation",
};

/**
 * Static footer link groups. The "Services" column is generated from the
 * data layer in <Footer>, so a new service shows up there automatically.
 */
export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Portfolio", href: "/portfolio" },
      { label: "Careers", href: "/careers" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Business Health Checkup", href: "/business-health-checkup" },
      { label: "Project Planning Guide", href: "/software-project-planning-guide" },
    ],
  },
];

/** Builds a WhatsApp deep link with an optional prefilled message. */
export function whatsappLink(message = "Hi Riyadvi, I'd like to discuss a project.") {
  return `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(message)}`;
}
