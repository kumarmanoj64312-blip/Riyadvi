"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { looks, type VariantProps } from "@/three/scenes/services/shared";
import { palette } from "@/lib/theme";

const BARS = 8;
const BASE_Y = -1.25;
const SPACING = 0.42;
const _m = new THREE.Matrix4();
const _p = new THREE.Vector3();
const _s = new THREE.Vector3();
const _q = new THREE.Quaternion();
const noRaycast = () => null;

/** Height of bar i at time t: exponential growth with a gentle "live data" wobble. */
function barHeight(i: number, t: number, boost: number) {
  return 0.3 * Math.pow(1.3, i) * (1 + 0.08 * Math.sin(t * 1.6 + i * 0.9)) * (1 + boost * 0.35);
}

/**
 * Digital Marketing — a live growth chart: bars rise exponentially, a trend
 * line connects their tops and a "conversion" pulse runs along it.
 * Hover = campaign boost: every bar climbs ~35%.
 */
export function MarketingScene({ activeRef, hover, reducedMotion }: VariantProps) {
  const barsRef = useRef<THREE.InstancedMesh>(null);
  const lineRef = useRef<THREE.Line>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const clock = useRef(0);

  // Trend line geometry: one vertex per bar top, rewritten each frame.
  const lineGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(BARS * 3), 3));
    return g;
  }, []);
  const lineMaterial = useMemo(
    () => new THREE.LineBasicMaterial({ color: palette.goldLight, toneMapped: false }),
    [],
  );
  const line = useMemo(() => new THREE.Line(lineGeometry, lineMaterial), [lineGeometry, lineMaterial]);
  useLayoutEffect(() => () => {
    lineGeometry.dispose();
    lineMaterial.dispose();
  }, [lineGeometry, lineMaterial]);

  // Colour ramp dark → light gold across the bars (set once).
  useLayoutEffect(() => {
    const mesh = barsRef.current;
    if (!mesh) return;
    const a = new THREE.Color(palette.goldDark);
    const b = new THREE.Color(palette.goldLight);
    for (let i = 0; i < BARS; i++) mesh.setColorAt(i, a.clone().lerp(b, i / (BARS - 1)));
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, []);

  useFrame((_, delta) => {
    if (!activeRef.current) return;
    const dt = Math.min(delta, 0.1);
    if (!reducedMotion) clock.current += dt;
    const t = clock.current;
    const boost = hover.current;
    const bars = barsRef.current;
    const pos = lineGeometry.getAttribute("position") as THREE.BufferAttribute;
    if (!bars) return;

    for (let i = 0; i < BARS; i++) {
      const x = (i - (BARS - 1) / 2) * SPACING;
      const h = barHeight(i, t, boost);
      _p.set(x, BASE_Y + h / 2, 0);
      _s.set(1, h, 1);
      bars.setMatrixAt(i, _m.compose(_p, _q, _s));
      pos.setXYZ(i, x, BASE_Y + h + 0.18, 0);
    }
    bars.instanceMatrix.needsUpdate = true;
    pos.needsUpdate = true;

    // Pulse travels along the trend line, looping every ~2.5s.
    if (pulseRef.current) {
      const u = ((t * 0.4) % 1) * (BARS - 1);
      const i = Math.floor(u);
      const f = u - i;
      pulseRef.current.position.set(
        THREE.MathUtils.lerp(pos.getX(i), pos.getX(i + 1), f),
        THREE.MathUtils.lerp(pos.getY(i), pos.getY(i + 1), f),
        0.02,
      );
    }
  });

  return (
    <group rotation={[0.25, -0.45, 0]}>
      {/* Floor */}
      <mesh position={[0, BASE_Y - 0.03, 0]} raycast={noRaycast}>
        <boxGeometry args={[3.9, 0.04, 1.2]} />
        <meshStandardMaterial {...looks.glass} />
      </mesh>
      <instancedMesh ref={barsRef} args={[undefined, undefined, BARS]} raycast={noRaycast}>
        <boxGeometry args={[0.26, 1, 0.26]} />
        <meshStandardMaterial metalness={0.85} roughness={0.3} />
      </instancedMesh>
      <primitive object={line} ref={lineRef} raycast={noRaycast} />
      <mesh ref={pulseRef} raycast={noRaycast}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial color={palette.goldLight} toneMapped={false} />
      </mesh>
    </group>
  );
}
