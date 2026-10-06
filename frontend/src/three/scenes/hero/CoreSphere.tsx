"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { palette } from "@/lib/theme";
import type { SceneProps } from "@/three/scenes/types";

/*
 * Fresnel glow: brightest where the surface turns away from the camera
 * (the silhouette), transparent where it faces us. This fakes a bloom halo
 * with one cheap shader — real bloom post-processing would re-render the
 * whole canvas and doesn't work with multiple scissored Views anyway.
 */
const glowVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const glowFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float fresnel = pow(1.0 - abs(dot(vNormal, vView)), 4.0);
    gl_FragColor = vec4(uColor, fresnel * uIntensity);
  }
`;

const noRaycast = () => null;

type Props = Pick<SceneProps, "activeRef" | "reducedMotion" | "tier">;

/**
 * The "core" of the ecosystem — the business at the centre of its systems.
 * Three layers: faceted dark-gold metal, a counter-rotating wireframe shell
 * (structure/technology), and a soft fresnel glow.
 */
export function CoreSphere({ activeRef, reducedMotion, tier }: Props) {
  const shellRef = useRef<THREE.LineSegments>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  // EdgesGeometry draws only the icosahedron's real edges (clean triangles),
  // unlike wireframe mode which also shows internal diagonals.
  const shellGeometry = useMemo(() => {
    const ico = new THREE.IcosahedronGeometry(1.08, 1);
    const edges = new THREE.EdgesGeometry(ico);
    ico.dispose();
    return edges;
  }, []);
  // Passed as a prop (not JSX), so R3F won't auto-dispose it → we do.
  useEffect(() => () => shellGeometry.dispose(), [shellGeometry]);

  const glowUniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color(palette.gold) }, uIntensity: { value: 0.55 } }),
    [],
  );

  useFrame((_, delta) => {
    if (!activeRef.current || reducedMotion) return;
    const dt = Math.min(delta, 0.1);
    if (shellRef.current) {
      shellRef.current.rotation.y -= dt * 0.18;
      shellRef.current.rotation.z += dt * 0.05;
    }
    if (coreRef.current) coreRef.current.rotation.y += dt * 0.1;
  });

  return (
    <group>
      <mesh ref={coreRef} raycast={noRaycast}>
        <icosahedronGeometry args={[0.82, tier === "high" ? 2 : 1]} />
        <meshPhysicalMaterial
          color={palette.bronzeShadow}
          metalness={1}
          roughness={0.22}
          clearcoat={1}
          clearcoatRoughness={0.12}
          flatShading // crisp facets catch the gold light strips
        />
      </mesh>

      <lineSegments ref={shellRef} geometry={shellGeometry} raycast={noRaycast}>
        <lineBasicMaterial color={palette.gold} transparent opacity={0.4} toneMapped={false} />
      </lineSegments>

      <mesh scale={1.22} raycast={noRaycast}>
        <sphereGeometry args={[1, 48, 48]} />
        <shaderMaterial
          vertexShader={glowVertex}
          fragmentShader={glowFragment}
          uniforms={glowUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
