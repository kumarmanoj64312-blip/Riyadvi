"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useSceneStore } from "@/three/state/sceneStore";

const WARMUP_FRAMES = 2; // first frames compile shaders / upload buffers — ignore
const SAMPLE_FRAMES = 24;
const MAX_AVG_FRAME_MS = 50; // < 20 fps on average → this device can't run the scenes well
const HOPELESS_FRAME_MS = 250; // two frames this slow in a row → give up immediately

/**
 * Runtime safety net for 3D performance. The device tier is a prediction;
 * this MEASURES real frames (ignoring frames that compile shaders). Over the first ~24 rendered frames it averages frame time,
 * and if the device can't sustain ~20 fps the whole site switches to the
 * static fallbacks for the rest of the session (remembered in sessionStorage).
 * Catches slow GPUs, software rendering and thermally throttled phones that
 * slipped through the tier heuristics. Evaluates once, then does nothing.
 */
export function FrameGuard() {
  const state = useRef({ frames: 0, total: 0, slowStreak: 0, programs: 0, done: false });
  const markDegraded = useSceneStore((s) => s.markDegraded);

  useFrame(({ gl }, delta) => {
    const s = state.current;
    if (s.done) return;
    // Scenes mount lazily as you scroll; a frame that compiled new shader
    // programs is a one-off cost, not the device's steady-state speed → skip it.
    const programs = gl.info.programs?.length ?? 0;
    if (programs !== s.programs) {
      s.programs = programs;
      s.slowStreak = 0;
      return;
    }
    s.frames += 1;
    if (s.frames <= WARMUP_FRAMES) return;
    const ms = delta * 1000;
    s.total += ms;
    s.slowStreak = ms > HOPELESS_FRAME_MS ? s.slowStreak + 1 : 0;
    // Bail out early on a clearly hopeless device instead of waiting for all samples.
    const sampled = s.frames - WARMUP_FRAMES;
    const hopeless = s.slowStreak >= 2;
    const avg = s.total / sampled;
    if (hopeless || (sampled >= 5 && avg > MAX_AVG_FRAME_MS * 2) || sampled >= SAMPLE_FRAMES) {
      s.done = true;
      if (hopeless || avg > MAX_AVG_FRAME_MS) {
        console.info(`[3D] frames too slow (avg ${avg.toFixed(0)}ms) — switching to lightweight visuals`);
        markDegraded();
      }
    }
  });

  return null;
}
