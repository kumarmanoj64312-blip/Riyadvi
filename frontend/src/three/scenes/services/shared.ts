import type { RefObject } from "react";
import type { SceneProps } from "@/three/scenes/types";
import { palette } from "@/lib/theme";

/**
 * Props for each service visual. `hover` is a smoothed 0→1 value (damped in
 * ServiceScene) — scenes blend between "idle" and "engaged" states with it
 * instead of snapping on hover.
 */
export type VariantProps = SceneProps & {
  hover: RefObject<number>;
  isHero: boolean;
};

/** Common material settings so the six visuals read as one family. */
export const looks = {
  glass: { color: "#101010", metalness: 0.4, roughness: 0.35 },
  panel: { color: "#1c1c1c", metalness: 0.2, roughness: 0.6 },
  gold: { color: palette.gold, metalness: 1, roughness: 0.28 },
  goldMatte: { color: palette.goldDark, metalness: 0.6, roughness: 0.5 },
  ink: { color: palette.fg, metalness: 0, roughness: 0.8 },
} as const;
