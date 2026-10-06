"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useDragRotate } from "@/three/hooks/useDragRotate";
import { looks, type VariantProps } from "@/three/scenes/services/shared";
import { palette } from "@/lib/theme";

/**
 * 3D Modeling — a sculpted metal torus knot. Hover reveals its wireframe
 * (the topology a modeller works with: "beautiful surface, clean mesh").
 * Hero variant: drag to rotate with inertia (useDragRotate); otherwise it
 * turns like an object on a turntable.
 */
export function ModelingScene({ activeRef, hover, reducedMotion, isHero, tier }: VariantProps) {
  const objectRef = useRef<THREE.Group>(null);
  const wireRef = useRef<THREE.MeshBasicMaterial>(null);
  const drag = useDragRotate({ enabled: isHero, initialTilt: 0.3 });

  // One geometry shared by the solid and the wireframe overlay.
  const geometry = useMemo(
    () => new THREE.TorusKnotGeometry(0.85, 0.27, tier === "high" ? 180 : 110, tier === "high" ? 24 : 16),
    [tier],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, delta) => {
    const obj = objectRef.current;
    if (!activeRef.current || !obj) return;
    const dt = Math.min(delta, 0.1);
    const s = drag.step(dt, { spin: reducedMotion ? 0 : 0.35 + hover.current * 0.6 });
    obj.rotation.set(s.rotX, s.rotY, 0);
    if (wireRef.current) wireRef.current.opacity = (isHero ? 0.12 : 0) + hover.current * 0.55;
  });

  return (
    <group>
      <group ref={objectRef}>
        <mesh geometry={geometry} raycast={() => null}>
          <meshStandardMaterial {...looks.gold} roughness={0.22} />
        </mesh>
        <mesh geometry={geometry} scale={1.004} raycast={() => null}>
          <meshBasicMaterial ref={wireRef} color={palette.goldLight} wireframe transparent opacity={0} toneMapped={false} />
        </mesh>
      </group>

      {/* Ground ring — anchors the object like a turntable in a 3D viewport */}
      <mesh position={[0, -1.45, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
        <ringGeometry args={[1.1, 1.14, 64]} />
        <meshBasicMaterial color={palette.goldDark} transparent opacity={0.5} />
      </mesh>

      {/* Invisible hit sphere: generous grab target for dragging */}
      {isHero && (
        <mesh {...drag.handlers}>
          <sphereGeometry args={[1.5, 16, 16]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      )}
    </group>
  );
}
