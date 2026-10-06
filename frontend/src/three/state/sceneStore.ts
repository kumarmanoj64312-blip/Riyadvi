import { create } from "zustand";

/**
 * Global 3D bookkeeping shared by the DOM side (SceneView) and the WebGL side
 * (SceneCanvas). Only low-frequency facts live here — things that change when
 * a section scrolls in/out, never per frame — so subscribers re-render rarely.
 *
 * Per-frame data (pointer, scroll) deliberately lives in plain mutable objects
 * in ./input.ts instead, because React state would re-render 60×/second.
 */
const DEGRADED_KEY = "riyadvi.3d.degraded";

/** Was 3D switched off earlier this session for poor performance? */
function readDegraded() {
  try {
    return typeof window !== "undefined" && sessionStorage.getItem(DEGRADED_KEY) === "1";
  } catch {
    return false;
  }
}

type SceneStore = {
  /** True once any page has asked for 3D. The canvas mounts then and stays
   *  mounted across route changes (no GL context re-creation / shader recompile). */
  canvasRequested: boolean;
  /** How many SceneViews are currently on screen. 0 → canvas stops rendering. */
  visibleViews: number;
  /** Set when WebGL crashes or the GPU drops the context → every view falls back. */
  webglLost: boolean;
  /** Set when measured frame rate is too low → fallbacks for the rest of the session. */
  degraded: boolean;

  requestCanvas: () => void;
  /** Marks one view visible; returns the matching "hidden" cleanup. */
  showView: () => () => void;
  markWebglLost: () => void;
  markDegraded: () => void;
};

export const useSceneStore = create<SceneStore>((set) => ({
  canvasRequested: false,
  visibleViews: 0,
  webglLost: false,
  degraded: readDegraded(),

  requestCanvas: () => set({ canvasRequested: true }),
  showView: () => {
    set((s) => ({ visibleViews: s.visibleViews + 1 }));
    return () => set((s) => ({ visibleViews: Math.max(0, s.visibleViews - 1) }));
  },
  markWebglLost: () => set({ webglLost: true }),
  markDegraded: () => {
    try {
      sessionStorage.setItem(DEGRADED_KEY, "1");
    } catch {}
    set({ degraded: true });
  },
}));

/** 3D is usable right now (not lost, not degraded). */
export const selectThreeDisabled = (s: SceneStore) => s.webglLost || s.degraded;
