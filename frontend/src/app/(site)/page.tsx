import { Hero } from "@/components/sections/home/Hero";
import { TransformationStory } from "@/components/sections/home/TransformationStory";
import { ServicesSection } from "@/components/sections/home/ServicesSection";
import { TechEcosystem } from "@/components/sections/home/TechEcosystem";
import { WhyRiyadvi } from "@/components/sections/home/WhyRiyadvi";
import { FeaturedWork } from "@/components/sections/home/FeaturedWork";
import { LeadCtas } from "@/components/sections/home/LeadCtas";
import { getTechnologies } from "@/lib/content";

/**
 * Home — composed from self-contained section components, in the order of
 * the brief: hero → transformation story → services → technology ecosystem
 * → why Riyadvi → featured work → lead CTAs (→ footer CTA in the layout).
 */
export default async function HomePage() {
  const technologies = await getTechnologies();
  return (
    <>
      <Hero />
      <TransformationStory />
      <ServicesSection />
      <TechEcosystem technologies={technologies} />
      <WhyRiyadvi />
      <FeaturedWork />
      <LeadCtas />
    </>
  );
}
