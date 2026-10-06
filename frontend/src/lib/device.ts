/**
 * Device capability tiering for 3D.
 *
 * Every WebGL scene asks one question — "how much can this device handle?" —
 * and gets one of three answers:
 *
 *   high   → full scene: max node counts, glass/transmission, bloom, DPR up to 1.5
 *   medium → reduced node counts, cheaper materials, no post-processing, DPR 1
 *   low    → no WebGL at all; render the static CSS/SVG fallback
 *
 * Why not `detect-gpu`? It downloads benchmark tables from a CDN at runtime.
 * Instead we combine browser signals with a few-ms on-device GPU
 * micro-benchmark (benchmarkGpu) -- zero network cost, and it measures THIS
 * device rather than looking up its model.
 *
 * All functions here are browser-only; call them from effects / client hooks.
 */

export type DeviceTier = "high" | "medium" | "low";

export interface DeviceSignals {
  webgl: boolean; // can we create a WebGL2 (or WebGL1) context at all?
  softwareRenderer: boolean; // GPU is emulated on the CPU (SwiftShader, llvmpipe…)
  cores: number; // navigator.hardwareConcurrency
  memoryGB: number | null; // navigator.deviceMemory (Chromium only)
  viewportWidth: number;
  coarsePointer: boolean; // touch-first device (phones/tablets)
  reducedMotion: boolean;
  saveData: boolean; // user enabled "data saver"
  gpuMs: number | null; // micro-benchmark: time for a fixed fragment-shader workload
}

/** Renderer names that mean "no real GPU" — 3D would run on the CPU and crawl. */
const SOFTWARE_RENDERERS = /swiftshader|llvmpipe|softpipe|software|basic render/i;

/**
 * Benchmark thresholds (ms for the workload below), tuned from measurements:
 * desktop GPU (Iris Xe) 3.3 ms vs CPU-emulated WebGL (SwiftShader) 33.8 ms.
 */
const GPU_MS_LOW = 20; // slower than this -> no WebGL (fallbacks)
const GPU_MS_MEDIUM = 9; // slower than this -> lighter scenes

/**
 * GPU micro-benchmark: draws a 512x512 full-screen pass with a loop-heavy
 * fragment shader twice and forces completion with readPixels. A real GPU
 * finishes in a few ms; CPU-emulated WebGL takes tens to hundreds of ms.
 * This catches slow/emulated GPUs even when the renderer name is masked
 * (privacy settings, some headless browsers) -- measure, don't guess.
 */
function benchmarkGpu(gl: WebGLRenderingContext | WebGL2RenderingContext): number | null {
  try {
    const size = 512;
    gl.canvas.width = size;
    gl.canvas.height = size;
    gl.viewport(0, 0, size, size);
    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}"));
    gl.attachShader(
      prog,
      compile(
        gl.FRAGMENT_SHADER,
        "precision mediump float;void main(){float v=0.;for(int i=0;i<96;i++){v+=sin(gl_FragCoord.x*.013+float(i))*cos(gl_FragCoord.y*.011);}gl_FragColor=vec4(v,v,v,1.);}",
      ),
    );
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); // one big triangle
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const pixel = new Uint8Array(4);

    gl.drawArrays(gl.TRIANGLES, 0, 3); // warm-up (driver compile)
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
    const t0 = performance.now();
    for (let i = 0; i < 2; i++) gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel); // waits for the GPU to finish
    return performance.now() - t0;
  } catch {
    return null;
  }
}

/**
 * Probes WebGL support with a throwaway canvas, then explicitly releases the
 * context. Browsers cap live contexts (~16), so a leaked probe would count
 * against the budget our real scenes need.
 */
function probeWebGL(): { webgl: boolean; softwareRenderer: boolean; gpuMs: number | null } {
  try {
    // failIfMajorPerformanceCaveat: the browser refuses the context if it
    // would be software-rendered (e.g. SwiftShader) — reliable even when the
    // GPU name below is masked for privacy.
    const opts = { failIfMajorPerformanceCaveat: true };
    const canvas = document.createElement("canvas");
    const gl =
      (canvas.getContext("webgl2", opts) as WebGL2RenderingContext | null) ??
      (canvas.getContext("webgl", opts) as WebGLRenderingContext | null);
    if (!gl) return { webgl: false, softwareRenderer: false, gpuMs: null };

    // The unmasked renderer string is the most reliable GPU hint available.
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = debugInfo
      ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL))
      : String(gl.getParameter(gl.RENDERER));

    const softwareRenderer = SOFTWARE_RENDERERS.test(renderer);
    const gpuMs = softwareRenderer ? null : benchmarkGpu(gl); // no need to time a known-slow GPU

    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return { webgl: true, softwareRenderer, gpuMs };
  } catch {
    return { webgl: false, softwareRenderer: false, gpuMs: null };
  }
}

/** Collects every signal the tier decision uses. */
export function readDeviceSignals(): DeviceSignals {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  const { webgl, softwareRenderer, gpuMs } = probeWebGL();

  return {
    webgl,
    softwareRenderer,
    cores: nav.hardwareConcurrency ?? 4,
    memoryGB: nav.deviceMemory ?? null,
    viewportWidth: window.innerWidth,
    coarsePointer: window.matchMedia("(pointer: coarse)").matches,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    saveData: nav.connection?.saveData === true,
    gpuMs,
  };
}

/**
 * Pure decision function (no browser APIs), so it's easy to reason about and
 * unit-test. Order matters: hard blockers first, then downgrades.
 */
export function computeDeviceTier(s: DeviceSignals): DeviceTier {
  // 1. Hard blockers → static fallback.
  if (!s.webgl || s.softwareRenderer || s.saveData) return "low";
  if (s.cores <= 2 || (s.memoryGB !== null && s.memoryGB <= 2)) return "low";
  if (s.gpuMs !== null && s.gpuMs > GPU_MS_LOW) return "low"; // measured: too slow for real-time 3D

  // 2. Downgrades → lighter scene. Phones/tablets have small, thermally-
  //    limited GPUs even when core counts look high.
  if (s.reducedMotion) return "medium"; // keep visuals, scenes also stop animating
  if (s.coarsePointer || s.viewportWidth < 768) return "medium";
  if (s.cores <= 4 || (s.memoryGB !== null && s.memoryGB <= 4)) return "medium";
  if (s.gpuMs !== null && s.gpuMs > GPU_MS_MEDIUM) return "medium";

  // 3. Everything else gets the full experience.
  return "high";
}

/** Per-tier render settings consumed by the R3F <Canvas> and scenes. */
export const TIER_SETTINGS = {
  high: { dpr: [1, 1.5] as [number, number], postprocessing: true, detail: 1 },
  medium: { dpr: [1, 1] as [number, number], postprocessing: false, detail: 0.5 },
  low: { dpr: [1, 1] as [number, number], postprocessing: false, detail: 0 },
} as const;
