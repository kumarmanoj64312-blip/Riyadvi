"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { PerspectiveCamera, RoundedBox } from "@react-three/drei";
import { GoldStudio } from "@/three/scenes/shared/GoldStudio";
import { Particles } from "@/three/scenes/hero/Particles";
import { GroundShadow } from "@/three/scenes/hero/GroundShadow";
import { LightVortex } from "@/three/scenes/hero/LightVortex";
import { createScreenTexture } from "@/three/utils/screenTexture";
import { pointer } from "@/three/state/input";
import { palette } from "@/lib/theme";
import type { SceneProps } from "@/three/scenes/types";

const { damp, clamp } = THREE.MathUtils;
const noRaycast = () => null;
const HOLD = 4.2; // seconds each screen stays before the next one
const INTRO = 1.6;

type Kind = "laptop" | "tablet" | "phone";

/**
 * Resting pose of each device in the square hero box, plus:
 *  depth – how strongly it follows the pointer (nearer = more = parallax)
 *  fan   – where it drifts to as the visitor scrolls (devices fan apart)
 */
const POSES: Record<
  Kind,
  { pos: [number, number, number]; rot: [number, number, number]; depth: number; fan: [number, number] }
> = {
  laptop: { pos: [-0.05, 0.5, -0.95], rot: [0.18, 0.32, 0], depth: 0.5, fan: [0, 0.6] },
  tablet: { pos: [-1.85, -1.3, 1.1], rot: [-0.12, 0.55, 0.1], depth: 0.8, fan: [-0.45, -0.35] },
  phone: { pos: [1.9, -0.7, 1.35], rot: [0.08, -0.5, -0.07], depth: 1.1, fan: [0.45, -0.3] },
};

/** Titanium-black body with polished-gold trim: reads as premium hardware. */
const BODY = { color: "#16130e", metalness: 0.85, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.15 } as const;
const TRIM = { color: "#e8c063", metalness: 1, roughness: 0.18 } as const;

type ScreenSet = { kind: Kind; client: string; accent: string; screens: string[] };

/**
 * Home hero: "floating devices". A laptop, tablet and phone drift in a
 * gold-lit studio, each showing a real Riyadvi project's screens (generated
 * from project data), which says "web & app development" at a glance.
 *
 *  - Entrance: devices rise into place one after another.
 *  - Idle: each floats on its own rhythm; screens cycle with a crossfade.
 *  - Pointer: layered depth parallax (nearer devices move more).
 *  - Hover a device: it comes forward and turns to face the viewer.
 *  - Scroll: the devices fan apart.
 *  - Reduced motion: no float/cycling; pointer and hover still respond.
 */
export default function FloatingDevices({ activeRef, reducedMotion, tier, params }: SceneProps) {
  // Which project shows on which device (from the page; sensible defaults otherwise).
  const sets: ScreenSet[] = useMemo(() => {
    const list = params.projects ?? [];
    const pick = (i: number, kind: Kind): ScreenSet => {
      const p = list[i % Math.max(1, list.length)];
      return {
        kind,
        client: p?.client ?? "Riyadvi",
        accent: p?.accent ?? palette.gold,
        screens: p?.screens?.length ? p.screens : [p?.screen ?? "Home"],
      };
    };
    return [pick(0, "laptop"), pick(1, "tablet"), pick(2, "phone")];
  }, [params.projects]);

  // One texture per screen, generated once (phone screens are portrait).
  const textures = useMemo(
    () =>
      sets.map((s) =>
        s.screens.map((label, i) =>
          createScreenTexture(
            { client: s.client, accent: s.accent, label, index: i },
            s.kind === "phone" ? "phone" : "laptop",
          ),
        ),
      ),
    [sets],
  );
  useEffect(() => () => textures.flat().forEach((t) => t.dispose()), [textures]);

  const groupRefs = useRef<(THREE.Group | null)[]>([]);
  // Full-bleed stage: size and place the arrangement from the stage's shape, so it
  // fits a wide desktop hero and a tall phone hero alike (below the centred headline).
  const size = useThree((st) => st.size);
  const aspect = size.width / Math.max(1, size.height);
  const fit = clamp(aspect * 0.46, 0.36, 0.64);
  const stageY = aspect < 1 ? -1.9 : -1.55;
  const swirl = clamp(aspect * 0.55, 0.5, 0.95);
  const swirlSpeed = useRef(0);
  const baseMats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const overMats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const sim = useRef({
    t: 0,
    intro: reducedMotion ? 1 : 0,
    scroll: 0,
    hovered: -1,
    focus: [0, 0, 0],
    cycle: sets.map((_, i) => ({ current: 0, next: -1, fade: 0, timer: -i * 1.4 })), // staggered
  });

  useFrame((_, delta) => {
    if (!activeRef.current) return;
    const dt = Math.min(delta, 0.1);
    const s = sim.current;
    if (!reducedMotion) s.t += dt;
    if (s.intro < 1) s.intro = Math.min(1, s.intro + dt / INTRO);
    s.scroll = damp(s.scroll, clamp(window.scrollY / window.innerHeight, 0, 1), 4, dt);
    swirlSpeed.current = s.scroll * 3; // scrolling whips the light rivers faster

    sets.forEach((set, i) => {
      const g = groupRefs.current[i];
      if (!g) return;
      const pose = POSES[set.kind];

      // Entrance: each device rises in a little after the previous one.
      const k = clamp((s.intro * 1.6 - i * 0.25) / 1, 0, 1);
      const rise = 1 - Math.pow(1 - k, 3);

      // Hover focus: come forward and square up to the camera.
      s.focus[i] = damp(s.focus[i], s.hovered === i ? 1 : 0, 6, dt);
      const f = s.focus[i];

      const float = reducedMotion ? 0 : Math.sin(s.t * 0.9 + i * 2.1) * 0.08;
      g.position.set(
        pose.pos[0] + pose.fan[0] * s.scroll + pointer.x * 0.25 * pose.depth,
        pose.pos[1] + float + pose.fan[1] * s.scroll + pointer.y * 0.15 * pose.depth - (1 - rise) * 2.5,
        pose.pos[2] + f * 0.6,
      );
      g.rotation.set(
        damp(g.rotation.x, pose.rot[0] * (1 - f) - pointer.y * 0.12 * pose.depth, 5, dt),
        damp(g.rotation.y, pose.rot[1] * (1 - f) + pointer.x * 0.18 * pose.depth + s.scroll * 0.25 * (i - 1), 5, dt),
        damp(g.rotation.z, pose.rot[2] * (1 - f), 5, dt),
      );
      g.scale.setScalar(Math.max(0.001, rise) * (1 + f * 0.08));

      // Screen cycling with a crossfade (base plane + overlay plane).
      const c = s.cycle[i];
      const list = textures[i];
      const base = baseMats.current[i];
      const over = overMats.current[i];
      if (!base || !over || list.length < 2) return;
      if (!reducedMotion) c.timer += dt;
      if (c.next === -1 && c.timer > HOLD) {
        c.next = (c.current + 1) % list.length;
        c.fade = 0;
        c.timer = 0;
        over.map = list[c.next];
      }
      if (c.next !== -1) {
        c.fade = Math.min(1, c.fade + dt * 2);
        over.opacity = c.fade;
        if (c.fade >= 1) {
          c.current = c.next;
          c.next = -1;
          base.map = list[c.current];
          over.opacity = 0;
        }
      }
    });
  });

  const hover = (i: number) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    sim.current.hovered = i;
  };
  const unhover = (i: number) => () => {
    if (sim.current.hovered === i) sim.current.hovered = -1;
  };

  /** Screen = base plane + crossfade overlay plane, both unlit (screens emit light). */
  const screen = (i: number, w: number, h: number) => (
    <>
      <mesh raycast={noRaycast}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial ref={(m) => void (baseMats.current[i] = m)} map={textures[i][0]} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.002]} raycast={noRaycast}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial
          ref={(m) => void (overMats.current[i] = m)}
          map={textures[i][0]}
          transparent
          opacity={0}
          toneMapped={false}
        />
      </mesh>
      {/* Glass sheen */}
      <mesh position={[0, 0, 0.004]} raycast={noRaycast}>
        <planeGeometry args={[w, h]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.05}
          roughness={0.05}
          clearcoat={1}
          depthWrite={false}
        />
      </mesh>
    </>
  );

  const device = (set: ScreenSet, i: number) => {
    if (set.kind === "laptop") {
      return (
        <group>
          {/* Base + keyboard well + gold front lip */}
          <RoundedBox args={[3.1, 0.09, 2.05]} radius={0.04} smoothness={3} position={[0, -1.0, 0.55]}>
            <meshPhysicalMaterial {...BODY} />
          </RoundedBox>
          <mesh position={[0, -0.952, 0.5]} rotation={[-Math.PI / 2, 0, 0]} raycast={noRaycast}>
            <planeGeometry args={[2.7, 1.25]} />
            <meshStandardMaterial color="#0b0a08" roughness={0.8} />
          </mesh>
          <mesh position={[0, -1.0, 1.58]} raycast={noRaycast}>
            <boxGeometry args={[3.0, 0.02, 0.01]} />
            <meshStandardMaterial {...TRIM} />
          </mesh>
          {/* Lid hinged at the back edge */}
          <group position={[0, -0.97, -0.47]} rotation={[-0.12, 0, 0]}>
            <RoundedBox args={[3.1, 2.0, 0.06]} radius={0.05} smoothness={3} position={[0, 1.0, 0]}>
              <meshPhysicalMaterial {...BODY} />
            </RoundedBox>
            <group position={[0, 1.0, 0.032]}>{screen(i, 2.86, 1.79)}</group>
          </group>
        </group>
      );
    }
    if (set.kind === "tablet") {
      return (
        <group>
          <RoundedBox args={[2.3, 1.6, 0.07]} radius={0.1} smoothness={4}>
            <meshPhysicalMaterial {...BODY} />
          </RoundedBox>
          <mesh position={[0, 0, -0.036]} raycast={noRaycast}>
            <planeGeometry args={[2.32, 1.62]} />
            <meshStandardMaterial {...TRIM} />
          </mesh>
          <group position={[0, 0, 0.037]}>{screen(i, 2.12, 1.33)}</group>
        </group>
      );
    }
    return (
      <group>
        <RoundedBox args={[0.98, 2.0, 0.09]} radius={0.13} smoothness={4}>
          <meshPhysicalMaterial {...BODY} />
        </RoundedBox>
        {/* Polished gold frame edge */}
        <RoundedBox args={[1.0, 2.02, 0.05]} radius={0.13} smoothness={4} position={[0, 0, -0.01]}>
          <meshStandardMaterial {...TRIM} />
        </RoundedBox>
        <group position={[0, 0, 0.047]}>{screen(i, 0.88, 1.88)}</group>
      </group>
    );
  };

  // Invisible hover targets sized to each device.
  const hit: Record<Kind, [number, number, number]> = {
    laptop: [3.2, 2.4, 1.2],
    tablet: [2.4, 1.7, 0.4],
    phone: [1.1, 2.1, 0.4],
  };

  return (
    <>
      <PerspectiveCamera makeDefault fov={36} position={[0, 0, 10.6]} />
      <GoldStudio tier={tier} />
      <Particles count={tier === "high" ? 220 : 90} activeRef={activeRef} reducedMotion={reducedMotion} />
      <group position={[0, stageY, 0]}>
        {/* Rivers of light swirling around the devices (two tilted bands) */}
        {/* Slightly below the devices' centre, so the back of the orbit clears the CTAs above. */}
        <group scale={swirl} position={[0, -0.4, 0]}>
          <LightVortex
            count={tier === "high" ? 1100 : 420}
            radius={4.2}
            spread={0.28}
            rotation={[0.3, 0, -0.1]}
            seed={21}
            activeRef={activeRef}
            reducedMotion={reducedMotion}
            speedRef={swirlSpeed}
          />
          <LightVortex
            count={tier === "high" ? 700 : 260}
            radius={3.2}
            spread={0.2}
            rotation={[0.2, 0.4, 0.16]}
            seed={42}
            activeRef={activeRef}
            reducedMotion={reducedMotion}
            speedRef={swirlSpeed}
          />
        </group>
        <group scale={fit}>
          <GroundShadow y={-2.9} />
        </group>
      </group>

      <group position={[0, stageY, 0]} scale={fit}>
        {sets.map((set, i) => (
          <group key={set.kind} ref={(el) => void (groupRefs.current[i] = el)} scale={0.001}>
            {device(set, i)}
            <mesh onPointerOver={hover(i)} onPointerOut={unhover(i)}>
              <boxGeometry args={hit[set.kind]} />
              <meshBasicMaterial visible={false} />
            </mesh>
          </group>
        ))}
      </group>
    </>
  );
}
