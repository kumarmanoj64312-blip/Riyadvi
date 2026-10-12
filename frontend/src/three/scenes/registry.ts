import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { SceneProps } from "@/three/scenes/types";

/**
 * Every 3D scene on the site, by key. Each entry is a lazy import, so a
 * scene's code (and Three.js itself) is only downloaded when a page actually
 * renders <SceneView scene="…"> on a capable device.
 *
 * React.lazy is used here rather than next/dynamic because these components
 * render *inside* the WebGL canvas (R3F reconciler), where next/dynamic's DOM
 * wrappers don't belong.
 *
 * Adding a scene = one line here + the component file.
 */
export const sceneRegistry = {
  // Alternative heroes kept for comparison (swap the import path):
  //   "@/three/scenes/hero/FloatingDevices" (devices + light vortex), "@/three/scenes/hero/LiquidCore" (liquid gold core).
  hero: lazy(() => import("@/three/scenes/hero/FlowTubes")),
  transformation: lazy(() => import("@/three/scenes/transformation/MorphScene")),
  service: lazy(() => import("@/three/scenes/services/ServiceScene")),
  device: lazy(() => import("@/three/scenes/showcase/DeviceShowcase")),
  tech: lazy(() => import("@/three/scenes/tech/TechGlobe")),
  capabilities: lazy(() => import("@/three/scenes/capabilities/CapabilityScene")),
  work: lazy(() => import("@/three/scenes/work/WorkRing")),
} satisfies Record<string, LazyExoticComponent<ComponentType<SceneProps>>>;

export type SceneKey = keyof typeof sceneRegistry;
