"use client";

import "@/three/utils/threeConsole"; // must run before R3F creates its clock
import { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { View } from "@react-three/drei";
import { TIER_SETTINGS } from "@/lib/device";
import { useSceneStore } from "@/three/state/sceneStore";
import { startInputTracking } from "@/three/state/input";
import { FrameGuard } from "@/three/canvas/FrameGuard";

/**
 * THE one WebGL canvas for the whole site.
 *
 * It's a fixed, full-viewport, transparent layer *behind* the page content.
 * Each section that wants 3D renders a <View> (see SceneView): an empty DOM
 * box. Every frame, Drei's View reads that box's on-screen rectangle and draws
 * its scene into exactly that region of this canvas (viewport + scissor).
 *
 * Why one canvas instead of one per section:
 * - Browsers allow only ~16 live WebGL contexts; the home page alone has 9+
 *   3D areas (hero, story, six service tiles, constellation).
 * - Shaders/geometries are compiled & uploaded once and shared.
 * - It survives route changes (lives in the (site) layout), so navigating
 *   between pages never re-creates the GL context.
 *
 * This file is loaded with next/dynamic (ssr: false) only on capable devices,
 * so Three.js never ships to "low" tier devices.
 */
export default function SceneCanvas({ tier }: { tier: "high" | "medium" }) {
  // Render loop runs only while at least one 3D section is on screen.
  const anyVisible = useSceneStore((s) => s.visibleViews > 0);
  const markWebglLost = useSceneStore((s) => s.markWebglLost);

  useEffect(() => startInputTracking(), []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        // Pointer events are captured on <body> and routed to whichever View
        // is under the cursor — needed because the canvas sits behind content.
        eventSource={document.body}
        eventPrefix="client"
        frameloop={anyVisible ? "always" : "never"}
        dpr={TIER_SETTINGS[tier].dpr}
        gl={{
          alpha: true, // transparent: page background shows through
          antialias: true, // thin connection lines look broken without MSAA
          powerPreference: "high-performance",
          stencil: false,
        }}
        onCreated={({ gl }) => {
          // GPU reset / driver crash / too many contexts → swap every scene
          // for its static fallback instead of leaving black rectangles.
          gl.domElement.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            markWebglLost();
          });
        }}
      >
        <View.Port />
        <FrameGuard />
      </Canvas>
    </div>
  );
}
