"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { StudioLighting } from "@/three/scenes/shared/StudioLighting";
import { palette } from "@/lib/theme";

/**
 * Jewellery / product-photography studio for premium hero objects.
 *
 * Polished metal and glass are mostly reflection, so what makes them look
 * expensive is WHAT they reflect: long strip lights give crisp vertical
 * highlights, a warm softbox the broad sheen, a gold rim light the glowing
 * edges, a front fill keeps faces from mirroring black space. Rendered into
 * a cube map ONCE (frames={1}), so it costs nothing per frame.
 * Medium tier (phones/tablets) falls back to the cheaper shared rig.
 */
export function GoldStudio({ tier }: { tier: "high" | "medium" }) {
  if (tier !== "high") return <StudioLighting tier={tier} />;
  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[3, 5, 6]} intensity={1.1} color="#fff1d0" />
      <Environment resolution={512} frames={1}>
        <Lightformer form="rect" intensity={2.4} color="#fff1d0" position={[0, 6, 1]} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={6} color="#ffe3a6" position={[-5.5, 0.5, 2.5]} scale={[0.7, 9, 1]} />
        <Lightformer form="rect" intensity={3.5} color="#ffffff" position={[5.5, -0.5, 1.5]} scale={[0.5, 7, 1]} />
        <Lightformer form="ring" intensity={2.5} color={palette.gold} position={[0, 0, -7]} scale={7} />
        <Lightformer form="rect" intensity={1.2} color="#b8862b" position={[0, -6, 0]} scale={[10, 10, 1]} />
        <Lightformer form="rect" intensity={0.9} color="#e9b75a" position={[0, 0, 9]} scale={[12, 8, 1]} />
      </Environment>
    </>
  );
}
