/**
 * World-space size of what a perspective camera sees at the z = 0 plane.
 *
 * Why not R3F's `viewport`? Inside a Drei <View> the scene has its own camera
 * and its own rectangle, and `viewport` isn't reliably derived from those —
 * it caused scenes to render at the wrong scale. This is the plain geometry:
 *
 *   visibleHeight = 2 · distance · tan(fov / 2)
 *   visibleWidth  = visibleHeight · (rectWidth / rectHeight)
 */
export function visibleArea(fovDeg: number, distance: number, size: { width: number; height: number }) {
  const height = 2 * distance * Math.tan((fovDeg * Math.PI) / 360);
  const aspect = size.height > 0 ? size.width / size.height : 1;
  return { width: height * aspect, height };
}
