"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { looks, type VariantProps } from "@/three/scenes/services/shared";
import { palette } from "@/lib/theme";

/*
 * Portal surface: polar-coordinate swirl. Rings expand outward and twist
 * with time — reads as "depth" behind the ring without any extra geometry.
 */
const portalVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const portalFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv - 0.5;
    float r = length(p) * 2.0;                 // 0 centre → 1 rim
    float a = atan(p.y, p.x);
    float swirl = sin(a * 3.0 + r * 10.0 - uTime * 2.0);
    float rings = sin(r * 18.0 - uTime * 3.0) * 0.5 + 0.5;
    float glow = smoothstep(1.0, 0.0, r);
    float intensity = (0.35 + 0.35 * swirl * rings) * glow + smoothstep(0.75, 1.0, r) * 0.6;
    gl_FragColor = vec4(uColor * intensity, intensity * smoothstep(1.0, 0.95, r));
  }
`;

const OBJECTS = [
  { geo: "octahedron", size: 0.22, speed: 0.55, phase: 0 },
  { geo: "icosahedron", size: 0.2, speed: 0.4, phase: 1.3 },
  { geo: "box", size: 0.26, speed: 0.48, phase: 2.6 },
  { geo: "torus", size: 0.18, speed: 0.62, phase: 3.9 },
  { geo: "dodecahedron", size: 0.2, speed: 0.45, phase: 5.1 },
] as const;
const noRaycast = () => null;

function ObjectGeometry({ geo, size }: { geo: (typeof OBJECTS)[number]["geo"]; size: number }) {
  switch (geo) {
    case "octahedron":
      return <octahedronGeometry args={[size]} />;
    case "icosahedron":
      return <icosahedronGeometry args={[size]} />;
    case "box":
      return <boxGeometry args={[size, size, size]} />;
    case "torus":
      return <torusGeometry args={[size, size * 0.35, 12, 32]} />;
    default:
      return <dodecahedronGeometry args={[size]} />;
  }
}

/**
 * AR / VR — a portal between the physical and digital world. Objects loop
 * through it on elliptical paths (in front of → behind the ring).
 * Hover: the portal spins up and the objects are pulled in closer.
 */
export function ArVrScene({ activeRef, hover, reducedMotion }: VariantProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const portalRef = useRef<THREE.ShaderMaterial>(null);
  const objectRefs = useRef<(THREE.Mesh | null)[]>([]);
  const clock = useRef(0);

  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uColor: { value: new THREE.Color(palette.gold) } }), []);

  useFrame((_, delta) => {
    if (!activeRef.current) return;
    const dt = Math.min(delta, 0.1);
    const h = hover.current;
    if (!reducedMotion) clock.current += dt * (1 + h * 1.5);
    const t = clock.current;

    if (portalRef.current) portalRef.current.uniforms.uTime.value = t;
    if (ringRef.current) ringRef.current.rotation.z = t * 0.3;

    const radius = 1.7 - h * 0.45;
    OBJECTS.forEach((o, i) => {
      const mesh = objectRefs.current[i];
      if (!mesh) return;
      const a = t * o.speed + o.phase;
      mesh.position.set(Math.cos(a) * radius, Math.sin(a * 2) * 0.35 + (i - 2) * 0.18, Math.sin(a) * 1.2);
      mesh.rotation.set(t * 0.7 + i, t * 0.5, 0);
    });
  });

  return (
    <group rotation={[0, -0.35, 0]}>
      <mesh ref={ringRef} raycast={noRaycast}>
        <torusGeometry args={[1.2, 0.07, 24, 96]} />
        <meshStandardMaterial {...looks.gold} />
      </mesh>
      <mesh raycast={noRaycast}>
        <circleGeometry args={[1.16, 64]} />
        <shaderMaterial
          ref={portalRef}
          vertexShader={portalVertex}
          fragmentShader={portalFragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      {OBJECTS.map((o, i) => (
        <mesh key={o.geo} ref={(el) => void (objectRefs.current[i] = el)} raycast={noRaycast}>
          <ObjectGeometry geo={o.geo} size={o.size} />
          <meshStandardMaterial {...(i % 2 ? looks.gold : looks.goldMatte)} flatShading />
        </mesh>
      ))}
    </group>
  );
}
