"use client";

import { Component, type ReactNode } from "react";
import { useSceneStore } from "@/three/state/sceneStore";

/**
 * Catches any error thrown while creating the WebGL renderer or rendering a
 * scene (R3F re-throws scene errors to the DOM tree around <Canvas>).
 * Instead of crashing the page, it flags WebGL as lost so every SceneView
 * shows its static fallback. Content and CTAs are never affected.
 */
export class SceneErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("[3D] disabled after error:", error);
    useSceneStore.getState().markWebglLost();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
