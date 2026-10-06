"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { selectThreeDisabled, useSceneStore } from "@/three/state/sceneStore";
import type { SceneKey } from "@/three/scenes/registry";
import type { SceneParams, ScenePointer } from "@/three/scenes/types";
import { cn } from "@/lib/cn";

// The WebGL half of a view. Lazy so this file stays tiny (no Three.js import).
const ViewPortal = dynamic(() => import("@/three/canvas/ViewPortal"), { ssr: false });

type Props = {
  scene: SceneKey;
  /** Static stand-in: shown on SSR, while loading, on "low" devices and if WebGL fails. */
  fallback: ReactNode;
  /** Must give the box a size and a positioning context (e.g. "absolute inset-0"). */
  className?: string;
  /** Per-instance scene options (which service, tile vs hero…). */
  params?: SceneParams;
};

const NO_PARAMS: SceneParams = {};

/**
 * Drop-in 3D area for any page:  <SceneView scene="hero" fallback={<HeroFallback />} />
 *
 * Lifecycle
 *  1. SSR / hydration → only the fallback (fast first paint, works without JS).
 *  2. Tier known + section within ~1 viewport of the screen → lazy-load the
 *     scene and register with the global canvas.
 *  3. First frames rendered → crossfade fallback out.
 *  4. Section scrolls off screen → stop rendering *and* updating it
 *     (activeRef = false); canvas sleeps if nothing else is visible.
 *  5. WebGL lost / error / measured too slow → fallback comes back automatically.
 *
 * Hover/pointer are tracked on the nearest ancestor marked `data-scene-host`
 * (e.g. a whole service card), falling back to this element — so a scene can
 * react when the *card* is hovered, not only the canvas area.
 */
export function SceneView({ scene, fallback, className, params = NO_PARAMS }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const activeRef = useRef(false);
  const hoverRef = useRef(false);
  const localPointer = useRef<ScenePointer>({ x: 0, y: 0 });
  const tier = useDeviceTier();
  const reducedMotion = useReducedMotion();
  const threeDisabled = useSceneStore(selectThreeDisabled);

  const [near, setNear] = useState(false); // close enough to start loading
  const [visible, setVisible] = useState(false); // actually on screen
  const [ready, setReady] = useState(false); // first frames drawn

  // Two observers: a wide one to preload, a tight one to toggle rendering.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const nearIO = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setNear(true), // one-way: stays loaded
      { rootMargin: "100% 0px" },
    );
    const visibleIO = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    nearIO.observe(el);
    visibleIO.observe(el);
    return () => {
      nearIO.disconnect();
      visibleIO.disconnect();
    };
  }, []);

  // Hover + local pointer, written to refs (no re-renders while moving).
  useEffect(() => {
    const host = ref.current?.closest<HTMLElement>("[data-scene-host]") ?? ref.current;
    if (!host) return;
    const enter = () => (hoverRef.current = true);
    const leave = () => {
      hoverRef.current = false;
      localPointer.current.x = 0;
      localPointer.current.y = 0;
    };
    const move = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      localPointer.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      localPointer.current.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
    };
    host.addEventListener("pointerenter", enter);
    host.addEventListener("pointerleave", leave);
    host.addEventListener("pointermove", move, { passive: true });
    return () => {
      host.removeEventListener("pointerenter", enter);
      host.removeEventListener("pointerleave", leave);
      host.removeEventListener("pointermove", move);
    };
  }, []);

  const enabled = tier !== null && tier !== "low" && !threeDisabled && near;

  // Ask the layout to mount the global canvas the first time 3D is needed.
  useEffect(() => {
    if (enabled) useSceneStore.getState().requestCanvas();
  }, [enabled]);

  // Tell the canvas whether it needs to keep rendering for us, and let the
  // scene's useFrame know (via ref — no re-render of the scene).
  useEffect(() => {
    activeRef.current = enabled && visible;
    if (!(enabled && visible)) return;
    return useSceneStore.getState().showView();
  }, [enabled, visible]);

  const handleReady = useCallback(() => setReady(true), []);
  const showFallback = !(enabled && ready);

  return (
    // Decorative: all meaning is also in the page's real text.
    <div ref={ref} aria-hidden="true" className={className}>
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-1000 ease-premium",
          showFallback ? "opacity-100" : "opacity-0 [&_*]:[animation-play-state:paused]",
        )}
      >
        {fallback}
      </div>

      {/* TS narrows `tier` to "high" | "medium" through `enabled`. */}
      {enabled && (
        <ViewPortal
          scene={scene}
          visible={visible}
          onReady={handleReady}
          activeRef={activeRef}
          hoverRef={hoverRef}
          localPointer={localPointer}
          params={params}
          tier={tier}
          reducedMotion={reducedMotion}
        />
      )}
    </div>
  );
}
