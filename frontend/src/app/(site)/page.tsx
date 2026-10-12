import { Hero } from "@/components/sections/home/Hero";
import { TransformationStory } from "@/components/sections/home/TransformationStory";
import { ServicesSection } from "@/components/sections/home/ServicesSection";
import { TechEcosystem } from "@/components/sections/home/TechEcosystem";
import { WhyRiyadvi } from "@/components/sections/home/WhyRiyadvi";
import { FeaturedWork } from "@/components/sections/home/FeaturedWork";
import { LeadCtas } from "@/components/sections/home/LeadCtas";
import { Capabilities } from "@/components/sections/home/Capabilities";
import { ContactClose } from "@/components/sections/home/ContactClose";
import { CapabilityMarquee } from "@/components/sections/home/CapabilityMarquee";
import { getServices, getTechnologies } from "@/lib/content";

/**
 * Home: composed from self-contained section components. Each section uses a
 * different layout family (split hero, 3D layer stack, pinned scroll story,
 * zig-zag tiles, orbit, stats + timeline, carousel, CTA pair, form), so the
 * page never falls into a repeated "heading + card grid" rhythm.
 *
 * hero → capabilities (about) → transformation story (process) → services →
 * technology ecosystem → why Riyadvi → selected work → lead CTAs → contact.
 */
export default async function HomePage() {
  const [technologies, services] = await Promise.all([getTechnologies(), getServices()]);
  return (
    <>
      <Hero />
      <Capabilities />
      <TransformationStory />
      <ServicesSection />
      <TechEcosystem technologies={technologies} />
      <CapabilityMarquee items={services.map((s) => s.title)} />
      <WhyRiyadvi />
      <FeaturedWork />
      <LeadCtas />
      <ContactClose />
    </>
  );
}
