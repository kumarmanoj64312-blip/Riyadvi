"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { PerspectiveCamera, RoundedBox } from "@react-three/drei";
import { GoldStudio } from "@/three/scenes/shared/GoldStudio";
import { GroundShadow } from "@/three/scenes/hero/GroundShadow";
import { createScreenTexture } from "@/three/utils/screenTexture";
import { workState } from "@/three/state/work";
import { palette } from "@/lib/theme";
import type { SceneProps } from "@/three/scenes/types";

/** Phone proportions (screen textures for phones are 1:2). */
const PHONE_W = 1.05;
const PHONE_H = 2.2;
/** Angle between neighbouring phones along the arc, and the arc radius. */
const STEP = 0.34;
const RADIUS = 6.2;
/** Resting lean of every phone (the "row of cans" look); the spotlit one stands up. */
const LEAN = -0.32;
const { damp, clamp } = THREE.MathUtils;
const noRaycast = () => null;
const DIM = new THREE.Color(0.22, 0.22, 0.22);
const FULL = new THREE.Color(1, 1, 1);

/** Titanium-black body with polished-gold trim (same family as the hero devices). */
const BODY = { color: "#16130e", metalness: 0.85, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12 } as const;
const TRIM = { color: "#e8c063", metalness: 1, roughness: 0.18 } as const;

/**
 * Home › Selected work, styled like a product-launch carousel: every case
 * study is a gold-trimmed phone showing its project's screen, standing in a
 * curved row and leaning at the same angle.
 *
 *  - The project in the spotlight (centre) straightens up, grows, lights up and
 *    steps forward; a gold halo ring floats above it and it stands on a podium.
 *  - Scrolling (workState.progress from the pinned section) rolls the row
 *    right → left, settling each project into the spotlight in turn. The row
 *    loops, so there are always projects on both sides of the spotlight.
 *  - Clicking the spotlit phone opens its case study. Pointer tilt + an idle
 *    float add life; reduced motion keeps everything still except user input.
 */
export default function WorkRing({ activeRef, localPointer, reducedMotion, tier, params }: SceneProps) {
  const projects = useMemo(() => params.projects ?? [], [params.projects]);
  const n = projects.length;

  const textures = useMemo(
    () =>
      projects.map((p, i) =>
        createScreenTexture({ client: p.client, accent: p.accent, label: p.screen, index: i }, "phone"),
      ),
    [projects],
  );
  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures]);

  const rowRef = useRef<THREE.Group>(null);
  const tiltRef = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const phoneRefs = useRef<(THREE.Group | null)[]>([]);
  const pivotRefs = useRef<(THREE.Group | null)[]>([]);
  const current = useRef(0); // smoothed index of the project in the spotlight
  const screenMats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const spot = useRef(new Float32Array(n)); // 0..1 "how much in the spotlight" per phone
  const t = useRef(0);

  // Narrow stages (tablets) show fewer phones: scale the whole set to fit.
  const size = useThree((s) => s.size);
  const fit = clamp(size.width / size.height / 1.9, 0.6, 1);

  useFrame((_, delta) => {
    const row = rowRef.current;
    const tilt = tiltRef.current;
    if (!activeRef.current || !row || !tilt) return;
    const dt = Math.min(delta, 0.1);
    if (!reducedMotion) t.current += dt;

    // Scroll progress → nearest project; the row glides there and settles.
    current.current = damp(current.current, Math.round(workState.progress * (n - 1)), 3.5, dt);

    tilt.rotation.x = damp(tilt.rotation.x, -localPointer.current.y * 0.05, 3, dt);
    tilt.rotation.y = damp(tilt.rotation.y, localPointer.current.x * 0.08, 3, dt);
    if (haloRef.current && !reducedMotion) haloRef.current.rotation.z += dt * 0.4;

    for (let i = 0; i < n; i++) {
      const phone = phoneRefs.current[i];
      const pivot = pivotRefs.current[i];
      const mat = screenMats.current[i];
      if (!phone || !pivot || !mat) continue;
      // The row LOOPS: each phone's offset from the spotlight wraps into (-n/2, n/2], so the
      // spotlit project always has neighbours on BOTH sides (no empty left side at the start).
      // The one phone crossing the back (|d| ≥ n/2 - 0.5) is hidden while it jumps sides.
      let d = (((i - current.current) % n) + n) % n;
      if (d > n / 2) d -= n;
      const a = d * STEP; // angle from the centre line (0 = spotlight; next project waits on the right)
      pivot.rotation.y = a;
      phone.visible = Math.abs(d) < n / 2 - 0.5;
      const f = clamp(1 - Math.abs(a) / STEP, 0, 1); // 1 only for the phone in the spotlight
      spot.current[i] = f;
      const float = reducedMotion ? 0 : Math.sin(t.current * 1.1 + i * 1.7) * 0.05;
      phone.position.set(0, float + f * 0.15, RADIUS + f * 0.9);
      phone.rotation.set(0, -Math.sin(a) * 0.5, LEAN * (1 - f));
      phone.scale.setScalar(0.9 + f * 0.3);
      mat.color.copy(DIM).lerp(FULL, 0.3 + f * 0.7);
    }
  });

  const onClick = (i: number) => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (spot.current[i] > 0.6) workState.onOpen?.(projects[i].slug);
  };
  const onOver = (i: number) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = spot.current[i] > 0.6 ? "pointer" : "";
  };
  const onOut = () => {
    document.body.style.cursor = "";
  };

  const front = RADIUS + 0.9; // where the spotlit phone stands

  return (
    <>
      <PerspectiveCamera makeDefault fov={32} position={[0, 0.5, RADIUS + 10.5]} rotation={[-0.06, 0, 0]} />
      <GoldStudio tier={tier} />

      <group scale={fit}>
        <group ref={tiltRef}>
          {/* Spotlight furniture: halo ring above, podium below (fixed at the centre) */}
          <mesh ref={haloRef} position={[0, 1.95, front]} rotation={[Math.PI / 2 - 0.25, 0, 0]} raycast={noRaycast}>
            <torusGeometry args={[0.62, 0.035, 16, 96]} />
            <meshStandardMaterial
              color={palette.goldLight}
              emissive={palette.gold}
              emissiveIntensity={1.4}
              metalness={1}
              roughness={0.2}
              toneMapped={false}
            />
          </mesh>
          <group position={[0, -1.55, front]}>
            <mesh raycast={noRaycast}>
              <cylinderGeometry args={[1.0, 1.08, 0.18, 64]} />
              <meshPhysicalMaterial color="#0e0c09" metalness={0.8} roughness={0.35} clearcoat={1} />
            </mesh>
            <mesh position={[0, 0.092, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={noRaycast}>
              <ringGeometry args={[0.92, 1.0, 96]} />
              <meshBasicMaterial color={palette.gold} toneMapped={false} />
            </mesh>
          </group>
          <group position={[0, 0, front - 1]}>
            <GroundShadow y={-1.85} />
          </group>

          {/* The row of phones on an arc (pivot at the arc centre, phone at +z) */}
          <group ref={rowRef}>
            {projects.map((p, i) => (
              <group key={p.slug} ref={(el) => void (pivotRefs.current[i] = el)}>
                <group ref={(el) => void (phoneRefs.current[i] = el)} position={[0, 0, RADIUS]}>
                  <RoundedBox args={[PHONE_W, PHONE_H, 0.1]} radius={0.14} smoothness={4}>
                    <meshPhysicalMaterial {...BODY} />
                  </RoundedBox>
                  <RoundedBox
                    args={[PHONE_W + 0.03, PHONE_H + 0.03, 0.06]}
                    radius={0.15}
                    smoothness={4}
                    position={[0, 0, -0.01]}
                  >
                    <meshStandardMaterial {...TRIM} />
                  </RoundedBox>
                  <mesh position={[0, 0, 0.052]} onClick={onClick(i)} onPointerOver={onOver(i)} onPointerOut={onOut}>
                    <planeGeometry args={[PHONE_W - 0.1, PHONE_H - 0.12]} />
                    <meshBasicMaterial
                      ref={(m) => void (screenMats.current[i] = m)}
                      map={textures[i]}
                      toneMapped={false}
                    />
                  </mesh>
                  {/* Glass sheen */}
                  <mesh position={[0, 0, 0.056]} raycast={noRaycast}>
                    <planeGeometry args={[PHONE_W - 0.1, PHONE_H - 0.12]} />
                    <meshPhysicalMaterial
                      color="#ffffff"
                      transparent
                      opacity={0.06}
                      roughness={0.05}
                      clearcoat={1}
                      depthWrite={false}
                    />
                  </mesh>
                </group>
              </group>
            ))}
          </group>
        </group>
      </group>
    </>
  );
}
