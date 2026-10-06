/**
 * Pure maths for the "connected ecosystem" network — no Three.js imports, so
 * the same functions build both the WebGL scene and the server-rendered SVG
 * fallback (identical layout whether or not the device gets 3D).
 */

/** Small deterministic PRNG. Same seed → same network on server and client. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * Evenly distributes `count` points over a sphere (Fibonacci lattice), then
 * pushes each one in/out by a random amount so the shell has depth instead of
 * looking like a perfect ball. Returns a flat [x,y,z, x,y,z, …] array —
 * the format GPU buffers want.
 */
export function fibonacciSphere(
  count: number,
  { radius = 2.4, depthJitter = 0.35, seed = 2021 } = {},
): Float32Array {
  const rand = mulberry32(seed);
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2; // 1 → -1
    const ring = Math.sqrt(1 - y * y); // radius of the horizontal slice
    const theta = GOLDEN_ANGLE * i;
    const r = radius * (1 + (rand() - 0.5) * depthJitter);
    out[i * 3] = Math.cos(theta) * ring * r;
    out[i * 3 + 1] = y * r;
    out[i * 3 + 2] = Math.sin(theta) * ring * r;
  }
  return out;
}

/**
 * Links every node to its nearest neighbours (k-nearest within maxDistance).
 * Runs ONCE when the scene mounts: ~110 nodes → ~12k distance checks, well
 * under a millisecond. Nothing is recomputed per frame because the nodes
 * never move relative to each other — the whole group rotates instead.
 *
 * Returns unique edges as [a0,b0, a1,b1, …] node-index pairs.
 */
export function buildEdges(
  positions: Float32Array,
  { neighbours = 3, maxDistance = 1.6 } = {},
): Uint16Array {
  const count = positions.length / 3;
  const seen = new Set<number>();
  const edges: number[] = [];
  const maxSq = maxDistance * maxDistance;

  for (let i = 0; i < count; i++) {
    const candidates: { j: number; d: number }[] = [];
    for (let j = 0; j < count; j++) {
      if (j === i) continue;
      const dx = positions[i * 3] - positions[j * 3];
      const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
      const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
      const d = dx * dx + dy * dy + dz * dz;
      if (d <= maxSq) candidates.push({ j, d });
    }
    candidates.sort((a, b) => a.d - b.d);

    for (const { j } of candidates.slice(0, neighbours)) {
      const key = i < j ? i * count + j : j * count + i; // order-independent id
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push(i, j);
    }
  }
  return Uint16Array.from(edges);
}

/** For each node, the list of edge indices touching it (for hover highlight). */
export function buildAdjacency(edges: Uint16Array, count: number): number[][] {
  const adj: number[][] = Array.from({ length: count }, () => []);
  for (let e = 0; e < edges.length / 2; e++) {
    adj[edges[e * 2]].push(e);
    adj[edges[e * 2 + 1]].push(e);
  }
  return adj;
}

/** Everything the hero network needs, built from one call. */
export function buildNetwork(count: number, seed = 2021) {
  const positions = fibonacciSphere(count, { seed });
  const edges = buildEdges(positions);
  const adjacency = buildAdjacency(edges, count);

  // A few "hub" nodes are larger — reads as a real system with key services.
  const rand = mulberry32(seed + 1);
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i++) sizes[i] = rand() > 0.9 ? 1.8 : 0.7 + rand() * 0.5;

  return { count, positions, edges, adjacency, sizes };
}

export type Network = ReturnType<typeof buildNetwork>;
