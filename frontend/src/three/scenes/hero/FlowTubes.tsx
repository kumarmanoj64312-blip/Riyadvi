"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { GoldStudio } from "@/three/scenes/shared/GoldStudio";
import { mulberry32 } from "@/three/utils/network";
import { pointer } from "@/three/state/input";
import type { SceneProps } from "@/three/scenes/types";

const DETAIL = {
  high: { tubes: 8, tubular: 220, radial: 40 },
  medium: { tubes: 6, tubular: 140, radial: 20 },
} as const;
const INTRO_SECONDS = 2.2;
const { damp, clamp } = THREE.MathUtils;
const noRaycast = () => null;

/* Shared time uniform for every tube's patched shader. Module-level (one hero
   on the page) and written in useFrame: no React state involved. */
const uTime = { value: 0 };

/** Satin finishes, from deep bronze-black to warm gold: the tubes read as one family with depth. */
const FINISHES = [
  { color: "#2a1d0b", metalness: 0.75, roughness: 0.34 },
  { color: "#4a3412", metalness: 0.85, roughness: 0.28 },
  { color: "#1a140c", metalness: 0.6, roughness: 0.4 },
  { color: "#6b4c18", metalness: 0.9, roughness: 0.24 },
];

type Tube = { geometry: THREE.TubeGeometry; finish: (typeof FINISHES)[number]; phase: number };

/**
 * One smooth, wandering path across (and beyond) the frame. Half the tubes run
 * mostly sideways, half loop more vertically, so the composition works on a
 * wide desktop stage and a tall phone stage alike. Seeded → identical every load.
 */
function makeTube(i: number, d: (typeof DETAIL)[keyof typeof DETAIL], rand: () => number): Tube {
  const sideways = i % 2 === 0;
  const pts: THREE.Vector3[] = [];
  const n = 6;
  for (let k = 0; k < n; k++) {
    const t = k / (n - 1);
    const along = -11 + t * 22; // run past both edges
    const across = (rand() - 0.5) * 9;
    const depth = -8.5 + rand() * 5.8; // well behind the copy plane: the centre stays calm
    pts.push(
      sideways ? new THREE.Vector3(along, across * 0.75, depth) : new THREE.Vector3(across * 1.3, along * 0.55, depth),
    );
  }
  const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.6);
  const radius = 0.32 + rand() * 0.5;
  return {
    geometry: new THREE.TubeGeometry(curve, d.tubular, radius, d.radial, false),
    finish: FINISHES[i % FINISHES.length],
    phase: rand() * Math.PI * 2,
  };
}

/** Slow undulation along each tube, added in the vertex shader (one uniform per frame). */
function undulate(phase: number) {
  return (shader: THREE.WebGLProgramParametersWithUniforms) => {
    shader.uniforms.uTime = uTime;
    shader.uniforms.uPhase = { value: phase };
    shader.vertexShader = "uniform float uTime;\nuniform float uPhase;\n" + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      /* glsl */ `
      vec3 transformed = vec3(position);
      float w = uTime * 0.32 + position.x * 0.28 + position.y * 0.18 + uPhase;
      transformed.y += sin(w) * 0.32;
      transformed.z += cos(w * 0.8) * 0.28;
      `,
    );
  };
}

/**
 * Home hero: "flowing gold". Thick satin tubes in bronze-to-gold finishes
 * wind through the dark behind the headline, lit by the gold studio, so
 * highlights travel along them as they move. Fog fades the far tubes into
 * black, giving the soft depth of field of a product film.
 *
 *  - Entrance: each tube grows along its length (draw range), staggered.
 *  - Idle: the tubes undulate slowly (vertex shader).
 *  - Pointer: gentle camera parallax. Scroll: the camera dollies in and the
 *    composition turns.
 *  - Reduced motion: no growth or undulation; parallax still responds.
 */
export default function FlowTubes({ activeRef, reducedMotion, tier }: SceneProps) {
  const detail = DETAIL[tier];
  const tubes = useMemo(() => {
    const rand = mulberry32(17);
    return Array.from({ length: detail.tubes }, (_, i) => makeTube(i, detail, rand));
  }, [detail]);
  useEffect(() => () => tubes.forEach((t) => t.geometry.dispose()), [tubes]);

  const patches = useMemo(() => tubes.map((t) => undulate(t.phase)), [tubes]);

  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const groupRef = useRef<THREE.Group>(null);
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const sim = useRef({ intro: reducedMotion ? 1 : 0, scroll: 0, time: 0 });

  // Phones (tall stage): pull the camera back a little so the tubes don't feel cramped.
  const size = useThree((s) => s.size);
  const baseZ = size.width / Math.max(1, size.height) < 1 ? 12 : 10;

  useLayoutEffect(() => {
    if (reducedMotion) return;
    meshRefs.current.forEach((m) => m?.geometry.setDrawRange(0, 0));
  }, [reducedMotion, tubes]);

  useFrame((_, delta) => {
    const cam = cameraRef.current;
    const group = groupRef.current;
    if (!activeRef.current || !cam || !group) return;
    const dt = Math.min(delta, 0.1);
    const s = sim.current;
    if (!reducedMotion) s.time += dt;
    uTime.value = s.time;

    // Entrance: grow each tube along its length, one after another.
    if (s.intro < 1) {
      s.intro = Math.min(1, s.intro + dt / INTRO_SECONDS);
      meshRefs.current.forEach((m, i) => {
        if (!m) return;
        const k = clamp(s.intro * 1.8 - i * 0.08, 0, 1);
        const eased = 1 - Math.pow(1 - k, 3);
        const total = m.geometry.index?.count ?? 0;
        m.geometry.setDrawRange(0, Math.floor((total * eased) / 6) * 6);
      });
    }

    s.scroll = damp(s.scroll, clamp(window.scrollY / window.innerHeight, 0, 1), 4, dt);
    cam.position.x = damp(cam.position.x, pointer.x * 0.7, 2.5, dt);
    cam.position.y = damp(cam.position.y, pointer.y * 0.45, 2.5, dt);
    cam.position.z = damp(cam.position.z, baseZ - s.scroll * 3, 3, dt);
    cam.lookAt(0, 0, -3);
    group.rotation.z = damp(group.rotation.z, s.scroll * 0.25, 3, dt);
  });

  return (
    <>
      <PerspectiveCamera makeDefault ref={cameraRef} fov={45} position={[0, 0, baseZ]} />
      {/* Fog = depth of field on a budget: far tubes melt into the black page. */}
      <fog attach="fog" args={["#050505", baseZ - 2, baseZ + 9]} />
      <GoldStudio tier={tier} />
      <directionalLight position={[-6, 4, 4]} intensity={1.4} color="#ffd98a" />

      <group ref={groupRef}>
        {tubes.map((t, i) => (
          <mesh key={i} ref={(el) => void (meshRefs.current[i] = el)} geometry={t.geometry} raycast={noRaycast}>
            <meshPhysicalMaterial
              {...t.finish}
              clearcoat={0.6}
              clearcoatRoughness={0.25}
              sheen={0.6}
              sheenColor="#d4af37"
              sheenRoughness={0.4}
              envMapIntensity={1.2}
              onBeforeCompile={patches[i]}
              // Own program key per phase-patched material, so variants never share a stale program.
              customProgramCacheKey={() => `flow-tube-${i}`}
            />
          </mesh>
        ))}
      </group>
    </>
  );
}
