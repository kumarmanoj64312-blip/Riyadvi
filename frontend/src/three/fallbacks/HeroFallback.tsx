import { buildNetwork } from "@/three/utils/network";
import { palette } from "@/lib/theme";
import { dotPaths, linesPath } from "@/three/fallbacks/svgDots";

/*
 * Static hero visual — Server Component, zero JS.
 *
 * Built from the SAME buildNetwork() as the 3D scene, projected to 2D at
 * build time. So low-tier devices, no-WebGL browsers, and everyone during the
 * first paint see the same network shape the 3D version will show.
 */
const SIZE = 600;
const network = buildNetwork(70);

// Tilt the sphere a little, then orthographic-project to the SVG plane.
const ry = 0.6;
const rx = 0.35;
const points = Array.from({ length: network.count }, (_, i) => {
  const [x0, y0, z0] = network.positions.subarray(i * 3, i * 3 + 3);
  const x1 = x0 * Math.cos(ry) + z0 * Math.sin(ry);
  const z1 = -x0 * Math.sin(ry) + z0 * Math.cos(ry);
  const y1 = y0 * Math.cos(rx) - z1 * Math.sin(rx);
  const z2 = y0 * Math.sin(rx) + z1 * Math.cos(rx);
  const depth = (z2 + 3) / 6; // 0 (back) → 1 (front)
  return {
    x: +(SIZE / 2 + x1 * 95).toFixed(1),
    y: +(SIZE / 2 - y1 * 95).toFixed(1),
    r: +((1.6 + depth * 2.4) * network.sizes[i]).toFixed(2),
    o: +(0.25 + depth * 0.75).toFixed(2),
  };
});

const edgesD = linesPath(
  Array.from({ length: network.edges.length / 2 }, (_, e) => {
    const a = points[network.edges[e * 2]];
    const b = points[network.edges[e * 2 + 1]];
    return [a.x, a.y, b.x, b.y] as [number, number, number, number];
  }),
);

export function HeroFallback() {
  return (
    // Fills the hero's square graphic box (sized by its column, not the window).
    <div className="absolute inset-0 flex items-center justify-center">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="h-full w-full opacity-80"
        role="presentation"
      >
        <defs>
          <radialGradient id="hero-fallback-core" cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor={palette.goldLight} stopOpacity="0.55" />
            <stop offset="45%" stopColor={palette.gold} stopOpacity="0.18" />
            <stop offset="100%" stopColor={palette.gold} stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx={SIZE / 2} cy={SIZE / 2} r="150" fill="url(#hero-fallback-core)" />

        {/* Slow CSS rotation (auto-disabled by the global reduced-motion rule). */}
        <g className="origin-center animate-[spin_180s_linear_infinite] [transform-box:fill-box]">
          {/* One path for all links + a few bucketed dot paths (see svgDots.ts) */}
          <path d={edgesD} stroke={palette.goldDark} strokeOpacity="0.4" strokeWidth="0.8" fill="none" />
          {dotPaths(points).map((b) => (
            <path key={`${b.opacity}-${b.width}`} d={b.d} stroke={palette.gold} strokeOpacity={b.opacity} strokeWidth={b.width} strokeLinecap="round" fill="none" />
          ))}
        </g>
      </svg>
    </div>
  );
}
