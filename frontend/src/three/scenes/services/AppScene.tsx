"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { looks, type VariantProps } from "@/three/scenes/services/shared";
import { palette } from "@/lib/theme";

const _m = new THREE.Matrix4();
const _p = new THREE.Vector3();
const _s = new THREE.Vector3();
const _q = new THREE.Quaternion();

const FEED_CARDS = 6;
const FEED_SPAN = 2.0; // vertical loop length on the screen
const SCREEN_HALF = 0.82; // cards fade out beyond this |y|
const ORBITERS = 3;
const noRaycast = () => null;

/**
 * App Development — a gold smartphone with a live feed scrolling on its
 * screen, while other app screens orbit around it (an app is an ecosystem of
 * screens). Hover: the orbit speeds up; the shared rig tilts the phone.
 */
export function AppScene({ activeRef, hover, reducedMotion }: VariantProps) {
  const cardsRef = useRef<THREE.InstancedMesh>(null);
  const dotsRef = useRef<THREE.InstancedMesh>(null);
  const orbitRef = useRef<THREE.Group>(null);
  const clock = useRef(0);
  const orbitAngle = useRef(0);

  // Gold outline for the orbiting screens (EdgesGeometry = clean rectangle).
  const edges = useMemo(() => {
    const plane = new THREE.PlaneGeometry(0.62, 1.15);
    const e = new THREE.EdgesGeometry(plane);
    plane.dispose();
    return e;
  }, []);
  useEffect(() => () => edges.dispose(), [edges]);

  useFrame((_, delta) => {
    if (!activeRef.current) return;
    const dt = Math.min(delta, 0.1);
    const h = hover.current;
    if (!reducedMotion) {
      clock.current += dt;
      orbitAngle.current += dt * (0.25 + h * 0.9);
    }

    // Feed: cards travel upward and wrap; scale to 0 near the screen edges
    // (cheap stand-in for clipping).
    const cards = cardsRef.current;
    const dots = dotsRef.current;
    if (cards && dots) {
      for (let i = 0; i < FEED_CARDS; i++) {
        const y = (((i / FEED_CARDS) * FEED_SPAN + clock.current * 0.22) % FEED_SPAN) - FEED_SPAN / 2;
        const edge = THREE.MathUtils.clamp((SCREEN_HALF - Math.abs(y)) / 0.12, 0, 1);
        _p.set(0.06, y, 0);
        _s.set(edge, edge, 1);
        cards.setMatrixAt(i, _m.compose(_p, _q, _s));
        _p.set(-0.24, y, 0.005);
        dots.setMatrixAt(i, _m.compose(_p, _q, _s));
      }
      cards.instanceMatrix.needsUpdate = true;
      dots.instanceMatrix.needsUpdate = true;
    }

    if (orbitRef.current) orbitRef.current.rotation.y = orbitAngle.current;
  });

  return (
    <group rotation={[0, -0.25, 0.04]}>
      {/* Phone body + screen */}
      <RoundedBox args={[1.1, 2.15, 0.12]} radius={0.14} smoothness={4} raycast={noRaycast}>
        <meshStandardMaterial {...looks.gold} />
      </RoundedBox>
      <mesh position={[0, 0, 0.062]} raycast={noRaycast}>
        <planeGeometry args={[0.98, 2.0]} />
        <meshBasicMaterial color="#050505" />
      </mesh>
      {/* Notch */}
      <mesh position={[0, 0.9, 0.064]} raycast={noRaycast}>
        <planeGeometry args={[0.3, 0.06]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>

      {/* Live feed */}
      <group position={[0, 0, 0.066]}>
        <instancedMesh ref={cardsRef} args={[undefined, undefined, FEED_CARDS]} raycast={noRaycast}>
          <planeGeometry args={[0.8, 0.26]} />
          <meshBasicMaterial color="#1c1c1c" />
        </instancedMesh>
        <instancedMesh ref={dotsRef} args={[undefined, undefined, FEED_CARDS]} raycast={noRaycast}>
          <circleGeometry args={[0.07, 16]} />
          <meshBasicMaterial color={palette.gold} toneMapped={false} />
        </instancedMesh>
      </group>

      {/* Orbiting app screens */}
      <group ref={orbitRef}>
        {Array.from({ length: ORBITERS }, (_, i) => {
          const a = (i / ORBITERS) * Math.PI * 2;
          return (
            <group key={i} position={[Math.cos(a) * 1.55, (i - 1) * 0.25, Math.sin(a) * 1.55]} rotation={[0, -a + Math.PI / 2, 0]}>
              <mesh raycast={noRaycast}>
                <planeGeometry args={[0.62, 1.15]} />
                <meshBasicMaterial color="#141414" transparent opacity={0.75} side={THREE.DoubleSide} />
              </mesh>
              <lineSegments geometry={edges} raycast={noRaycast}>
                <lineBasicMaterial color={palette.gold} transparent opacity={0.7} toneMapped={false} />
              </lineSegments>
              <mesh position={[0, 0.38, 0.01]} raycast={noRaycast}>
                <planeGeometry args={[0.42, 0.06]} />
                <meshBasicMaterial color={palette.goldDark} side={THREE.DoubleSide} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}
