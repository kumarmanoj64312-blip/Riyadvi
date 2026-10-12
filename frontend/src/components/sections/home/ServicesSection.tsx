import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ServiceGrid } from "@/components/services/ServiceGrid";
import { getServices } from "@/lib/content";

/** Home › Services: six interactive tiles, each linking to its own page. */
export async function ServicesSection() {
  const services = await getServices();
  return (
    <section id="services" aria-labelledby="services-heading" className="py-24 md:py-32">
      <div className="container-site">
        <SectionHeading
          eyebrow="What we do"
          titleId="services-heading"
          title="Six capabilities, one accountable team"
          description="Hover a capability to see it in action, then open it for the full approach."
          action={
            <Button href="/services" variant="secondary">
              All services
            </Button>
          }
        />
        <div className="mt-12">
          <ServiceGrid services={services} />
        </div>
      </div>
    </section>
  );
}
