"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { buildMorphLayouts, STAGE_COUNT } from "@/three/utils/morphLayouts";
import { mulberry32 } from "@/three/utils/network";
import { visibleArea } from "@/three/utils/camera";
import { pointer, scrollState } from "@/three/state/input";
import { palette } from "@/lib/theme";
import type { SceneProps } from "@/three/scenes/types";

const COUNT = { high: 2600, medium: 1300 } as const;
const FOV = 40;
const CAMERA_Z = 9.5;
const { damp } = THREE.MathUtils;

/*
 * GPU morph between six formations.
 *
 * Each point carries its position in ALL six formations as attributes
 * (aP0…aP5). Given uProgress ∈ [0, 5], the shader weights them with a
 * "tent" function so exactly two neighbouring formations blend at any time:
 *     w(k) = clamp(1 - |p - k|, 0, 1)      e.g. p = 2.3 → 70% design, 30% technology
 * A per-point random offset (uStagger) makes points leave at slightly
 * different moments, so the shape flows instead of snapping in unison.
 * CPU cost per frame: two uniforms, regardless of point count.
 */
const vertexShader = /* glsl */ `
  attribute vec3 aP0; attribute vec3 aP1; attribute vec3 aP2;
  attribute vec3 aP3; attribute vec3 aP4; attribute vec3 aP5;
  attribute float aRand;
  uniform float uProgress;
  uniform float uStagger;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  varying float vRand;

  float w(float p, float k) { return clamp(1.0 - abs(p - k), 0.0, 1.0); }

  void main() {
    float p = clamp(uProgress + (aRand - 0.5) * uStagger, 0.0, 5.0);
    float f = floor(p);
    float t = p - f;
    p = f + t * t * (3.0 - 2.0 * t);              // smoothstep easing per segment

    vec3 pos = aP0 * w(p, 0.0) + aP1 * w(p, 1.0) + aP2 * w(p, 2.0)
             + aP3 * w(p, 3.0) + aP4 * w(p, 4.0) + aP5 * w(p, 5.0);

    // Restless drift: strong in "Challenge" (chaos), calm once organised.
    float chaos = 1.0 - clamp(p, 0.0, 1.0);
    pos += vec3(
      sin(uTime * 0.7 + aRand * 40.0),
      cos(uTime * 0.6 + aRand * 30.0),
      sin(uTime * 0.5 + aRand * 20.0)
    ) * (0.03 + 0.17 * chaos);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.6 + aRand * 0.8) * uPixelRatio / -mv.z;
    vRand = aRand;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vRand;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.1, d);
    gl_FragColor = vec4(mix(uColorA, uColorB, vRand), alpha * 0.9);
  }
`;

/**
 * Transformation story visual: one point cloud that reorganises itself as
 * the visitor scrolls through Challenge → … → Growth.
 */
export default function MorphScene({ activeRef, tier, reducedMotion }: SceneProps) {
  const count = COUNT[tier];
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const rigRef = useRef<THREE.Group>(null);
  const progress = useRef(0);
  const time = useRef(0);

  const dpr = useThree((s) => s.viewport.dpr);
  const size = useThree((s) => s.size); // pixel size of this View's rectangle
  // Fit the ±3.2-unit formations into the View. The margin (8.2 / 7.8 vs 6.4)
  // covers perspective + sway rotation, which push points outward — anything
  // outside the View's rectangle would be clipped by the scissor test.
  const area = visibleArea(FOV, CAMERA_Z, size);
  const fit = Math.min(1, area.width / 8.2, area.height / 7.8);

  const attributes = useMemo(() => {
    const layouts = buildMorphLayouts(count);
    const rand = mulberry32(99);
    const randoms = Float32Array.from({ length: count }, () => rand());
    return { layouts, randoms };
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uStagger: { value: 0.35 },
      uTime: { value: 0 },
      uSize: { value: 55 },
      uPixelRatio: { value: dpr },
      uColorA: { value: new THREE.Color(palette.goldDark) },
      uColorB: { value: new THREE.Color(palette.goldLight) },
    }),
    [dpr],
  );

  useFrame((_, delta) => {
    const material = materialRef.current;
    const rig = rigRef.current;
    if (!activeRef.current || !material || !rig) return;
    const dt = Math.min(delta, 0.1);

    // Follow ScrollTrigger's progress with a little inertia (instant for reduced motion).
    const target = Math.min(STAGE_COUNT - 1, Math.max(0, scrollState.story));
    progress.current = reducedMotion ? target : damp(progress.current, target, 5, dt);
    material.uniforms.uProgress.value = progress.current;

    if (!reducedMotion) time.current += dt;
    material.uniforms.uTime.value = time.current;

    // Gentle sway + cursor parallax; never a full spin, so the bar chart and
    // grid always stay readable from the front.
    const sway = reducedMotion ? 0 : Math.sin(time.current * 0.2) * 0.3;
    rig.rotation.y = damp(rig.rotation.y, sway + pointer.x * 0.35, 3, dt);
    rig.rotation.x = damp(rig.rotation.x, -pointer.y * 0.15, 3, dt);
  });

  const { layouts, randoms } = attributes;

  return (
    <>
      <PerspectiveCamera makeDefault fov={FOV} position={[0, 0, CAMERA_Z]} />
      <group ref={rigRef} scale={fit}>
        <points frustumCulled={false} raycast={() => null}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[layouts[0], 3]} />
            <bufferAttribute attach="attributes-aP0" args={[layouts[0], 3]} />
            <bufferAttribute attach="attributes-aP1" args={[layouts[1], 3]} />
            <bufferAttribute attach="attributes-aP2" args={[layouts[2], 3]} />
            <bufferAttribute attach="attributes-aP3" args={[layouts[3], 3]} />
            <bufferAttribute attach="attributes-aP4" args={[layouts[4], 3]} />
            <bufferAttribute attach="attributes-aP5" args={[layouts[5], 3]} />
            <bufferAttribute attach="attributes-aRand" args={[randoms, 1]} />
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
      </group>
    </>
  );
}
