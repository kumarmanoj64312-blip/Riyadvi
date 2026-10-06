/**
 * Compact SVG for hundreds of dots/lines.
 *
 * Instead of one <circle> per dot (thousands of DOM nodes — each also
 * serialized into the RSC payload and hydrated by React), dots are drawn as
 * zero-length path segments: "M x y h0" with stroke-linecap="round" renders a
 * perfect circle of diameter = strokeWidth. Dots are bucketed by opacity/size
 * so a whole formation becomes a handful of <path> elements.
 */
export type Dot = { x: number; y: number; o: number; r?: number };

const f = (n: number) => Math.round(n * 10) / 10;

/** Groups dots into (opacity × radius) buckets → one path `d` per bucket. */
export function dotPaths(dots: Dot[], opacitySteps = 4) {
  const buckets = new Map<string, { o: number; r: number; d: string[] }>();
  for (const dot of dots) {
    const o = Math.max(1, Math.round(dot.o * opacitySteps)) / opacitySteps;
    const r = f(dot.r ?? 2);
    const key = `${o}|${r}`;
    if (!buckets.has(key)) buckets.set(key, { o, r, d: [] });
    buckets.get(key)!.d.push(`M${f(dot.x)} ${f(dot.y)}h0`);
  }
  return [...buckets.values()].map((b) => ({ opacity: b.o, width: b.r * 2, d: b.d.join("") }));
}

/** All line segments in one path `d`. */
export function linesPath(lines: [number, number, number, number][]) {
  return lines.map(([x1, y1, x2, y2]) => `M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}`).join("");
}
