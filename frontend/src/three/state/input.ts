/**
 * Per-frame input shared with every 3D scene.
 *
 * These are plain mutable objects, not React state: event listeners write to
 * them and scenes read them inside useFrame. That is the "never re-render per
 * frame" rule — moving the mouse costs two number assignments, not a React
 * render.
 */

/** Pointer position normalised to the viewport: x,y ∈ [-1, 1], +y is up. */
export const pointer = { x: 0, y: 0 };

/**
 * Scroll-driven progress written by GSAP ScrollTrigger, read by 3D scenes.
 * story: 0 → 5 across the six transformation stages (0 = Challenge, 5 = Growth).
 */
export const scrollState = { story: 0 };

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

function onPointerMove(e: PointerEvent) {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
}

/**
 * Device tilt → pointer, so phones get the same parallax as a mouse.
 * gamma = left/right tilt, beta = front/back tilt (≈45° when holding a phone).
 */
function onOrientation(e: DeviceOrientationEvent) {
  if (e.gamma == null || e.beta == null) return;
  pointer.x = clamp(e.gamma / 30);
  pointer.y = clamp((45 - e.beta) / 30);
}

/**
 * Starts listening; returns the cleanup. Called once by SceneCanvas.
 *
 * Tilt is only enabled where the browser grants it without a prompt
 * (Android). iOS requires DeviceOrientationEvent.requestPermission() from a
 * user tap — we don't trigger a permission dialog just for decoration.
 */
export function startInputTracking(): () => void {
  window.addEventListener("pointermove", onPointerMove, { passive: true });

  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  const needsPermission =
    typeof DeviceOrientationEvent !== "undefined" &&
    "requestPermission" in DeviceOrientationEvent;
  const useTilt = isTouch && typeof DeviceOrientationEvent !== "undefined" && !needsPermission;
  if (useTilt) window.addEventListener("deviceorientation", onOrientation, { passive: true });

  return () => {
    window.removeEventListener("pointermove", onPointerMove);
    if (useTilt) window.removeEventListener("deviceorientation", onOrientation);
  };
}
