import { StoryScroller } from "@/components/sections/home/StoryScroller";
import { MorphFallback } from "@/three/fallbacks/MorphFallback";
import { getTransformationStages } from "@/lib/content";

/**
 * Server wrapper: reads the stage content through the data layer and
 * pre-renders the SVG fallback on the server, then hands both to the
 * client-side scroll choreography.
 */
export async function TransformationStory() {
  const stages = await getTransformationStages();
  return <StoryScroller stages={stages} fallback={<MorphFallback />} />;
}
