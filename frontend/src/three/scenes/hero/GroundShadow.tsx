"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { palette } from "@/lib/theme";

/**
 * Soft gold light pool under the hero landscape, which grounds the columns so
 * they read as a physical object in a space.
 *
 * Why not drei <ContactShadows>? It re-renders the whole scene into a depth
 * target every frame (a second render pass), and that render target fights
 * the scissored Drei <View> setup our single shared canvas uses. A
 * radial-gradient "blob shadow" is the classic real-time technique: one
 * transparent plane and one draw call.
 */
export function GroundShadow({ y = -3.3 }: { y?: number }) {
  const texture = useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    // Warm reflected light in the centre fading to transparent: a shadow on a
    // black page is invisible, so the pool is gold rather than dark.
    g.addColorStop(0, "rgba(212,175,55,0.55)");
    g.addColorStop(0.35, "rgba(184,148,31,0.22)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <group position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Wide, faint pool */}
      <mesh scale={[7, 3.2, 1]} raycast={() => null}>
        <planeGeometry />
        <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} opacity={0.55} />
      </mesh>
      {/* Tight, brighter "contact" core directly under the sphere */}
      <mesh scale={[2.2, 1.1, 1]} position={[0, 0, 0.001]} raycast={() => null}>
        <planeGeometry />
        <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} color={palette.goldLight} />
      </mesh>
    </group>
  );
}
