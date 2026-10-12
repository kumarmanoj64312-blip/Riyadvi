/**
 * Bridge between the case-study stage (DOM: pinned section, caption, dots)
 * and its 3D ring.
 *
 * DOM → 3D: `progress` (0 → 1) from the pinned ScrollTrigger; the ring turns to it.
 * 3D → DOM: clicking the front screen calls `onOpen(slug)` (the stage navigates).
 *
 * Plain mutable module state: nothing here triggers a React render per frame.
 */
export const workState = {
  progress: 0,
  onOpen: null as ((slug: string) => void) | null,
};
