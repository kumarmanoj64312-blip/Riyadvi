/**
 * Brand colours for JavaScript consumers (Three.js materials, canvas, SVG
 * attributes). WebGL can't read CSS variables, so these mirror the tokens in
 * src/styles/globals.css — change both together.
 */
export const palette = {
  gold: "#d4af37",
  goldLight: "#f5e27a",
  goldDark: "#b8941f",
  ink: "#000000",
  surface: "#0a0a0a",
  fg: "#f5f5f4",
  /** Dark warm bronze used as the base of the core sphere's metal. */
  bronzeShadow: "#4a3510",
} as const;
