"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { palette } from "@/lib/theme";

/**
 * Reusable "gold studio" lighting for metallic objects.
 *
 * Metal is mostly reflection, so what makes it look premium is *what it
 * reflects*. On "high" tier we build a tiny environment from emissive
 * Lightformer panels (no HDR download): drei renders them into a cube map
 * ONCE (frames={1}) and every material reflects it afterwards.
 *
 * On "medium" (phones/tablets) the cube-map render + its extra shader
 * compiles were measured as a large share of 3D start-up time on a throttled
 * CPU, so medium uses a cheap hemisphere + key/rim light rig instead.
 */
export function StudioLighting({ tier }: { tier: "high" | "medium" }) {
  if (tier === "medium") {
    return (
      <>
        <hemisphereLight args={[palette.goldLight, "#000000", 1.6]} />
        <directionalLight position={[4, 5, 6]} intensity={2.2} color={palette.goldLight} />
        <directionalLight position={[-5, -2, -3]} intensity={1.2} color={palette.gold} />
      </>
    );
  }

  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[4, 5, 6]} intensity={1.2} color={palette.goldLight} />

      <Environment resolution={256} frames={1}>
        {/* Long warm strip overhead → bright gold highlight band */}
        <Lightformer form="rect" intensity={4} color={palette.goldLight} position={[0, 4, -3]} scale={[10, 1.5, 1]} />
        {/* Gold ring on the left → circular glints in the facets */}
        <Lightformer form="ring" intensity={3} color={palette.gold} position={[-5, 1, 2]} scale={2.5} />
        {/* Soft neutral fill from the right keeps the dark side readable */}
        <Lightformer form="rect" intensity={1.2} color={palette.fg} position={[5, -1, 3]} scale={[2, 4, 1]} />
      </Environment>
    </>
  );
}
