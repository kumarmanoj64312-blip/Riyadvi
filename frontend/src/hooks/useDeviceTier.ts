"use client";

import { useSyncExternalStore } from "react";
import { computeDeviceTier, readDeviceSignals, type DeviceTier } from "@/lib/device";

/*
 * The tier is computed once per page load and cached at module level:
 * probing WebGL creates a GL context, which we don't want to repeat for
 * every component that asks. The cache is only invalidated when the
 * reduced-motion preference changes (the one signal that can flip live).
 */
let cachedTier: DeviceTier | null = null;

function getSnapshot(): DeviceTier {
  if (cachedTier === null) cachedTier = computeDeviceTier(readDeviceSignals());
  return cachedTier;
}

function subscribe(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const handle = () => {
    cachedTier = null;
    onChange();
  };
  mq.addEventListener("change", handle);
  return () => mq.removeEventListener("change", handle);
}

/**
 * Returns "high" | "medium" | "low" on the client, and `null` while the
 * server renders / the page hydrates. Scenes treat `null` as "show the static
 * fallback for now" — so first paint is always the lightweight version and
 * WebGL only mounts once we know the device can take it.
 */
export function useDeviceTier(): DeviceTier | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
