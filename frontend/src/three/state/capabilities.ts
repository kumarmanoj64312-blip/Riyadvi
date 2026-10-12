/**
 * Bridge between the capabilities list (DOM) and its 3D layer stack.
 *
 * DOM → 3D: which layer is active (the scene reads it every frame).
 * 3D → DOM: hovering a slab in the scene calls `onPick`, which the list
 *           registers, so the list and the detail panel follow the 3D too.
 *
 * Plain mutable module state: nothing here triggers a React render per frame.
 */
export const capabilityState = {
  active: 0,
  onPick: null as ((index: number) => void) | null,
};
