/**
 * Motion animation features, loaded lazily by <MotionProvider>.
 * domMax = animations + gestures + drag + layout (the portfolio/blog/careers
 * grids use `layout`). Split into its own chunk so it never blocks first paint.
 */
import { domMax } from "motion/react";
export default domMax;
