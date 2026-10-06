"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import type { Network } from "@/three/utils/network";
import { mulberry32 } from "@/three/utils/network";
import { palette } from "@/lib/theme";
import type { SceneProps } from "@/three/scenes/types";

/*
 * GPU-animated "data packets" travelling along the network's connections.
 *
 * Each point stores its edge's start + end position and a random seed as
 * vertex attributes. The vertex shader computes where along the edge the
 * point is from a single uTime uniform:
 *     t = fract(uTime * speed + seed);  position = mix(start, end, t)
 * So the CPU work per frame is ONE number (uTime), no matter how many pulses.
 */
const vertexShader = /* glsl */ `
  attribute vec3 aStart;
  attribute vec3 aEnd;
  attribute float aSeed;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  varying float vFade;

  void main() {
    float speed = 0.12 + fract(aSeed * 7.13) * 0.22;
    float t = fract(uTime * speed + aSeed);
    vec4 mv = modelViewMatrix * vec4(mix(aStart, aEnd, t), 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio / -mv.z;   // perspective size
    vFade = sin(t * 3.14159);                     // fade in/out at the nodes
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  varying float vFade;

  void main() {
    float d = length(gl_PointCoord - 0.5);        // round, soft-edged dot
    float alpha = smoothstep(0.5, 0.0, d) * vFade;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

type Props = { network: Network; maxPulses: number } & Pick<SceneProps, "activeRef" | "reducedMotion">;

export function DataPulses({ network, maxPulses, activeRef, reducedMotion }: Props) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const dpr = useThree((s) => s.viewport.dpr);

  const buffers = useMemo(() => {
    const { edges, positions } = network;
    const edgeCount = edges.length / 2;
    const n = Math.min(maxPulses, edgeCount);
    const rand = mulberry32(7);
    const start = new Float32Array(n * 3);
    const end = new Float32Array(n * 3);
    const seed = new Float32Array(n);
    for (let p = 0; p < n; p++) {
      const e = Math.floor(rand() * edgeCount);
      // Random direction so traffic flows both ways.
      const [a, b] = rand() > 0.5 ? [edges[e * 2], edges[e * 2 + 1]] : [edges[e * 2 + 1], edges[e * 2]];
      start.set(positions.subarray(a * 3, a * 3 + 3), p * 3);
      end.set(positions.subarray(b * 3, b * 3 + 3), p * 3);
      seed[p] = rand();
    }
    return { start, end, seed };
  }, [network, maxPulses]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 70 },
      uPixelRatio: { value: dpr },
      uColor: { value: new THREE.Color(palette.goldLight) },
    }),
    [dpr],
  );

  useFrame((_, delta) => {
    if (!activeRef.current || reducedMotion || !materialRef.current) return;
    materialRef.current.uniforms.uTime.value += Math.min(delta, 0.1);
  });

  return (
    // frustumCulled off: the real positions are computed in the shader, so
    // three's bounding-sphere test (based on `position`) would be wrong.
    <points frustumCulled={false} raycast={() => null}>
      <bufferGeometry>
        {/* `position` is required by three to know the vertex count. */}
        <bufferAttribute attach="attributes-position" args={[buffers.start, 3]} />
        <bufferAttribute attach="attributes-aStart" args={[buffers.start, 3]} />
        <bufferAttribute attach="attributes-aEnd" args={[buffers.end, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[buffers.seed, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
