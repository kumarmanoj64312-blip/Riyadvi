"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { StudioLighting } from "@/three/scenes/shared/StudioLighting";
import { useDragRotate } from "@/three/hooks/useDragRotate";
import { visibleArea } from "@/three/utils/camera";
import { constellation } from "@/three/state/constellation";
import { looks } from "@/three/scenes/services/shared";
import type { SceneProps } from "@/three/scenes/types";
import { palette } from "@/lib/theme";

const FOV = 40;
const CAMERA_Z = 8;
const _world = new THREE.Vector3();
const { damp } = THREE.MathUtils;

/** Ring geometry: radius, tilt (so orbits cross like an atom) and spin speed. */
const RINGS = [
  { radius: 1.7, tilt: [0.45, 0, 0.1] as const, speed: 0.22 },
  { radius: 2.6, tilt: [-0.3, 0, -0.35] as const, speed: -0.15 },
  { radius: 3.5, tilt: [0.2, 0, 0.45] as const, speed: 0.1 },
];

/**
 * Technology ecosystem: technologies orbit a central core on three rings —
 * experience (inner), engine (middle), reach & delivery (outer).
 *
 * - Hovering a technology (its DOM label or the legend) pauses its ring and
 *   enlarges its node.
 * - Drag anywhere to rotate the whole system (inertia, then slow idle spin).
 * - Labels are real DOM elements; every frame each node is projected to
 *   screen space and its label is moved there (crisp text, accessible).
 */
export default function TechConstellation({ activeRef, reducedMotion, tier, params }: SceneProps) {
  const techs = useMemo(() => params.technologies ?? [], [params.technologies]);
  const systemRef = useRef<THREE.Group>(null);
  const spinRefs = useRef<(THREE.Group | null)[]>([]);
  const nodeRefs = useRef(new Map<string, THREE.Mesh>());
  const ringSpeeds = useRef(RINGS.map((r) => r.speed));
  const drag = useDragRotate({ enabled: true, initialTilt: 0.42 }); // view from slightly above: orbits open up

  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const area = visibleArea(FOV, CAMERA_Z, size);
  // Outer ring is 7 units across; the tilt flattens it vertically, so height can be tighter.
  const fit = Math.min(1.1, area.width / 7.6, area.height / 6.4);

  // Node positions on each ring (evenly spaced, offset per ring so they don't line up).
  const layout = useMemo(() => {
    return techs.map((t) => {
      const siblings = techs.filter((o) => o.ring === t.ring);
      const i = siblings.indexOf(t);
      const angle = (i / siblings.length) * Math.PI * 2 + t.ring * 0.7;
      const r = RINGS[t.ring].radius;
      return { ...t, position: [Math.cos(angle) * r, 0, Math.sin(angle) * r] as [number, number, number] };
    });
  }, [techs]);

  // Hide labels again if the scene unmounts (e.g. WebGL lost → fallback).
  useEffect(
    () => () =>
      constellation.labels.forEach((el) => {
        el.removeAttribute("data-placed");
        el.style.opacity = "";
      }),
    [],
  );

  useFrame((_, delta) => {
    const system = systemRef.current;
    if (!activeRef.current || !system) return;
    const dt = Math.min(delta, 0.1);

    // Whole-system rotation: drag + inertia, gentle idle spin.
    const s = drag.step(dt, { spin: reducedMotion ? 0 : 0.04 });
    system.rotation.set(s.rotX, s.rotY, 0);

    // Each ring orbits at its own speed; the hovered ring eases to a stop.
    RINGS.forEach((ring, i) => {
      const target = reducedMotion || constellation.hoveredRing === i ? 0 : ring.speed;
      ringSpeeds.current[i] = damp(ringSpeeds.current[i], target, 4, dt);
      const spin = spinRefs.current[i];
      if (spin) spin.rotation.y += ringSpeeds.current[i] * dt;
    });

    // Project nodes → move DOM labels; dim labels on the far side.
    for (const t of layout) {
      const node = nodeRefs.current.get(t.slug);
      const label = constellation.labels.get(t.slug);
      if (!node) continue;
      const hovered = constellation.hovered === t.slug;
      node.scale.setScalar(damp(node.scale.x, hovered ? 1.9 : 1, 8, dt));
      if (!label) continue;

      node.getWorldPosition(_world);
      const depth = _world.z; // > 0 → in front of the core
      _world.project(camera);
      const x = (_world.x * 0.5 + 0.5) * size.width;
      const y = (-_world.y * 0.5 + 0.5) * size.height;
      label.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -150%)`;
      // Narrow screens: only label the front half (back labels would pile up;
      // the full list is always in the legend below the scene).
      const behind = depth <= -0.4;
      label.style.opacity = hovered ? "1" : behind ? (size.width < 640 ? "0" : "0.35") : "0.95";
      label.style.zIndex = depth > 0 ? "2" : "1";
      if (!label.dataset.placed) label.dataset.placed = "true";
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault fov={FOV} position={[0, 0, CAMERA_Z]} />
      <StudioLighting tier={tier} />

      <group scale={fit}>
        <group ref={systemRef}>
          {/* Core: Riyadvi at the centre of its technology ecosystem */}
          <mesh raycast={() => null}>
            <icosahedronGeometry args={[0.55, 1]} />
            <meshStandardMaterial {...looks.gold} flatShading />
          </mesh>

          {RINGS.map((ring, i) => (
            <group key={i} rotation={[...ring.tilt]}>
              {/* Orbit path */}
              <mesh rotation={[Math.PI / 2, 0, 0]} raycast={() => null}>
                <torusGeometry args={[ring.radius, 0.006, 6, 180]} />
                <meshBasicMaterial color={palette.goldDark} transparent opacity={0.45} toneMapped={false} />
              </mesh>
              {/* Spinning carrier with this ring's technology nodes */}
              <group ref={(el) => void (spinRefs.current[i] = el)}>
                {layout
                  .filter((t) => t.ring === i)
                  .map((t) => (
                    <mesh
                      key={t.slug}
                      position={t.position}
                      ref={(el) => {
                        if (el) nodeRefs.current.set(t.slug, el);
                        else nodeRefs.current.delete(t.slug);
                      }}
                      raycast={() => null}
                    >
                      <sphereGeometry args={[0.1, 20, 20]} />
                      <meshStandardMaterial color={palette.goldLight} emissive={palette.gold} emissiveIntensity={0.6} metalness={0.6} roughness={0.3} />
                    </mesh>
                  ))}
              </group>
            </group>
          ))}
        </group>

        {/* Invisible drag surface */}
        <mesh {...drag.handlers}>
          <sphereGeometry args={[4, 16, 16]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      </group>
    </>
  );
}
