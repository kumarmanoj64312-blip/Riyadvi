"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { mulberry32 } from "@/three/utils/network";
import { looks, type VariantProps } from "@/three/scenes/services/shared";
import { palette } from "@/lib/theme";

const CARD_W = 1.05;
const CARD_H = 0.72;
const COLS = 3;
const COUNT = 6;
const noRaycast = () => null;

type Pose = { x: number; y: number; z: number; rx: number; ry: number; rz: number };

/** Two poses per card: scattered (idea) and aligned on a 3×2 grid (design). */
function buildPoses() {
  const rand = mulberry32(42);
  return Array.from({ length: COUNT }, (_, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const aligned: Pose = { x: (col - 1) * (CARD_W + 0.15), y: (0.5 - row) * (CARD_H + 0.18), z: 0, rx: 0, ry: 0, rz: 0 };
    const scattered: Pose = {
      x: (rand() - 0.5) * 3.4,
      y: (rand() - 0.5) * 2.4,
      z: (rand() - 0.5) * 1.6,
      rx: (rand() - 0.5) * 0.6,
      ry: (rand() - 0.5) * 0.9,
      rz: (rand() - 0.5) * 0.5,
    };
    return { aligned, scattered };
  });
}

/**
 * UI/UX Design — floating interface cards at different depths: some are
 * gold wireframes (ideas), some are finished hi-fi UI. On hover they glide
 * into a clean 3×2 layout — design turning chaos into a clear system.
 */
export function UiUxScene({ activeRef, hover, reducedMotion }: VariantProps) {
  const cardRefs = useRef<(THREE.Group | null)[]>([]);
  const clock = useRef(0);
  const poses = useMemo(() => buildPoses(), []);

  const outline = useMemo(() => {
    const plane = new THREE.PlaneGeometry(CARD_W, CARD_H);
    const e = new THREE.EdgesGeometry(plane);
    plane.dispose();
    return e;
  }, []);
  useEffect(() => () => outline.dispose(), [outline]);

  useFrame((_, delta) => {
    if (!activeRef.current) return;
    const dt = Math.min(delta, 0.1);
    if (!reducedMotion) clock.current += dt;
    // Ease the blend so cards accelerate/decelerate into place.
    const h = hover.current * hover.current * (3 - 2 * hover.current);
    const lerp = THREE.MathUtils.lerp;

    poses.forEach(({ aligned: a, scattered: s }, i) => {
      const card = cardRefs.current[i];
      if (!card) return;
      const bob = Math.sin(clock.current * 0.8 + i * 1.7) * 0.06 * (1 - h);
      card.position.set(lerp(s.x, a.x, h), lerp(s.y, a.y, h) + bob, lerp(s.z, a.z, h));
      card.rotation.set(lerp(s.rx, a.rx, h), lerp(s.ry, a.ry, h), lerp(s.rz, a.rz, h));
    });
  });

  return (
    <group>
      {poses.map((_, i) => {
        const wire = i % 3 === 1; // every third card is a wireframe sketch
        return (
          <group key={i} ref={(el) => void (cardRefs.current[i] = el)}>
            {wire ? (
              <>
                <lineSegments geometry={outline} raycast={noRaycast}>
                  <lineBasicMaterial color={palette.gold} toneMapped={false} />
                </lineSegments>
                {[0.18, 0.02, -0.14].map((y, k) => (
                  <mesh key={y} position={[-0.12 + k * 0.04, y, 0]} raycast={noRaycast}>
                    <planeGeometry args={[0.7 - k * 0.15, 0.035]} />
                    <meshBasicMaterial color={palette.goldDark} />
                  </mesh>
                ))}
              </>
            ) : (
              <>
                <RoundedBox args={[CARD_W, CARD_H, 0.03]} radius={0.05} raycast={noRaycast}>
                  <meshStandardMaterial {...looks.panel} />
                </RoundedBox>
                <mesh position={[-0.33, 0.17, 0.02]} raycast={noRaycast}>
                  <circleGeometry args={[0.09, 24]} />
                  <meshBasicMaterial color={palette.gold} toneMapped={false} />
                </mesh>
                <mesh position={[0.08, 0.2, 0.02]} raycast={noRaycast}>
                  <planeGeometry args={[0.5, 0.05]} />
                  <meshBasicMaterial color={palette.fg} />
                </mesh>
                <mesh position={[0.02, -0.02, 0.02]} raycast={noRaycast}>
                  <planeGeometry args={[0.82, 0.04]} />
                  <meshBasicMaterial color="#555" />
                </mesh>
                <RoundedBox args={[0.34, 0.11, 0.02]} radius={0.04} position={[-0.24, -0.2, 0.025]} raycast={noRaycast}>
                  <meshStandardMaterial {...looks.gold} />
                </RoundedBox>
              </>
            )}
          </group>
        );
      })}
    </group>
  );
}
