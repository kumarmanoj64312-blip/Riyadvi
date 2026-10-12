"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { PerspectiveCamera, RoundedBox } from "@react-three/drei";
import { StudioLighting } from "@/three/scenes/shared/StudioLighting";
import { capabilityState } from "@/three/state/capabilities";
import { mulberry32 } from "@/three/utils/network";
import { palette } from "@/lib/theme";
import type { SceneProps } from "@/three/scenes/types";

const SLAB = 3; // slab width/depth (world units)
const THICK = 0.18;
const GAP = 0.78; // resting vertical spacing
const LIFT = 0.5; // how far the active slab rises out of the stack
const { damp, clamp } = THREE.MathUtils;
const noRaycast = () => null;

/** Rounded-rectangle outline (for the gold rim on each slab's top face). */
function rimGeometry(size: number, r: number) {
  const s = size / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-s + r, -s);
  shape.lineTo(s - r, -s);
  shape.quadraticCurveTo(s, -s, s, -s + r);
  shape.lineTo(s, s - r);
  shape.quadraticCurveTo(s, s, s - r, s);
  shape.lineTo(-s + r, s);
  shape.quadraticCurveTo(-s, s, -s, s - r);
  shape.lineTo(-s, -s + r);
  shape.quadraticCurveTo(-s, -s, -s + r, -s);
  return new THREE.BufferGeometry().setFromPoints(shape.getPoints(12));
}

/** Engraved top face: fine gold grid + the layer name, drawn on a canvas. */
function drawLabel(canvas: HTMLCanvasElement, name: string) {
  const size = canvas.width;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);
  ctx.strokeStyle = "rgba(212,175,55,0.10)";
  ctx.lineWidth = 2;
  for (let i = 1; i < 12; i++) {
    const p = (i / 12) * size;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, size);
    ctx.moveTo(0, p);
    ctx.lineTo(size, p);
    ctx.stroke();
  }
  // Uses the site's display font once it has loaded (see the effect below).
  ctx.font = `700 ${size * 0.11}px Syne, "Syne Fallback", sans-serif`;
  ctx.fillStyle = "#f5e27a";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(name, size * 0.08, size * 0.9);
}

/* Value rising through the stack: points travel up and wrap (all in the shader). */
const riseVertex = /* glsl */ `
  uniform float uTime;
  uniform float uHeight;
  attribute float aSpeed;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.y = mod(p.y + uTime * aSpeed, uHeight) - uHeight * 0.5;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = 26.0 / -mv.z;
    vAlpha = 1.0 - abs(p.y / (uHeight * 0.5)); // fade at the ends
    gl_Position = projectionMatrix * mv;
  }
`;
const riseFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(uColor, (1.0 - d * 2.0) * vAlpha * 0.9);
  }
`;

/**
 * Home › Capabilities: four polished slabs (Strategy → Design → Engineering →
 * Growth) held together by gold light pillars, with points of light rising
 * through them: value flowing from the foundation up to the visible result.
 *
 *  - Active layer (from the list, or by hovering a slab): lifts out, its rim
 *    and engraving glow, the other layers dim and make room.
 *  - Scroll: the stack arrives exploded and assembles as its section centres.
 *  - Pointer: gentle tilt toward the cursor; slow idle float.
 *
 * Polished-obsidian look from MeshPhysicalMaterial clearcoat + the studio
 * environment (no transmission: that would add a full extra render pass).
 */
export default function CapabilityScene({
  activeRef,
  localPointer,
  viewProgress,
  reducedMotion,
  tier,
  params,
}: SceneProps) {
  const names = useMemo(() => params.layers ?? ["Strategy", "Design", "Engineering", "Growth"], [params.layers]);
  const count = names.length;

  const rigRef = useRef<THREE.Group>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const slabRefs = useRef<(THREE.Group | null)[]>([]);
  const rimMats = useRef<(THREE.LineBasicMaterial | null)[]>([]);
  const labelMats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const riseMat = useRef<THREE.ShaderMaterial>(null);
  const sim = useRef({ t: 0, scroll: 1, lift: names.map(() => 0) });

  const rim = useMemo(() => rimGeometry(SLAB * 0.94, 0.16), []);
  useEffect(() => () => rim.dispose(), [rim]);

  // One canvas texture per layer; redrawn once the display font is ready.
  const labels = useMemo(
    () =>
      names.map((name) => {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = tier === "high" ? 1024 : 512;
        drawLabel(canvas, name);
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        return { canvas, tex, name };
      }),
    [names, tier],
  );
  useEffect(() => {
    let cancelled = false;
    document.fonts?.load(`700 64px Syne`).then(() => {
      if (cancelled) return;
      labels.forEach((l) => {
        drawLabel(l.canvas, l.name);
        l.tex.needsUpdate = true;
      });
    });
    return () => {
      cancelled = true;
      labels.forEach((l) => l.tex.dispose());
    };
  }, [labels]);

  // Rising points inside the stack's footprint (seeded → pure render).
  const rise = useMemo(() => {
    const n = tier === "high" ? 160 : 70;
    const rand = mulberry32(3);
    const pos = new Float32Array(n * 3);
    const speed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos.set([(rand() - 0.5) * SLAB * 0.8, rand() * 4, (rand() - 0.5) * SLAB * 0.8], i * 3);
      speed[i] = 0.25 + rand() * 0.5;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSpeed", new THREE.BufferAttribute(speed, 1));
    return g;
  }, [tier]);
  useEffect(() => () => rise.dispose(), [rise]);
  const riseUniforms = useMemo(
    () => ({ uTime: { value: 0 }, uHeight: { value: 4 }, uColor: { value: new THREE.Color(palette.goldLight) } }),
    [],
  );

  useLayoutEffect(() => cameraRef.current?.lookAt(0, 0, 0), []);

  useFrame((_, delta) => {
    const rig = rigRef.current;
    if (!activeRef.current || !rig) return;
    const dt = Math.min(delta, 0.1);
    const s = sim.current;
    if (!reducedMotion) s.t += dt;
    if (riseMat.current && !reducedMotion) riseMat.current.uniforms.uTime.value = s.t;

    // Scroll: exploded while entering (viewProgress ≈ 1) → assembled when centred (≈ 0).
    s.scroll = damp(s.scroll, clamp(viewProgress.current, 0, 1), 4, dt);
    const spread = 1 + s.scroll * 1.4;

    rig.rotation.y = damp(rig.rotation.y, Math.PI / 4 + localPointer.current.x * 0.25 - s.scroll * 0.6, 3, dt);
    rig.rotation.x = damp(rig.rotation.x, -localPointer.current.y * 0.08, 3, dt);
    rig.position.y = reducedMotion ? 0 : Math.sin(s.t * 0.8) * 0.06; // idle float

    const active = capabilityState.active;
    const centre = ((count - 1) * GAP) / 2;
    for (let i = 0; i < count; i++) {
      const slab = slabRefs.current[i];
      if (!slab) continue;
      const on = i === active;
      s.lift[i] = damp(s.lift[i], on ? 1 : 0, 6, dt);
      // Layers above the active one make room; the active one rises.
      const push = i > active ? LIFT * 0.6 : 0;
      slab.position.y = (i * GAP - centre) * spread + s.lift[i] * LIFT + push;
      slab.rotation.y = s.lift[i] * 0.08; // a slight turn as it lifts
      const rimMat = rimMats.current[i];
      if (rimMat) rimMat.opacity = 0.25 + s.lift[i] * 0.75;
      const labelMat = labelMats.current[i];
      if (labelMat) labelMat.opacity = 0.35 + s.lift[i] * 0.65;
    }
  });

  const pick = (i: number) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (capabilityState.active !== i) {
      capabilityState.active = i;
      capabilityState.onPick?.(i);
    }
  };

  const pillarH = (count - 1) * GAP + THICK; // spans the resting stack exactly
  const corner = SLAB / 2 - 0.12;

  return (
    <>
      <PerspectiveCamera makeDefault ref={cameraRef} fov={30} position={[0, 5.6, 9.4]} />
      <StudioLighting tier={tier} />

      <group ref={rigRef} rotation={[0, Math.PI / 4, 0]}>
        {names.map((name, i) => (
          <group key={name} ref={(el) => void (slabRefs.current[i] = el)} onPointerOver={pick(i)}>
            <RoundedBox args={[SLAB, THICK, SLAB]} radius={0.08} smoothness={4}>
              <meshPhysicalMaterial
                color="#0d0d0d"
                metalness={0.55}
                roughness={0.22}
                clearcoat={1}
                clearcoatRoughness={0.08}
              />
            </RoundedBox>
            {/* Engraving + rim sit just above the top face */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, THICK / 2 + 0.004, 0]} raycast={noRaycast}>
              <planeGeometry args={[SLAB * 0.94, SLAB * 0.94]} />
              <meshBasicMaterial
                ref={(m) => void (labelMats.current[i] = m)}
                map={labels[i].tex}
                transparent
                opacity={0.35}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
            <lineLoop
              geometry={rim}
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, THICK / 2 + 0.006, 0]}
              raycast={noRaycast}
            >
              <lineBasicMaterial
                ref={(m) => void (rimMats.current[i] = m)}
                color={palette.goldLight}
                transparent
                opacity={0.25}
                toneMapped={false}
              />
            </lineLoop>
          </group>
        ))}

        {/* Light pillars at the corners tie the layers into one structure */}
        {[
          [corner, corner],
          [-corner, corner],
          [corner, -corner],
          [-corner, -corner],
        ].map(([x, z]) => (
          <mesh key={`${x}${z}`} position={[x, 0, z]} raycast={noRaycast}>
            <cylinderGeometry args={[0.012, 0.012, pillarH, 6]} />
            <meshBasicMaterial color={palette.gold} transparent opacity={0.45} toneMapped={false} />
          </mesh>
        ))}

        <points geometry={rise} raycast={noRaycast}>
          <shaderMaterial
            ref={riseMat}
            vertexShader={riseVertex}
            fragmentShader={riseFragment}
            uniforms={riseUniforms}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>
    </>
  );
}
