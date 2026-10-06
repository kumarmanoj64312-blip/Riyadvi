"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { looks, type VariantProps } from "@/three/scenes/services/shared";
import { palette } from "@/lib/theme";

/**
 * Default visual for services that don't have a bespoke scene yet (e.g. a new
 * service added through the CMS). Faceted gold core + edge shell — on-brand,
 * never a blank box.
 */
export function GenericScene({ activeRef, hover, reducedMotion }: VariantProps) {
  const ref = useRef<THREE.Group>(null);
  const edges = useMemo(() => {
    const ico = new THREE.IcosahedronGeometry(1.35, 1);
    const e = new THREE.EdgesGeometry(ico);
    ico.dispose();
    return e;
  }, []);
  useEffect(() => () => edges.dispose(), [edges]);

  useFrame((_, delta) => {
    if (!activeRef.current || !ref.current || reducedMotion) return;
    ref.current.rotation.y += Math.min(delta, 0.1) * (0.3 + hover.current);
  });

  return (
    <group ref={ref}>
      <mesh raycast={() => null}>
        <icosahedronGeometry args={[0.9, 1]} />
        <meshStandardMaterial {...looks.gold} flatShading />
      </mesh>
      <lineSegments geometry={edges} raycast={() => null}>
        <lineBasicMaterial color={palette.gold} transparent opacity={0.45} toneMapped={false} />
      </lineSegments>
    </group>
  );
}
