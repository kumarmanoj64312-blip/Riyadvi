"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { mulberry32 } from "@/three/utils/network";

/*
 * Rivers of light: particles orbiting in a wide, flattened band. Each
 * particle is drawn TRAIL times, each copy a little behind the previous one
 * along its orbit and fainter, so every point leaves a short glowing streak.
 * All motion is in the vertex shader; the CPU updates one uniform per frame.
 */
const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uSize;
  attribute float aAngle;   // starting angle on the orbit
  attribute float aRadius;  // orbit radius
  attribute float aLift;    // height off the band plane
  attribute float aRate;    // individual angular speed
  attribute float aTrail;   // 0 = head of the streak … 1 = tail
  attribute float aHue;     // 0 = gold … 1 = warm white
  varying float vAlpha;
  varying float vHue;
  void main() {
    float a = aAngle + uTime * aRate * uSpeed - aTrail * 0.16; // tail copies overlap → one continuous streak
    // Gentle wobble so the band breathes instead of being a perfect ellipse.
    float r = aRadius * (1.0 + 0.04 * sin(a * 3.0 + uTime * 0.4));
    vec3 p = vec3(cos(a) * r, aLift + 0.12 * sin(a * 2.0 + aRadius), sin(a) * r);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * (1.0 - aTrail * 0.55) / -mv.z;
    gl_Position = projectionMatrix * mv;
    vAlpha = pow(1.0 - aTrail, 1.6);
    vHue = aHue;
  }
`;
const fragment = /* glsl */ `
  varying float vAlpha;
  varying float vHue;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    vec3 gold = vec3(0.86, 0.66, 0.24);
    vec3 white = vec3(1.0, 0.95, 0.85);
    float glow = pow(1.0 - d * 2.0, 1.5);
    gl_FragColor = vec4(mix(gold, white, vHue), glow * vAlpha);
  }
`;

type Props = {
  /** Particles per band (each drawn TRAIL times). */
  count: number;
  radius: number;
  /** Band thickness (spread around the radius). */
  spread: number;
  rotation: [number, number, number];
  seed: number;
  activeRef: React.RefObject<boolean>;
  reducedMotion: boolean;
  /** Extra speed multiplier written by the parent (e.g. from scroll). */
  speedRef: React.RefObject<number>;
};

const TRAIL = 12;

export function LightVortex({ count, radius, spread, rotation, seed, activeRef, reducedMotion, speedRef }: Props) {
  const geometry = useMemo(() => {
    const n = count * TRAIL;
    const rand = mulberry32(seed);
    const angle = new Float32Array(n);
    const rad = new Float32Array(n);
    const lift = new Float32Array(n);
    const rate = new Float32Array(n);
    const trail = new Float32Array(n);
    const hue = new Float32Array(n);
    for (let i = 0; i < count; i++) {
      // Radius clustered around the band centre (sum of uniforms ≈ normal).
      const r = radius + (rand() + rand() + rand() - 1.5) * spread;
      const a = rand() * Math.PI * 2;
      const l = (rand() - 0.5) * spread * 0.35;
      const s = 0.12 + rand() * 0.16;
      const h = rand() < 0.35 ? 0.85 : rand() * 0.4;
      for (let k = 0; k < TRAIL; k++) {
        const j = i * TRAIL + k;
        angle[j] = a;
        rad[j] = r;
        lift[j] = l;
        rate[j] = s;
        trail[j] = k / (TRAIL - 1);
        hue[j] = h;
      }
    }
    const g = new THREE.BufferGeometry();
    // Positions are computed in the shader; this attribute only sets the vertex count / bounds.
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute("aAngle", new THREE.BufferAttribute(angle, 1));
    g.setAttribute("aRadius", new THREE.BufferAttribute(rad, 1));
    g.setAttribute("aLift", new THREE.BufferAttribute(lift, 1));
    g.setAttribute("aRate", new THREE.BufferAttribute(rate, 1));
    g.setAttribute("aTrail", new THREE.BufferAttribute(trail, 1));
    g.setAttribute("aHue", new THREE.BufferAttribute(hue, 1));
    return g;
  }, [count, radius, spread, seed]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uSpeed: { value: 1 }, uSize: { value: 52 } }), []);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((_, delta) => {
    const m = materialRef.current;
    if (!activeRef.current || !m) return;
    if (!reducedMotion) m.uniforms.uTime.value += Math.min(delta, 0.1);
    m.uniforms.uSpeed.value = 1 + (speedRef.current ?? 0);
  });

  return (
    <points geometry={geometry} rotation={rotation} frustumCulled={false} raycast={() => null}>
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
