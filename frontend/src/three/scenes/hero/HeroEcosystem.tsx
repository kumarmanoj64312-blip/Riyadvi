"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { buildNetwork } from "@/three/utils/network";
import { visibleArea } from "@/three/utils/camera";
import { pointer } from "@/three/state/input";
import { StudioLighting } from "@/three/scenes/shared/StudioLighting";
import { Network } from "@/three/scenes/hero/Network";
import { DataPulses } from "@/three/scenes/hero/DataPulses";
import { CoreSphere } from "@/three/scenes/hero/CoreSphere";
import type { SceneProps } from "@/three/scenes/types";

/** Detail per device tier — the main performance lever for this scene. */
const DETAIL = {
  high: { nodes: 110, pulses: 70 },
  medium: { nodes: 64, pulses: 32 },
} as const;

const CAMERA_Z = 9;
const FOV = 40;
const { damp, clamp } = THREE.MathUtils;

/**
 * Home hero: the "digital ecosystem".
 *
 * Story: a business (metal core) at the centre of connected systems (gold
 * nodes + links) with data constantly flowing between them (pulses).
 *
 * Interaction:
 *  - Cursor / device tilt → parallax rotation (damped, so it feels weighty)
 *  - Hover a node → it and its connections light up (in <Network>)
 *  - Scroll → the network turns and the camera dives in as you leave the hero
 *  - Idle → slow drift (disabled for reduced motion)
 */
export default function HeroEcosystem({ activeRef, tier, reducedMotion }: SceneProps) {
  const detail = DETAIL[tier];
  const network = useMemo(() => buildNetwork(detail.nodes), [detail.nodes]);

  const rigRef = useRef<THREE.Group>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const spin = useRef(0);

  // The View is the hero's own square graphic box, so the network is simply
  // centred and scaled to fit it. `viewport` = visible area (world units) at
  // z = 0; the network is ~5.8 units across, plus a margin for rotation.
  const size = useThree((s) => s.size);
  const viewport = visibleArea(FOV, CAMERA_Z, size);
  const offset: [number, number, number] = [0, 0, 0];
  const scale = Math.min(viewport.width, viewport.height) / 6.6;

  useFrame((_, delta) => {
    const rig = rigRef.current;
    const camera = cameraRef.current;
    if (!activeRef.current || !rig || !camera) return;

    const dt = Math.min(delta, 0.1); // avoid a jump after a long frame
    // 0 at the top of the page → 1 once the hero has scrolled away.
    // Lenis smooths window scroll, so this value is already eased.
    const scroll = clamp(window.scrollY / window.innerHeight, 0, 1);

    if (!reducedMotion) spin.current += dt * 0.06;

    // damp() = frame-rate independent exponential smoothing toward a target.
    rig.rotation.y = damp(rig.rotation.y, spin.current + pointer.x * 0.35 + scroll * 1.4, 3, dt);
    rig.rotation.x = damp(rig.rotation.x, -pointer.y * 0.2 + scroll * 0.35, 3, dt);
    // Gentle dive on scroll — small enough that the network stays inside its box.
    camera.position.z = damp(camera.position.z, CAMERA_Z - scroll * 1, 3, dt);
  });

  return (
    <>
      <PerspectiveCamera makeDefault ref={cameraRef} fov={FOV} position={[0, 0, CAMERA_Z]} />
      <StudioLighting tier={tier} />

      <group position={offset} scale={scale}>
        <group ref={rigRef}>
          <CoreSphere activeRef={activeRef} reducedMotion={reducedMotion} tier={tier} />
          <Network network={network} reducedMotion={reducedMotion} />
          <DataPulses
            network={network}
            maxPulses={detail.pulses}
            activeRef={activeRef}
            reducedMotion={reducedMotion}
          />
        </group>
      </group>
    </>
  );
}
