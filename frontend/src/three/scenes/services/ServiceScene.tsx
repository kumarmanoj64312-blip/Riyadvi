"use client";

import { useRef, useState, type ComponentType } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { StudioLighting } from "@/three/scenes/shared/StudioLighting";
import { visibleArea } from "@/three/utils/camera";
import type { SceneProps } from "@/three/scenes/types";
import type { ServiceSceneType } from "@/types/content";
import type { VariantProps } from "@/three/scenes/services/shared";
import { WebScene } from "@/three/scenes/services/WebScene";
import { AppScene } from "@/three/scenes/services/AppScene";
import { MarketingScene } from "@/three/scenes/services/MarketingScene";
import { ArVrScene } from "@/three/scenes/services/ArVrScene";
import { ModelingScene } from "@/three/scenes/services/ModelingScene";
import { UiUxScene } from "@/three/scenes/services/UiUxScene";
import { GenericScene } from "@/three/scenes/services/GenericScene";

/** One visual per service type — each tells that service's story. */
const VARIANTS: Record<ServiceSceneType, ComponentType<VariantProps>> = {
  "web-development": WebScene, // browser whose UI / code / data layers separate
  "app-development": AppScene, // phone with a live feed + orbiting app screens
  "digital-marketing": MarketingScene, // bars + trend line growing
  "ar-vr": ArVrScene, // portal with objects passing through
  "3d-modeling": ModelingScene, // rotatable object revealing its topology
  "ui-ux-design": UiUxScene, // scattered UI cards that snap into a layout
  generic: GenericScene, // safe default for services added later via CMS
};

const FOV = 35;
const CAMERA_Z = 7;
const { damp, clamp } = THREE.MathUtils;

/**
 * The single reusable service visual: <SceneView scene="service"
 * params={{ serviceType, variant }} />. Used for the six home tiles, the
 * /services overview and the hero of every /services/[slug] page.
 *
 * Owns what all variants share: camera, lighting, fit-to-box scaling, a
 * smoothed hover value, and the "tilt toward the pointer" rig.
 */
export default function ServiceScene(props: SceneProps) {
  const { activeRef, hoverRef, localPointer, viewProgress, reducedMotion, params, tier } = props;
  const Variant = VARIANTS[params.serviceType ?? "generic"] ?? GenericScene;
  const isHero = params.variant === "hero";

  const hover = useRef(0);
  const scroll = useRef(0); // smoothed viewProgress
  const rigRef = useRef<THREE.Group>(null);
  // Touch screens have no hover → tiles "engage" from scroll position instead.
  const [isTouch] = useState(() => window.matchMedia("(pointer: coarse)").matches);

  // Content is authored inside ~±2.1 × ±1.8 units; scale it to fit the box.
  // Tiles keep a wider safety margin (they tilt more relative to their size).
  const size = useThree((s) => s.size);
  const area = visibleArea(FOV, CAMERA_Z, size);
  const fit = isHero
    ? Math.min(1.2, area.width / 4.1, area.height / 3.8)
    : Math.min(1, area.width / 4.6, area.height / 4.2);

  useFrame((_, delta) => {
    const rig = rigRef.current;
    if (!activeRef.current || !rig) return;
    const dt = Math.min(delta, 0.1);
    scroll.current = damp(scroll.current, viewProgress.current, 6, dt);
    const s = scroll.current;

    // "Engaged" amount (layers separate, bars climb…) comes from:
    //  - hover (desktop),
    //  - hero: scrolling down past it opens the visual up,
    //  - touch tiles: the tile reaching the middle of the screen.
    const fromScroll = isHero ? clamp(-s * 2.2, 0, 1) : isTouch ? clamp(1 - Math.abs(s) * 2.5, 0, 1) : 0;
    const engage = hoverRef.current ? 1 : fromScroll;
    hover.current = damp(hover.current, engage, reducedMotion ? 30 : 6, dt);

    // Pointer tilt (tiles only while hovered; the hero always follows) + scroll turn:
    // the object rotates and drifts as its section passes through the viewport.
    const follow = isHero ? 1 : hover.current;
    rig.rotation.y = damp(rig.rotation.y, localPointer.current.x * 0.35 * follow + s * (isHero ? 0.45 : 0.3), 4, dt);
    rig.rotation.x = damp(rig.rotation.x, -localPointer.current.y * 0.25 * follow + s * 0.15, 4, dt);
    rig.position.y = s * (isHero ? 0.25 : 0.18); // parallax: lags slightly behind the page
  });

  return (
    <>
      <PerspectiveCamera makeDefault fov={FOV} position={[0, 0, CAMERA_Z]} />
      <StudioLighting tier={tier} />
      <group scale={fit}>
        <group ref={rigRef}>
          <Variant {...props} hover={hover} isHero={isHero} />
        </group>
      </group>
    </>
  );
}
