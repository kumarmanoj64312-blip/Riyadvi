import { SectionHeading } from "@/components/ui/SectionHeading";
import { CapabilityStack, type CapabilityLayer } from "@/components/sections/home/CapabilityStack";
import { getServices } from "@/lib/content";
import type { Service } from "@/types/content";

/**
 * Which services make up each layer of the stack (bottom → top). Slugs, not
 * titles, so renaming a service in the CMS never breaks this; unknown slugs
 * are skipped, so a new service only needs adding here to appear.
 */
const LAYERS: {
  id: string;
  name: string;
  summary: string;
  services: string[];
  extra?: { href: string; label: string }[];
}[] = [
  {
    id: "strategy",
    name: "Strategy",
    summary:
      "The foundation. We score where your business stands today and plan the work that moves real numbers, before anything is designed or built.",
    services: [],
    extra: [
      { href: "/business-health-checkup", label: "Business Health Checkup" },
      { href: "/software-project-planning-guide", label: "Project Planning Guide" },
    ],
  },
  {
    id: "design",
    name: "Design",
    summary: "Interfaces, products and 3D assets shaped around how your customers actually think and buy.",
    services: ["ui-ux-design", "3d-modeling"],
  },
  {
    id: "engineering",
    name: "Engineering",
    summary: "Websites, apps and immersive experiences, built on modern, maintainable code your team can grow with.",
    services: ["web-development", "app-development", "ar-vr"],
  },
  {
    id: "growth",
    name: "Growth",
    summary: "The visible result. Marketing, analytics and ongoing optimisation that turn a launch into leads and revenue.",
    services: ["digital-marketing"],
  },
];

function toLayers(services: Service[]): CapabilityLayer[] {
  return LAYERS.map((l) => ({
    id: l.id,
    name: l.name,
    summary: l.summary,
    links: [
      ...l.services.flatMap((slug) => {
        const s = services.find((x) => x.slug === slug);
        return s ? [{ href: `/services/${s.slug}`, label: s.title }] : [];
      }),
      ...(l.extra ?? []),
    ],
  }));
}

/** Home › About: who Riyadvi is, shown as the four layers of how we work. */
export async function Capabilities() {
  const services = await getServices();
  return (
    <section aria-labelledby="capabilities-heading" className="overflow-x-clip py-section">
      <div className="container-site">
        <SectionHeading
          titleId="capabilities-heading"
          title="One team for every layer of your digital business"
          description="Since 2021 we have grown from websites into a full partner. Each layer rests on the one below it, and we own all four."
        />
        <div className="mt-14">
          <CapabilityStack layers={toLayers(services)} />
        </div>
      </div>
    </section>
  );
}
