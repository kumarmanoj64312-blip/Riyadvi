import { buildMorphLayouts } from "@/three/utils/morphLayouts";
import { palette } from "@/lib/theme";
import { dotPaths } from "@/three/fallbacks/svgDots";

/*
 * Static version of the transformation morph — Server Component.
 * The six SAME formations as the 3D scene, projected to 2D at build time and
 * stacked. The client story timeline crossfades them (via data-story-fallback),
 * so low-tier / no-WebGL visitors still see the shape change with each stage.
 */
const POINTS = 320;
const SIZE = 600;
const layouts = buildMorphLayouts(POINTS);
const ry = 0.35; // slight 3/4 view so 3D formations read as 3D

const projected = layouts.map((layout) =>
  Array.from({ length: POINTS }, (_, i) => {
    const [x, y, z] = layout.subarray(i * 3, i * 3 + 3);
    const px = x * Math.cos(ry) + z * Math.sin(ry);
    const pz = -x * Math.sin(ry) + z * Math.cos(ry);
    return {
      x: +(SIZE / 2 + px * 82).toFixed(1),
      y: +(SIZE / 2 - y * 82).toFixed(1),
      o: +(0.35 + ((pz + 3.5) / 7) * 0.65).toFixed(2), // nearer = brighter
    };
  }),
);

export function MorphFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {projected.map((points, stage) => (
        <svg
          key={stage}
          data-story-fallback={stage}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="presentation"
          className="absolute h-full max-h-[560px] w-full max-w-[560px]"
          style={{ opacity: stage === 0 ? 1 : 0 }}
        >
          {/* ~4 paths per formation instead of 320 <circle> nodes (see svgDots.ts) */}
          {dotPaths(points.map((p) => ({ ...p, r: 2.2 }))).map((b) => (
            <path key={b.opacity} d={b.d} stroke={palette.gold} strokeOpacity={b.opacity} strokeWidth={b.width} strokeLinecap="round" fill="none" />
          ))}
        </svg>
      ))}
    </div>
  );
}
