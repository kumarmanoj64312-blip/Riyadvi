/*
 * Static hero visual: Server Component, zero JS.
 *
 * The same idea as the 3D "flowing gold" hero (FlowTubes): thick satin tubes
 * winding through the dark, drawn as a few wide stroked curves with a gold
 * gradient and a thin highlight line on each. It fills the whole hero
 * (preserveAspectRatio "slice"), like the 3D stage. Shown during first paint,
 * on low-tier devices and when WebGL is unavailable.
 */
const TUBES = [
  { d: "M-80 160 C 220 40, 420 360, 720 230 S 1180 60, 1520 260", w: 70, o: 0.55 },
  { d: "M-60 620 C 260 520, 380 760, 700 640 S 1150 420, 1500 560", w: 90, o: 0.6 },
  { d: "M380 -60 C 300 200, 620 300, 520 520 S 640 860, 760 980", w: 55, o: 0.4 },
  { d: "M1180 -40 C 1060 220, 1340 380, 1120 600 S 1080 860, 1260 980", w: 80, o: 0.5 },
  { d: "M-40 400 C 200 330, 340 470, 560 420", w: 40, o: 0.35 },
];

export function HeroFallback() {
  return (
    <div className="absolute inset-0">
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full" role="presentation">
        <defs>
          <linearGradient id="hf-tube" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1a140c" />
            <stop offset="45%" stopColor="#6b4c18" />
            <stop offset="70%" stopColor="#b8941f" />
            <stop offset="100%" stopColor="#2a1d0b" />
          </linearGradient>
        </defs>
        {TUBES.map((t) => (
          <g key={t.d} opacity={t.o}>
            <path d={t.d} fill="none" stroke="url(#hf-tube)" strokeWidth={t.w} strokeLinecap="round" />
            <path
              d={t.d}
              fill="none"
              stroke="#f5e27a"
              strokeOpacity="0.25"
              strokeWidth={t.w * 0.08}
              strokeLinecap="round"
              transform={`translate(0 ${-t.w * 0.22})`}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
