import { setConsoleFunction } from "three";

/**
 * Routes Three.js log output through one place (Three's official hook).
 *
 * R3F 9.x (latest stable) still creates a `THREE.Clock`, which Three r183+
 * deprecated, so every canvas start logs "THREE.Clock: This module has been
 * deprecated". It's third-party and harmless; R3F v10 switches to THREE.Timer.
 * We drop ONLY that exact message — every other Three warning/error passes
 * through unchanged. Remove this file once R3F v10 is stable.
 */
const IGNORED = ["THREE.Clock: This module has been deprecated"];

setConsoleFunction((level: "log" | "warn" | "error", message: string, ...params: unknown[]) => {
  if (IGNORED.some((text) => message.startsWith(text))) return;
  console[level](message, ...params);
});
