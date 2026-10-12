"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { GoldStudio } from "@/three/scenes/shared/GoldStudio";
import { Particles } from "@/three/scenes/hero/Particles";
import { GroundShadow } from "@/three/scenes/hero/GroundShadow";
import { pointer } from "@/three/state/input";
import { palette } from "@/lib/theme";
import type { SceneProps } from "@/three/scenes/types";

const RADIUS = 1.35;
const DETAIL = {
  high: { segments: 192, particles: 260 },
  medium: { segments: 96, particles: 100 },
} as const;
const INTRO_SECONDS = 1.8;
const { damp, clamp } = THREE.MathUtils;
const noRaycast = () => null;
const _dir = new THREE.Vector3();

/*
 * Shared uniforms for the molten surface. Module-level (one hero on the
 * page): mutated every frame from useFrame and read by the shader, so no
 * React state is involved.
 */
const uniforms = {
  uTime: { value: 0 },
  uAmp: { value: 0.1 }, // overall wave height
  uPointer: { value: new THREE.Vector3(0, 0, 1) }, // direction toward the cursor (object space)
  uPointerAmp: { value: 0 }, // bulge strength (0 when the cursor is away)
};

/* Ashima Arts 3D simplex noise (MIT): smooth, cheap, standard for GPU displacement. */
const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
uniform float uTime;
uniform float uAmp;
uniform vec3 uPointer;
uniform float uPointerAmp;
// Radial displacement: two octaves of flowing noise + a bulge toward the cursor.
float liquid(vec3 p){
  vec3 d = normalize(p);
  float n = snoise(d * 1.05 + vec3(0.0, uTime * 0.2, uTime * 0.08)) * 0.85
          + snoise(d * 2.4 - vec3(uTime * 0.15)) * 0.15;
  float bulge = pow(max(dot(d, uPointer), 0.0), 8.0) * uPointerAmp;
  return n * uAmp + bulge;
}
vec3 liquidPos(vec3 p){ return p + normalize(p) * liquid(p); }
`;

/**
 * Patch MeshPhysicalMaterial so its vertices flow. The normal is rebuilt from
 * the displaced surface (two nearby displaced points → cross product), so the
 * environment reflections and highlights slide over the waves like real
 * molten metal, instead of staying painted on a perfect sphere.
 */
function patchLiquid(shader: THREE.WebGLProgramParametersWithUniforms) {
  Object.assign(shader.uniforms, uniforms);
  shader.vertexShader = NOISE + shader.vertexShader;
  shader.vertexShader = shader.vertexShader.replace(
    "#include <beginnormal_vertex>",
    /* glsl */ `
    vec3 baseN = normalize(normal);
    vec3 helper = abs(baseN.y) > 0.99 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
    vec3 tA = normalize(cross(baseN, helper));
    vec3 tB = normalize(cross(baseN, tA));
    float e = 0.012;
    vec3 liquidP0 = liquidPos(position);
    vec3 liquidP1 = liquidPos(position + tA * e);
    vec3 liquidP2 = liquidPos(position + tB * e);
    vec3 objectNormal = normalize(cross(liquidP1 - liquidP0, liquidP2 - liquidP0));
    if (dot(objectNormal, baseN) < 0.0) objectNormal = -objectNormal;
    `,
  );
  shader.vertexShader = shader.vertexShader.replace("#include <begin_vertex>", "vec3 transformed = liquidP0;");
}

/**
 * Home hero: the "liquid gold core".
 *
 * Story: the business at the centre, made of a material that keeps reshaping
 * itself (custom, adaptable software), held in orbit by the systems around it.
 *
 *  - Surface: GPU-displaced polished gold that slowly flows; reflections slide
 *    over the waves (normals rebuilt in the shader).
 *  - Cursor over the hero: the surface swells toward the pointer.
 *  - Scroll: the surface grows livelier and the orbit rings tilt open.
 *  - Entrance: the core swells into place; rings and glints settle in.
 *  - Reduced motion: still surface and rings (cursor bulge stays).
 * Cost: one sphere (192² segments on high, 96² on medium) + two rings.
 */
export default function LiquidCore({ activeRef, hoverRef, localPointer, reducedMotion, tier }: SceneProps) {
  const detail = DETAIL[tier];
  const coreRef = useRef<THREE.Mesh>(null);
  const rigRef = useRef<THREE.Group>(null);
  const ringARef = useRef<THREE.Group>(null);
  const ringBRef = useRef<THREE.Group>(null);
  const sim = useRef({ t: 0, intro: reducedMotion ? 1 : 0, scroll: 0 });

  // Soft radial glow texture, shared by the aura behind the core and the ring glints.
  const glow = useMemo(() => {
    const size = 256;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,226,150,1)");
    g.addColorStop(0.25, "rgba(212,175,55,0.45)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
  useEffect(() => () => glow.dispose(), [glow]);

  useFrame((_, delta) => {
    const core = coreRef.current;
    const rig = rigRef.current;
    if (!activeRef.current || !core || !rig) return;
    const dt = Math.min(delta, 0.1);
    const s = sim.current;
    if (!reducedMotion) s.t += dt;
    uniforms.uTime.value = s.t;

    // Entrance: swell from 55% with a soft overshoot.
    if (s.intro < 1) s.intro = Math.min(1, s.intro + dt / INTRO_SECONDS);
    const k = s.intro;
    const swell = k >= 1 ? 1 : 1 + 1.6 * Math.pow(k - 1, 3) + 0.6 * Math.pow(k - 1, 2);
    core.scale.setScalar(0.55 + 0.45 * swell);

    s.scroll = damp(s.scroll, clamp(window.scrollY / window.innerHeight, 0, 1), 4, dt);
    uniforms.uAmp.value = 0.1 + s.scroll * 0.12 + (1 - k) * 0.15; // calmer at rest, livelier on scroll

    // Cursor bulge: direction from the centre toward the pointer (in the hero box).
    const lp = localPointer.current;
    _dir.set(lp.x * 1.2, lp.y * 1.2, 1).normalize();
    uniforms.uPointer.value.lerp(_dir, 1 - Math.exp(-8 * dt));
    uniforms.uPointerAmp.value = damp(uniforms.uPointerAmp.value, hoverRef.current ? 0.32 : 0, 4, dt);

    // Whole scene: parallax with the global pointer / device tilt.
    rig.rotation.y = damp(rig.rotation.y, pointer.x * 0.25, 3, dt);
    rig.rotation.x = damp(rig.rotation.x, -pointer.y * 0.15, 3, dt);

    // Rings: steady orbit; scroll tilts them open.
    if (ringARef.current) {
      ringARef.current.rotation.z += dt * (reducedMotion ? 0 : 0.25);
      ringARef.current.rotation.x = damp(ringARef.current.rotation.x, 1.15 - s.scroll * 0.5, 3, dt);
    }
    if (ringBRef.current) {
      ringBRef.current.rotation.z -= dt * (reducedMotion ? 0 : 0.18);
      ringBRef.current.rotation.x = damp(ringBRef.current.rotation.x, 1.9 + s.scroll * 0.4, 3, dt);
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault fov={40} position={[0, 0, 7.4]} />

      <GoldStudio tier={tier} />

      <Particles count={detail.particles} activeRef={activeRef} reducedMotion={reducedMotion} />
      <group scale={0.75}>
        <GroundShadow y={-3.4} />
      </group>

      <group ref={rigRef}>
        {/* The molten core */}
        <mesh ref={coreRef} raycast={noRaycast}>
          <sphereGeometry args={[RADIUS, detail.segments, detail.segments]} />
          <meshPhysicalMaterial
            // Warm, bright gold reflectance (pure #d4af37 reads olive once lit).
            color="#f0c766"
            metalness={1}
            roughness={0.17}
            clearcoat={1}
            clearcoatRoughness={0.06}
            envMapIntensity={tier === "high" ? 1.35 : 1.8}
            // A whisper of thin-film sheen: highlights pick up a faint warm/rose shift, like real polished gold.
            iridescence={0.18}
            iridescenceIOR={1.4}
            // Faint warm self-glow so the shadow side never mirrors pure black.
            emissive={palette.goldDark}
            emissiveIntensity={0.1}
            onBeforeCompile={patchLiquid}
            // Own program-cache key, so the patched shader never shares a program with a plain physical material.
            customProgramCacheKey={() => "liquid-gold-core"}
          />
        </mesh>

        {/* Aura: a soft gold glow behind the core (a camera-facing sprite, additive). */}
        <sprite scale={RADIUS * 4.6} position={[0, 0, -1.2]} raycast={noRaycast}>
          <spriteMaterial
            map={glow}
            color={palette.gold}
            transparent
            opacity={0.32}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </sprite>

        {/* Orbit rings, each carrying a light glint */}
        {[
          { ref: ringARef, r: 2.05, rot: [1.15, 0.3, 0] as const },
          { ref: ringBRef, r: 2.4, rot: [1.9, -0.5, 0.4] as const },
        ].map(({ ref, r, rot }) => (
          <group key={r} ref={ref} rotation={[...rot]}>
            <mesh raycast={noRaycast}>
              <torusGeometry args={[r, 0.0045, 6, 256]} />
              <meshBasicMaterial color={palette.goldLight} transparent opacity={0.6} toneMapped={false} />
            </mesh>
            {/* Glint: a bright point with a soft bloom-like glow around it */}
            <group position={[r, 0, 0]}>
              <mesh raycast={noRaycast}>
                <sphereGeometry args={[0.028, 16, 16]} />
                <meshBasicMaterial color="#fff6dc" toneMapped={false} />
              </mesh>
              <sprite scale={0.42} raycast={noRaycast}>
                <spriteMaterial
                  map={glow}
                  color={palette.goldLight}
                  transparent
                  opacity={0.9}
                  depthWrite={false}
                  blending={THREE.AdditiveBlending}
                  toneMapped={false}
                />
              </sprite>
            </group>
          </group>
        ))}
      </group>
    </>
  );
}
