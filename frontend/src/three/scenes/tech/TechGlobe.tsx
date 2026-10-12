"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Billboard, PerspectiveCamera } from "@react-three/drei";
import { StudioLighting } from "@/three/scenes/shared/StudioLighting";
import { useDragRotate } from "@/three/hooks/useDragRotate";
import { visibleArea } from "@/three/utils/camera";
import { constellation } from "@/three/state/constellation";
import { techIconPath, techMonogram } from "@/lib/techIcons";
import { palette } from "@/lib/theme";
import type { SceneProps } from "@/three/scenes/types";

const FOV = 38;
const CAMERA_Z = 8.5;
const RADIUS = 2.35;
const TILE = 0.62;
const { damp } = THREE.MathUtils;
const noRaycast = () => null;
const _world = new THREE.Vector3();

/** Evenly spread points on a sphere (Fibonacci / golden-angle spiral). */
function fibonacciSphere(n: number, r: number) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: n }, (_, i) => {
    const y = 1 - (i / Math.max(1, n - 1)) * 2;
    const ring = Math.sqrt(1 - y * y);
    const t = golden * i;
    return new THREE.Vector3(Math.cos(t) * ring * r, y * r * 0.92, Math.sin(t) * ring * r);
  });
}

/** Glass tile with the technology's logo, drawn once onto a canvas. */
function tileTexture(slug: string, size: number) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const r = size * 0.22;
  const pad = size * 0.04;
  const rect = () => {
    ctx.beginPath();
    ctx.roundRect(pad, pad, size - pad * 2, size - pad * 2, r);
  };
  // Dark glass body with a soft top highlight and a gold hairline rim.
  const body = ctx.createLinearGradient(0, 0, 0, size);
  body.addColorStop(0, "rgba(40,36,26,0.95)");
  body.addColorStop(1, "rgba(10,10,10,0.95)");
  rect();
  ctx.fillStyle = body;
  ctx.fill();
  ctx.lineWidth = size * 0.012;
  ctx.strokeStyle = "rgba(212,175,55,0.75)";
  ctx.stroke();

  const path = techIconPath(slug);
  ctx.fillStyle = "#f5f5f4";
  if (path) {
    const scale = (size * 0.46) / 24; // icons use a 24×24 viewBox
    ctx.save();
    ctx.translate(size / 2 - 12 * scale, size / 2 - 12 * scale);
    ctx.scale(scale, scale);
    ctx.fill(new Path2D(path));
    ctx.restore();
  } else {
    ctx.font = `700 ${size * 0.2}px Syne, "Syne Fallback", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(techMonogram(slug), size / 2, size / 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/**
 * Home › Technology ecosystem: a globe of technology tiles.
 *
 * Every technology is a glass tile with its real logo, spread evenly over a
 * sphere (Fibonacci spiral) and wired to a glowing core by gold spokes: the
 * whole stack connected around your business.
 *
 *  - Tiles always face the viewer (drei <Billboard>); tiles on the far side
 *    fade and shrink, so the globe reads in depth.
 *  - Hover a tile (or a name in the list): it pops forward and glows, the rest
 *    dim, the spin pauses, and the description card updates (`onHover` bridge).
 *  - Drag to spin with inertia; slow idle spin; scrolling tilts the globe.
 *
 * No floating DOM labels: names live in the accessible list below.
 */
export default function TechGlobe({ activeRef, viewProgress, reducedMotion, tier, params }: SceneProps) {
  const techs = useMemo(() => params.technologies ?? [], [params.technologies]);
  const positions = useMemo(() => fibonacciSphere(techs.length, RADIUS), [techs.length]);
  const textures = useMemo(() => techs.map((t) => tileTexture(t.slug, tier === "high" ? 256 : 192)), [techs, tier]);
  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures]);

  // One LineSegments for every spoke (core → tile): one draw call.
  const spokes = useMemo(() => {
    const pts = new Float32Array(positions.length * 6);
    positions.forEach((p, i) => pts.set([0, 0, 0, p.x * 0.9, p.y * 0.9, p.z * 0.9], i * 6));
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pts, 3));
    return g;
  }, [positions]);
  useEffect(() => () => spokes.dispose(), [spokes]);

  const globeRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const tileRefs = useRef<(THREE.Group | null)[]>([]);
  const tileMats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const scroll = useRef(0);
  const drag = useDragRotate({ enabled: true, initialTilt: 0.2 });

  const size = useThree((s) => s.size);
  const area = visibleArea(FOV, CAMERA_Z, size);
  const fit = Math.min(1.15, area.width / 6.4, area.height / 6.2);

  useFrame((_, delta) => {
    const globe = globeRef.current;
    if (!activeRef.current || !globe) return;
    const dt = Math.min(delta, 0.1);
    const hovered = constellation.hovered;

    const s = drag.step(dt, { spin: reducedMotion || hovered ? 0 : 0.12 });
    scroll.current = damp(scroll.current, viewProgress.current, 4, dt);
    globe.rotation.set(s.rotX - scroll.current * 0.3, s.rotY - scroll.current * 0.8, 0);
    if (coreRef.current && !reducedMotion) coreRef.current.rotation.y += dt * 0.3;

    for (let i = 0; i < techs.length; i++) {
      const tile = tileRefs.current[i];
      const mat = tileMats.current[i];
      if (!tile || !mat) continue;
      // Depth cue: far-side tiles are smaller and fainter.
      tile.getWorldPosition(_world);
      const front = THREE.MathUtils.clamp((_world.z / (RADIUS * fit) + 1) / 2, 0, 1); // 0 back → 1 front
      const isHot = hovered === techs[i].slug;
      const target = isHot ? 1.55 : 0.75 + front * 0.35;
      tile.scale.setScalar(damp(tile.scale.x, target, 8, dt));
      const opacity = isHot ? 1 : hovered ? 0.18 + front * 0.25 : 0.25 + front * 0.75;
      mat.opacity = damp(mat.opacity, opacity, 8, dt);
    }
  });

  const over = (slug: string) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (constellation.hovered === slug) return;
    constellation.hovered = slug;
    constellation.onHover?.(slug);
    document.body.style.cursor = "pointer";
  };
  const out = (slug: string) => () => {
    if (constellation.hovered !== slug) return;
    constellation.hovered = null;
    constellation.onHover?.(null);
    document.body.style.cursor = "";
  };

  return (
    <>
      <PerspectiveCamera makeDefault fov={FOV} position={[0, 0, CAMERA_Z]} />
      <StudioLighting tier={tier} />

      <group scale={fit}>
        <group ref={globeRef}>
          {/* Core: faceted gold heart + faint wire shell */}
          <mesh ref={coreRef} raycast={noRaycast}>
            <icosahedronGeometry args={[0.42, 1]} />
            <meshStandardMaterial color={palette.gold} metalness={1} roughness={0.25} flatShading />
          </mesh>
          <mesh raycast={noRaycast}>
            <icosahedronGeometry args={[RADIUS * 0.98, 1]} />
            <meshBasicMaterial color={palette.goldDark} wireframe transparent opacity={0.035} toneMapped={false} />
          </mesh>
          <lineSegments geometry={spokes} raycast={noRaycast}>
            <lineBasicMaterial color={palette.gold} transparent opacity={0.22} toneMapped={false} />
          </lineSegments>

          {techs.map((t, i) => (
            <group key={t.slug} position={positions[i]} ref={(el) => void (tileRefs.current[i] = el)}>
              <Billboard>
                <mesh onPointerOver={over(t.slug)} onPointerOut={out(t.slug)}>
                  <planeGeometry args={[TILE, TILE]} />
                  <meshBasicMaterial
                    ref={(m) => void (tileMats.current[i] = m)}
                    map={textures[i]}
                    transparent
                    opacity={0.8}
                    depthWrite={false}
                    toneMapped={false}
                  />
                </mesh>
              </Billboard>
            </group>
          ))}
        </group>

        {/* Invisible drag surface behind the tiles (tiles still receive hover first). */}
        <mesh {...drag.handlers} position={[0, 0, -0.5]}>
          <sphereGeometry args={[RADIUS + 0.6, 16, 16]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      </group>
    </>
  );
}
