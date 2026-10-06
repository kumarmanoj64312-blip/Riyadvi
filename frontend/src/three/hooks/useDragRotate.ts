"use client";

import { useRef } from "react";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";

const { damp, clamp, euclideanModulo } = THREE.MathUtils;

/** Shortest signed angle from b to a, in (-π, π]. */
const angleDelta = (a: number, b: number) => euclideanModulo(a - b + Math.PI, Math.PI * 2) - Math.PI;

type Options = {
  enabled: boolean;
  /** Called on a click/tap that didn't turn into a drag (< 6px of movement). */
  onTap?: () => void;
  initialTilt?: number;
};

/**
 * Drag-to-rotate with inertia — a tiny orbit control that works inside a
 * Drei <View> (Drei's OrbitControls binds to the shared canvas element and
 * would capture pointer events for the whole page).
 *
 * Usage: spread `handlers` on an (invisible) hit mesh, call `step()` in
 * useFrame and apply the returned rotation to your object.
 */
export function useDragRotate({ enabled, onTap, initialTilt = 0.2 }: Options) {
  const state = useRef({ active: false, lastX: 0, lastY: 0, moved: 0, velX: 0, velY: 0, rotX: initialTilt, rotY: 0 });

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    // R3F pointer capture: keeps receiving moves even off the object.
    (e.target as Element).setPointerCapture?.(e.pointerId);
    Object.assign(state.current, { active: true, lastX: e.clientX, lastY: e.clientY, moved: 0 });
    document.body.style.cursor = "grabbing";
  };
  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    const s = state.current;
    if (!s.active) return;
    const dx = e.clientX - s.lastX;
    const dy = e.clientY - s.lastY;
    s.moved += Math.abs(dx) + Math.abs(dy);
    s.velY = dx * 0.6; // pointer speed → angular velocity
    s.velX = dy * 0.6;
    s.lastX = e.clientX;
    s.lastY = e.clientY;
  };
  const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
    const s = state.current;
    if (!s.active) return;
    s.active = false;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    document.body.style.cursor = "grab";
    if (s.moved < 6) onTap?.();
  };

  const handlers = enabled
    ? {
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onPointerCancel: onPointerUp,
        onPointerOver: () => (document.body.style.cursor = "grab"),
        onPointerOut: () => !state.current.active && (document.body.style.cursor = ""),
      }
    : {};

  /**
   * Advance one frame. Idle behaviour when not dragging:
   *  - { spin }        → keep turning at `spin` rad/s (turntable)
   *  - { swayTarget }  → ease back to face the viewer at that angle
   */
  const step = (dt: number, idle: { spin?: number; swayTarget?: number }) => {
    const s = state.current;
    if (!s.active) {
      s.velX = damp(s.velX, 0, 3, dt);
      s.velY = damp(s.velY, idle.spin ?? 0, 2, dt);
    }
    s.rotY += s.velY * dt;
    s.rotX = clamp(s.rotX + s.velX * dt, -1.2, 1.2);

    if (!s.active && idle.swayTarget !== undefined) {
      // Unwrap so we return the short way round after a long spin.
      s.rotY = idle.swayTarget + angleDelta(s.rotY, idle.swayTarget);
      s.rotY = damp(s.rotY, idle.swayTarget, 1.2, dt);
      s.rotX = damp(s.rotX, initialTilt, 1.2, dt);
    }
    return s;
  };

  return { handlers, step, state };
}
