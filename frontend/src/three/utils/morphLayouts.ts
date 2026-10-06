/**
 * The six point formations of the transformation story — one per stage.
 * Pure maths (no Three.js), so the server-rendered SVG fallback can draw the
 * exact same shapes.
 *
 * Every formation has the SAME number of points. Point i in formation k flies
 * to point i in formation k+1, so the GPU can blend between them.
 * Everything fits roughly inside a ±3.2 unit box centred on the origin.
 */
import { buildEdges, fibonacciSphere, mulberry32 } from "@/three/utils/network";

export const STAGE_COUNT = 6;

type Rand = () => number;
type Formation = (n: number, rand: Rand) => Float32Array;

/** Roughly-normal random number (sum of uniforms) — for soft clusters. */
const gauss = (rand: Rand) => (rand() + rand() + rand() - 1.5) / 1.5;

/** Writes n points evenly along the segment a→b into out, starting at `offset`. */
function segment(out: Float32Array, offset: number, n: number, a: number[], b: number[], rand: Rand) {
  for (let i = 0; i < n; i++) {
    const t = rand();
    for (let c = 0; c < 3; c++) out[(offset + i) * 3 + c] = a[c] + (b[c] - a[c]) * t;
  }
}

/** Spreads `total` points across segments in proportion to their length. */
function segmentsToPoints(out: Float32Array, start: number, total: number, segs: [number[], number[]][], rand: Rand) {
  const lengths = segs.map(([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]));
  const sum = lengths.reduce((s, l) => s + l, 0);
  let written = 0;
  segs.forEach(([a, b], i) => {
    const n = i === segs.length - 1 ? total - written : Math.round((lengths[i] / sum) * total);
    segment(out, start + written, n, a, b, rand);
    written += n;
  });
}

/** 0 · Challenge — scattered fragments: loose clumps + noise, no structure. */
const scattered: Formation = (n, rand) => {
  const out = new Float32Array(n * 3);
  const clumps = Array.from({ length: 14 }, () => [gauss(rand) * 2.6, gauss(rand) * 2, gauss(rand) * 2]);
  for (let i = 0; i < n; i++) {
    if (rand() < 0.3) {
      // pure noise inside a sphere
      const r = 3.2 * Math.cbrt(rand());
      const th = rand() * Math.PI * 2;
      const ph = Math.acos(2 * rand() - 1);
      out.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)], i * 3);
    } else {
      const c = clumps[Math.floor(rand() * clumps.length)];
      out.set([c[0] + gauss(rand) * 0.4, c[1] + gauss(rand) * 0.4, c[2] + gauss(rand) * 0.4], i * 3);
    }
  }
  return out;
};

/** 1 · Strategy — an orderly grid, tilted like a blueprint on a table. */
const grid: Formation = (n) => {
  const out = new Float32Array(n * 3);
  const cols = Math.ceil(Math.sqrt(n * 1.6));
  const rows = Math.ceil(n / cols);
  const tilt = -0.9; // radians around X
  for (let i = 0; i < n; i++) {
    const x = ((i % cols) / (cols - 1) - 0.5) * 6;
    const y = (Math.floor(i / cols) / Math.max(1, rows - 1) - 0.5) * 4;
    out.set([x, y * Math.cos(tilt), y * Math.sin(tilt)], i * 3);
  }
  return out;
};

/** 2 · Design — a structured form: outer + inner wireframe cube joined at corners. */
const structure: Formation = (n, rand) => {
  const out = new Float32Array(n * 3);
  const cube = (s: number) => {
    const c = [-s, s];
    const v = c.flatMap((x) => c.flatMap((y) => c.map((z) => [x, y, z])));
    // edges = vertex pairs differing in exactly one axis
    const e: [number[], number[]][] = [];
    for (let a = 0; a < 8; a++)
      for (let b = a + 1; b < 8; b++)
        if (v[a].filter((x, k) => x !== v[b][k]).length === 1) e.push([v[a], v[b]]);
    return { v, e };
  };
  const outer = cube(1.6);
  const inner = cube(0.75);
  const joins = outer.v.map((p, i) => [p, inner.v[i]] as [number[], number[]]);
  segmentsToPoints(out, 0, n, [...outer.e, ...inner.e, ...joins], rand);
  return out;
};

/** 3 · Technology — a connected network: node clusters + points along links. */
const network: Formation = (n, rand) => {
  const out = new Float32Array(n * 3);
  const nodes = fibonacciSphere(26, { radius: 2.3, depthJitter: 0.3, seed: 5 });
  const edges = buildEdges(nodes, { neighbours: 2, maxDistance: 2.2 });
  const node = (k: number) => [nodes[k * 3], nodes[k * 3 + 1], nodes[k * 3 + 2]];
  const nodePoints = Math.floor(n * 0.35);
  for (let i = 0; i < nodePoints; i++) {
    const c = node(Math.floor(rand() * 26));
    out.set([c[0] + gauss(rand) * 0.12, c[1] + gauss(rand) * 0.12, c[2] + gauss(rand) * 0.12], i * 3);
  }
  const links: [number[], number[]][] = [];
  for (let e = 0; e < edges.length / 2; e++) links.push([node(edges[e * 2]), node(edges[e * 2 + 1])]);
  segmentsToPoints(out, nodePoints, n - nodePoints, links, rand);
  return out;
};

/** 4 · Launch — a double helix rising from a launch ring, narrowing as it climbs. */
const helix: Formation = (n, rand) => {
  const out = new Float32Array(n * 3);
  const ringPoints = Math.floor(n * 0.15);
  for (let i = 0; i < n; i++) {
    if (i < ringPoints) {
      const a = rand() * Math.PI * 2;
      out.set([Math.cos(a) * 1.9, -2.7, Math.sin(a) * 1.9], i * 3);
      continue;
    }
    const t = rand();
    const strand = rand() < 0.5 ? 0 : Math.PI;
    const angle = t * Math.PI * 5 + strand;
    const r = 1.5 * (1 - t * 0.65);
    out.set([Math.cos(angle) * r + gauss(rand) * 0.05, -2.7 + t * 5.6, Math.sin(angle) * r + gauss(rand) * 0.05], i * 3);
  }
  return out;
};

/** 5 · Growth — a rising 3D bar chart topped by a trend line. */
const bars: Formation = (n, rand) => {
  const out = new Float32Array(n * 3);
  const count = 7;
  const base = -2.4;
  const segs: [number[], number[]][] = [];
  const tops: number[][] = [];
  for (let b = 0; b < count; b++) {
    const x = -3 + (b / (count - 1)) * 6;
    const h = 0.6 * Math.pow(1.38, b); // exponential growth: 0.6 → ~4.1
    const w = 0.28;
    const corners = [
      [x - w, -w],
      [x + w, -w],
      [x + w, w],
      [x - w, w],
    ];
    for (let k = 0; k < 4; k++) {
      const [cx, cz] = corners[k];
      const [nx, nz] = corners[(k + 1) % 4];
      segs.push([[cx, base, cz], [cx, base + h, cz]]); // vertical edge
      segs.push([[cx, base + h, cz], [nx, base + h, nz]]); // top edge
      segs.push([[cx, base, cz], [nx, base, nz]]); // bottom edge
    }
    tops.push([x, base + h + 0.45, 0]);
  }
  const trendPoints = Math.floor(n * 0.12);
  segmentsToPoints(out, 0, n - trendPoints, segs, rand);
  const trend = tops.slice(1).map((t, i) => [tops[i], t] as [number[], number[]]);
  segmentsToPoints(out, n - trendPoints, trendPoints, trend, rand);
  return out;
};

const FORMATIONS: Formation[] = [scattered, grid, structure, network, helix, bars];

/** Builds all six formations for `n` points (deterministic for a given seed). */
export function buildMorphLayouts(n: number, seed = 11): Float32Array[] {
  return FORMATIONS.map((make, k) => make(n, mulberry32(seed + k * 101)));
}
