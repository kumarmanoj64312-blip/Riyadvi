"use client";

import { m, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

/**
 * Route transition for every public page.
 *
 * Unlike layout.tsx, a template is RE-MOUNTED on each navigation, so its
 * mount animation plays once per route change: the new page fades in while
 * settling from a slightly smaller scale and a few pixels lower, a calm
 * "camera settle" with no overlay, wipe or line.
 *
 * Only opacity and transform animate (no blur filter: a filter would become
 * the containing block for fixed elements inside pages, like the reading
 * progress bar). Motion clears the transform when done.
 *
 * The very first page load is NOT animated: the hero headline is the LCP
 * element and must paint immediately. A module-level flag tells first load
 * from later navigations; it survives re-mounts because the module stays loaded.
 * Reduced motion → no animation at all.
 */
let hasMountedOnce = false;

const EASE = [0.22, 1, 0.36, 1] as const; // same curve as --ease-premium

export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  // Read the flag in the initializer: false on server + first load, true on every later navigation.
  const [isNavigation] = useState(() => hasMountedOnce);

  useEffect(() => {
    hasMountedOnce = true;
  }, []);

  const play = isNavigation && !reduce;

  return (
    <m.div
      initial={play ? { opacity: 0, scale: 0.985, y: 14 } : false}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      style={{ transformOrigin: "50% 0%" }}
    >
      {children}
    </m.div>
  );
}
