import {
  siBlender,
  siExpress,
  siFigma,
  siFirebase,
  siFlutter,
  siJavascript,
  siMongodb,
  siMysql,
  siNextdotjs,
  siNodedotjs,
  siReact,
  siThreedotjs,
  siTypescript,
  siWordpress,
} from "simple-icons";

/**
 * Official brand marks from Simple Icons (CC0 SVG paths; the logos remain
 * trademarks of their owners), as plain data, so both the DOM logos
 * (<TechLogo>) and the 3D globe's tile textures draw the same marks.
 * Named imports only: the bundle holds these 14 paths, not the whole set.
 *
 * Only exact matches are mapped. No borrowed look-alikes:
 *  - React Native uses the React mark (it is React's own logo for RN).
 *  - AWS (removed from Simple Icons at Amazon's request) and React Three
 *    Fiber (no official mark) get a text monogram instead.
 */
const PATHS: Record<string, string> = {
  react: siReact.path,
  nextjs: siNextdotjs.path,
  javascript: siJavascript.path,
  typescript: siTypescript.path,
  threejs: siThreedotjs.path,
  nodejs: siNodedotjs.path,
  express: siExpress.path,
  mongodb: siMongodb.path,
  mysql: siMysql.path,
  firebase: siFirebase.path,
  "react-native": siReact.path,
  flutter: siFlutter.path,
  wordpress: siWordpress.path,
  blender: siBlender.path,
  figma: siFigma.path,
};

const MONOGRAMS: Record<string, string> = { aws: "AWS", r3f: "R3F" };

/** SVG path data (24×24 viewBox) for a technology's logo, or null if it has none. */
export function techIconPath(slug: string): string | null {
  return PATHS[slug] ?? null;
}

/** Text stand-in for technologies without an official mark. */
export function techMonogram(slug: string): string {
  return MONOGRAMS[slug] ?? slug.slice(0, 2).toUpperCase();
}
