"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { selectThreeDisabled, useSceneStore } from "@/three/state/sceneStore";
import { SceneErrorBoundary } from "@/three/canvas/SceneErrorBoundary";

// Code-split: Three.js + R3F + Drei (~250 kB gz) live in this chunk and are
// only requested when the conditions below are met.
const SceneCanvas = dynamic(() => import("@/three/canvas/SceneCanvas"), { ssr: false });

/**
 * Resolves once the page has loaded AND the main thread is idle, so hydration
 * and the first interactions are never competing with 3D start-up (bundle
 * download, scene building, shader compilation). Touch devices — usually
 * slower CPUs — give the page a little longer to settle. The SVG fallbacks
 * hold the space meanwhile, then crossfade to 3D.
 */
function useIdleAfterLoad(extraDelayMs: number) {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let idleId: number | undefined;
    const schedule = () => {
      timer = setTimeout(() => {
        if ("requestIdleCallback" in window) idleId = window.requestIdleCallback(() => setIdle(true), { timeout: 2000 });
        else setIdle(true);
      }, extraDelayMs);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      window.removeEventListener("load", schedule);
      if (timer) clearTimeout(timer);
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
    };
  }, [extraDelayMs]);
  return idle;
}

/**
 * Mounted once in the (site) layout. Decides *whether* and *when* the global
 * canvas exists:
 *   - device tier known and not "low" (includes an on-device GPU benchmark)
 *   - WebGL hasn't failed, and the device wasn't measured as too slow
 *   - some page has actually requested 3D (pages without scenes never pay)
 *   - the page is loaded and the main thread is idle
 */
export function SceneRoot() {
  const tier = useDeviceTier();
  const requested = useSceneStore((s) => s.canvasRequested);
  const disabled = useSceneStore(selectThreeDisabled); // WebGL lost or measured too slow
  const idle = useIdleAfterLoad(tier === "medium" ? 1500 : 0);

  if (!tier || tier === "low" || disabled || !requested || !idle) return null;

  return (
    <SceneErrorBoundary>
      <SceneCanvas tier={tier} />
    </SceneErrorBoundary>
  );
}
