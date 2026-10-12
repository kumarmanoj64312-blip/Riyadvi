import type { RefObject } from "react";
import type { ServiceSceneType } from "@/types/content";

/** Pointer position inside the scene's host element: x,y ∈ [-1, 1], +y up. */
export type ScenePointer = { x: number; y: number };

/** Serializable per-instance options a page passes to a scene. */
export type SceneParams = {
  serviceType?: ServiceSceneType;
  /** "tile" = small, hover-driven card visual; "hero" = large interactive version. */
  variant?: "tile" | "hero";
  /** Technologies for the globe (scene "tech"). */
  technologies?: { slug: string; ring: 0 | 1 | 2 }[];
  /** Case studies for the 3D ring (scene "work"): one generated screen each. */
  projects?: { slug: string; client: string; accent: string; screen: string; screens?: string[] }[];
  /** Layer names, bottom → top (scene "capabilities"). */
  layers?: string[];
  /** Case-study device presentation (scene "device"). */
  showcase?: { device: "phone" | "laptop"; client: string; accent: string; screens: string[] };
};

/**
 * Props every scene receives from SceneView.
 *
 * Passed as props (not React context) on purpose: scenes render inside the
 * R3F reconciler via a portal, and DOM-side contexts don't cross into it.
 * All per-frame values are refs — reading them in useFrame never re-renders.
 */
export type SceneProps = {
  /** true while the scene's section is on screen. Read inside useFrame and
   *  bail out early when false, so hidden scenes cost ~nothing. */
  activeRef: RefObject<boolean>;
  /** true while the pointer is over the scene's host (e.g. the whole card). */
  hoverRef: RefObject<boolean>;
  /** Pointer position relative to the host element. */
  localPointer: RefObject<ScenePointer>;
  /**
   * Where the scene's box sits in the viewport, written on scroll by SceneView:
   * +1 = just entering from the bottom, 0 = centred, -1 = leaving at the top.
   * Lets every scene react to scrolling (rotate, open up, parallax).
   */
  viewProgress: RefObject<number>;
  /** Only "high" | "medium" ever reach a scene — "low" gets the fallback. */
  tier: "high" | "medium";
  /** Stop idle/auto motion; keep user-driven motion (pointer, scroll). */
  reducedMotion: boolean;
  params: SceneParams;
};
