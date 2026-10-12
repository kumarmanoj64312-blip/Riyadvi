/**
 * Bridge between the technology list (DOM) and the 3D technology globe.
 *
 * DOM → 3D: the technology hovered / focused in the list (the globe pops
 *           that tile forward and pauses its spin).
 * 3D → DOM: hovering a tile in the globe calls `onHover`, which the section
 *           registers, so the description card and list follow the 3D too.
 *
 * Plain mutable module state: nothing here triggers a React render per frame.
 */
export const constellation = {
  hovered: null as string | null,
  onHover: null as ((slug: string | null) => void) | null,
};

/** DOM → 3D: mark a technology as hovered, or clear with null. */
export function setHovered(slug: string | null) {
  constellation.hovered = slug;
}
