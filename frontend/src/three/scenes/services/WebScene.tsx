"use client";

import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { looks, type VariantProps } from "@/three/scenes/services/shared";
import { palette } from "@/lib/theme";

const _m = new THREE.Matrix4();
const _p = new THREE.Vector3();
const _s = new THREE.Vector3();
const _q = new THREE.Quaternion();

// Code layer: 9 "lines" with fixed indent/width, typed out one after another.
const CODE = [
  [0, 1.0], [0.12, 0.7], [0.24, 0.55], [0.24, 0.8], [0.12, 0.4],
  [0, 0.9], [0.12, 0.65], [0.24, 0.5], [0, 0.3],
] as const;
const CODE_LEFT = 0.15;
const CODE_TOP = 0.62;
const LINE_STEP = 0.15;
const noRaycast = () => null;

/**
 * Web Development — a browser window that is really three layers:
 * UI (front), code (middle) and structure (back). On hover the layers
 * separate in depth, like an exploded technical drawing: "we engineer
 * everything behind the page, not just the page".
 */
export function WebScene({ activeRef, hover, reducedMotion }: VariantProps) {
  const uiRef = useRef<THREE.Group>(null);
  const codeLayerRef = useRef<THREE.Group>(null);
  const gridRef = useRef<THREE.Group>(null);
  const codeRef = useRef<THREE.InstancedMesh>(null);
  const clock = useRef(0);

  useLayoutEffect(() => {
    const mesh = codeRef.current;
    if (!mesh) return;
    CODE.forEach((_, i) => mesh.setColorAt(i, new THREE.Color(i % 3 === 0 ? palette.gold : palette.goldDark)));
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, []);

  useFrame((_, delta) => {
    if (!activeRef.current) return;
    const dt = Math.min(delta, 0.1);
    const h = hover.current;
    if (!reducedMotion) clock.current += dt * (1 + h); // types faster when engaged

    // Exploded view: layer spacing grows from 0.12 to 0.55 with hover.
    const gap = 0.12 + h * 0.43;
    if (gridRef.current) gridRef.current.position.z = 0.05;
    if (codeLayerRef.current) codeLayerRef.current.position.z = 0.05 + gap;
    if (uiRef.current) uiRef.current.position.z = 0.05 + gap * 2;

    // "Typing": line i is fully typed once the cursor has passed it.
    const mesh = codeRef.current;
    if (!mesh) return;
    const cursor = reducedMotion ? CODE.length : (clock.current * 2.2) % (CODE.length + 4);
    CODE.forEach(([indent, width], i) => {
      const typed = THREE.MathUtils.clamp(cursor - i, 0, 1);
      const w = Math.max(0.0001, width * typed);
      _p.set(CODE_LEFT + indent + w / 2, CODE_TOP - i * LINE_STEP, 0);
      _s.set(w, 1, 1);
      mesh.setMatrixAt(i, _m.compose(_p, _q, _s));
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group rotation={[0.08, -0.38, 0]}>
      {/* Browser frame */}
      <RoundedBox args={[3.6, 2.4, 0.06]} radius={0.06} smoothness={3} raycast={noRaycast}>
        <meshStandardMaterial {...looks.glass} />
      </RoundedBox>
      {/* Toolbar: traffic lights + address bar */}
      <group position={[0, 1.02, 0.04]}>
        {[palette.gold, palette.goldDark, "#3a3a3a"].map((c, i) => (
          <mesh key={c} position={[-1.6 + i * 0.14, 0, 0]} raycast={noRaycast}>
            <circleGeometry args={[0.045, 16]} />
            <meshBasicMaterial color={c} toneMapped={false} />
          </mesh>
        ))}
        <mesh position={[0.1, 0, 0]} raycast={noRaycast}>
          <planeGeometry args={[2.2, 0.12]} />
          <meshBasicMaterial color="#1f1f1f" />
        </mesh>
      </group>

      {/* Back layer — structure: a faint layout grid */}
      <group ref={gridRef}>
        <gridHelper args={[3.2, 16, palette.goldDark, "#2a2a2a"]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.6]} raycast={noRaycast} />
      </group>

      {/* Middle layer — code being typed */}
      <group ref={codeLayerRef}>
        <instancedMesh ref={codeRef} args={[undefined, undefined, CODE.length]} raycast={noRaycast}>
          <planeGeometry args={[1, 0.06]} />
          <meshBasicMaterial toneMapped={false} />
        </instancedMesh>
      </group>

      {/* Front layer — the UI the visitor sees */}
      <group ref={uiRef}>
        <mesh position={[-0.75, 0.55, 0]} raycast={noRaycast}>
          <planeGeometry args={[1.5, 0.14]} />
          <meshBasicMaterial color={palette.fg} />
        </mesh>
        <mesh position={[-0.95, 0.33, 0]} raycast={noRaycast}>
          <planeGeometry args={[1.1, 0.07]} />
          <meshBasicMaterial color="#6b6b6b" />
        </mesh>
        <RoundedBox args={[0.7, 0.2, 0.04]} radius={0.08} position={[-1.15, 0.05, 0]} raycast={noRaycast}>
          <meshStandardMaterial {...looks.gold} />
        </RoundedBox>
        {[-1.1, 0, 1.1].map((x) => (
          <RoundedBox key={x} args={[0.95, 0.62, 0.03]} radius={0.04} position={[x, -0.62, 0]} raycast={noRaycast}>
            <meshStandardMaterial {...looks.panel} />
          </RoundedBox>
        ))}
      </group>
    </group>
  );
}
