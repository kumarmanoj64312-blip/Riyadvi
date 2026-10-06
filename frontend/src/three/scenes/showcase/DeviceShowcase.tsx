"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, RoundedBox } from "@react-three/drei";
import { StudioLighting } from "@/three/scenes/shared/StudioLighting";
import { useDragRotate } from "@/three/hooks/useDragRotate";
import { createScreenTexture } from "@/three/utils/screenTexture";
import { visibleArea } from "@/three/utils/camera";
import { looks } from "@/three/scenes/services/shared";
import type { SceneProps } from "@/three/scenes/types";
import { palette } from "@/lib/theme";

const FOV = 35;
const CAMERA_Z = 7;
const HOLD_SECONDS = 3.5; // how long each screen stays before auto-advancing
const noRaycast = () => null;

/** Screen plane size + placement for each device (world units). */
const DEVICES = {
  phone: { screen: [1.03, 2.22] as const, fit: (a: { width: number; height: number }) => Math.min(1.3, a.height / 3, a.width / 2.2) },
  laptop: { screen: [3.0, 1.875] as const, fit: (a: { width: number; height: number }) => Math.min(1.1, a.width / 4.8, a.height / 4.3) },
};

/**
 * Interactive case-study presentation: a phone or laptop (primitives only —
 * no GLB to download) showing the project's screens.
 *  - screens crossfade automatically; click/tap the device to advance
 *  - drag to rotate with inertia; it eases back to face you afterwards
 * Screen images are generated CanvasTextures (see utils/screenTexture).
 */
export default function DeviceShowcase({ activeRef, reducedMotion, tier, params }: SceneProps) {
  const show = params.showcase;
  const device = show?.device ?? "phone";
  const cfg = DEVICES[device];

  const groupRef = useRef<THREE.Group>(null);
  const baseMat = useRef<THREE.MeshBasicMaterial>(null);
  const overMat = useRef<THREE.MeshBasicMaterial>(null);
  const cycle = useRef({ current: 0, next: -1, fade: 0, timer: 0, clock: 0 });

  // One texture per screen, generated once and disposed on unmount.
  const textures = useMemo(
    () =>
      (show?.screens ?? ["Home"]).map((label, index) =>
        createScreenTexture({ client: show?.client ?? "", accent: show?.accent ?? palette.gold, label, index }, device),
      ),
    [show, device],
  );
  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures]);

  const advance = () => {
    const c = cycle.current;
    if (textures.length < 2 || c.next !== -1) return;
    c.next = (c.current + 1) % textures.length;
    c.fade = 0;
    c.timer = 0;
    if (overMat.current) overMat.current.map = textures[c.next];
  };

  const drag = useDragRotate({ enabled: true, onTap: advance, initialTilt: device === "laptop" ? 0.25 : 0.1 });

  const size = useThree((s) => s.size);
  const fit = cfg.fit(visibleArea(FOV, CAMERA_Z, size));

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!activeRef.current || !group) return;
    const dt = Math.min(delta, 0.1);
    const c = cycle.current;
    c.clock += dt;

    // Rotation: drag + inertia, then ease back to a gentle sway.
    const sway = reducedMotion ? -0.25 : -0.25 + Math.sin(c.clock * 0.5) * 0.3;
    const s = drag.step(dt, { swayTarget: sway });
    group.rotation.set(s.rotX, s.rotY, 0);

    // Screen cycling (crossfade the overlay plane, then swap).
    if (!reducedMotion) c.timer += dt;
    if (c.timer > HOLD_SECONDS) advance();
    if (c.next !== -1 && overMat.current && baseMat.current) {
      c.fade = Math.min(1, c.fade + dt * (reducedMotion ? 10 : 2.5));
      overMat.current.opacity = c.fade;
      if (c.fade >= 1) {
        c.current = c.next;
        c.next = -1;
        baseMat.current.map = textures[c.current];
        overMat.current.opacity = 0;
      }
    }
  });

  const [sw, sh] = cfg.screen;
  const screenPlanes = (
    <>
      <mesh raycast={noRaycast}>
        <planeGeometry args={[sw, sh]} />
        <meshBasicMaterial ref={baseMat} map={textures[0]} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.002]} raycast={noRaycast}>
        <planeGeometry args={[sw, sh]} />
        <meshBasicMaterial ref={overMat} map={textures[0]} transparent opacity={0} toneMapped={false} />
      </mesh>
    </>
  );

  return (
    <>
      <PerspectiveCamera makeDefault fov={FOV} position={[0, 0, CAMERA_Z]} />
      <StudioLighting tier={tier} />

      <group scale={fit}>
        <group ref={groupRef}>
          {device === "phone" ? (
            <group>
              <RoundedBox args={[1.15, 2.35, 0.12]} radius={0.15} smoothness={4} raycast={noRaycast}>
                <meshStandardMaterial {...looks.gold} color={palette.goldDark} />
              </RoundedBox>
              <group position={[0, 0, 0.061]}>{screenPlanes}</group>
              {/* Back: camera module, so the device reads correctly when spun around */}
              <RoundedBox args={[0.38, 0.38, 0.04]} radius={0.08} position={[-0.3, 0.85, -0.075]} raycast={noRaycast}>
                <meshStandardMaterial {...looks.glass} />
              </RoundedBox>
              {[0.08, -0.08].map((y) => (
                <mesh key={y} position={[-0.3, 0.85 + y, -0.097]} rotation={[0, Math.PI, 0]} raycast={noRaycast}>
                  <circleGeometry args={[0.06, 24]} />
                  <meshStandardMaterial color="#050505" metalness={1} roughness={0.1} />
                </mesh>
              ))}
            </group>
          ) : (
            <group position={[0, -0.2, 0.3]}>
              {/* Base */}
              <RoundedBox args={[3.2, 0.09, 2.1]} radius={0.04} position={[0, -0.9, 0]} raycast={noRaycast}>
                <meshStandardMaterial {...looks.gold} color={palette.goldDark} />
              </RoundedBox>
              <mesh position={[0, -0.853, 0.15]} rotation={[-Math.PI / 2, 0, 0]} raycast={noRaycast}>
                <planeGeometry args={[2.7, 1.2]} />
                <meshStandardMaterial color="#0d0d0d" metalness={0.2} roughness={0.8} />
              </mesh>
              {/* Lid, hinged at the back edge and leaning back slightly */}
              <group position={[0, -0.86, -1.02]} rotation={[-0.22, 0, 0]}>
                <RoundedBox args={[3.2, 2.05, 0.06]} radius={0.04} position={[0, 1.02, 0]} raycast={noRaycast}>
                  <meshStandardMaterial {...looks.gold} color={palette.goldDark} />
                </RoundedBox>
                <group position={[0, 1.02, 0.032]}>{screenPlanes}</group>
              </group>
            </group>
          )}
        </group>

        {/* Invisible hit volume: drag anywhere on the device, tap to switch screens */}
        <mesh {...drag.handlers}>
          <boxGeometry args={device === "phone" ? [1.8, 2.8, 1] : [3.8, 3, 2.4]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      </group>
    </>
  );
}
