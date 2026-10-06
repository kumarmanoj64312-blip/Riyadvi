/**
 * Bridge between the tech constellation's DOM labels and its 3D scene.
 *
 * DOM → 3D: which technology the visitor is hovering/focusing (pauses that
 *           orbit ring and enlarges the node).
 * 3D → DOM: the scene projects every node to screen space each frame and
 *           moves the matching label element directly (style.transform).
 *
 * Plain mutable module state — nothing here triggers a React render.
 */
export const constellation = {
  labels: new Map<string, HTMLElement>(),
  hovered: null as string | null,
  hoveredRing: -1,
};

export function registerLabel(slug: string, el: HTMLElement | null) {
  if (el) constellation.labels.set(slug, el);
  else constellation.labels.delete(slug);
}

/** DOM → 3D: mark a technology (and its ring) as hovered, or clear with null. */
export function setHovered(slug: string | null, ring = -1) {
  constellation.hovered = slug;
  constellation.hoveredRing = slug ? ring : -1;
}
