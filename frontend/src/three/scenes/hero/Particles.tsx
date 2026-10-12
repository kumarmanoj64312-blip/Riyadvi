"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { palette } from "@/lib/theme";
import { mulberry32 } from "@/three/utils/network";

/*
 * Ambient "data dust" drifting above the hero landscape: the wider market
 * the business lives in. One Points draw call; all motion happens in the vertex shader
 * (each particle bobs on its own phase), so the CPU only updates one uniform.
 */
const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  attribute float aPhase;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.y += sin(uTime * 0.35 + aPhase) * 0.12;
    p.x += cos(uTime * 0.25 + aPhase * 1.7) * 0.08;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * (1.0 + 0.5 * sin(aPhase)) / -mv.z; // size attenuation
    gl_Position = projectionMatrix * mv;
    // Twinkle, and fade out toward the edge of the hero's square view box so
    // the dust ends in a soft circle instead of being cut off by the box edge.
    vec2 ndc = gl_Position.xy / gl_Position.w;
    vAlpha = (0.45 + 0.35 * sin(uTime * 0.8 + aPhase * 3.0)) * smoothstep(0.98, 0.55, length(ndc));
  }
`;
const fragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(uColor, (1.0 - d * 2.0) * vAlpha); // soft round dot
  }
`;

type Props = {
  count: number;
  activeRef: React.RefObject<boolean>;
  reducedMotion: boolean;
};

/** Particles in a flattened spherical shell (radius 2.6 to 4.2) around the scene origin. */
export function Particles({ count, activeRef, reducedMotion }: Props) {
  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const phase = new Float32Array(count);
    const rand = mulberry32(7); // seeded: same layout every render (pure, and stable across tiers)
    for (let i = 0; i < count; i++) {
      // Uniform direction on a sphere, radius biased outward.
      const u = rand() * 2 - 1;
      const t = rand() * Math.PI * 2;
      const r = 2.6 + Math.sqrt(rand()) * 1.6;
      const s = Math.sqrt(1 - u * u);
      pos.set([r * s * Math.cos(t), r * u * 0.75, r * s * Math.sin(t)], i * 3); // flattened a little
      phase[i] = rand() * Math.PI * 2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    return g;
  }, [count]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 22 },
      uColor: { value: new THREE.Color(palette.goldLight) },
    }),
    [],
  );
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((_, delta) => {
    // Through the material ref (same pattern as the other shader scenes): the memoised uniforms object is never mutated from render scope.
    if (!activeRef.current || reducedMotion || !materialRef.current) return; // reduced motion: a still starfield
    materialRef.current.uniforms.uTime.value += Math.min(delta, 0.1);
  });

  return (
    <points geometry={geometry} raycast={() => null}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
