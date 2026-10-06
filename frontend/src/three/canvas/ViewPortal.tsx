"use client";

import { Suspense, useRef } from "react";
import { View } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { sceneRegistry, type SceneKey } from "@/three/scenes/registry";
import type { SceneProps } from "@/three/scenes/types";

type Props = SceneProps & {
  scene: SceneKey;
  visible: boolean;
  onReady: () => void;
};

/**
 * The WebGL side of a SceneView.
 *
 * Drei's <View> renders an empty <div> here in the DOM and "tunnels" its
 * children into <View.Port /> inside the global canvas. `visible={false}`
 * makes the canvas skip drawing this view entirely.
 */
export default function ViewPortal({ scene, visible, onReady, ...sceneProps }: Props) {
  const Scene = sceneRegistry[scene];

  return (
    <View className="absolute inset-0" visible={visible}>
      <Suspense fallback={null}>
        <Scene {...sceneProps} />
        <ReadySignal onReady={onReady} />
      </Suspense>
    </View>
  );
}

/**
 * Fires onReady after a couple of rendered frames. The first frame is where
 * shaders compile (the expensive hitch), so we keep the fallback on screen
 * until that's over, then crossfade.
 */
function ReadySignal({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  useFrame(() => {
    frames.current += 1;
    if (frames.current === 3) onReady();
  });
  return null;
}
