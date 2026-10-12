/**
 * First-visit brand intro (once per browser session, ~1.1 s).
 *
 * The Riyadvi mark draws itself (SVG stroke), the wordmark fades in, then the
 * panel lifts away with a thin gold leading edge.
 *
 * Design constraints:
 *  - PURE CSS timeline (see .preloader in globals.css): it plays and exits
 *    even if JavaScript is slow or disabled. It is never waiting on loading,
 *    and there is no fake percentage counter.
 *  - The page is fully server-rendered UNDERNEATH it, so the content and the
 *    hero headline (LCP) paint immediately; the overlay is just on top.
 *  - A tiny script in <head> (PRELOADER_SCRIPT, injected by the root layout
 *    with next/script "beforeInteractive") runs before the overlay is parsed:
 *    if this session already saw the intro, or the visitor prefers reduced
 *    motion, it sets `data-intro-seen` on <html> and CSS hides the overlay
 *    before it paints. (sessionStorage holds only this flag.)
 *    It is NOT rendered as a <script> inside this component: React 19 warns
 *    about script tags rendered by components (they never run on the client).
 */
export const PRELOADER_SCRIPT = `try{var d=document.documentElement;if(sessionStorage.getItem("rv-intro")||matchMedia("(prefers-reduced-motion: reduce)").matches){d.setAttribute("data-intro-seen","")}else{sessionStorage.setItem("rv-intro","1")}}catch(e){}`;

export function Preloader() {
  return (
    <>
      <div aria-hidden="true" className="preloader">
        <div className="preloader-edge" />
        <div className="flex items-center gap-4">
          <svg width="56" height="56" viewBox="0 0 28 28" className="preloader-mark">
            <path d="M14 3 L25 22 L3 22 Z" pathLength={1} />
            <circle cx="14" cy="3.5" r="2.5" />
            <circle cx="24.5" cy="22" r="2.5" />
            <circle cx="3.5" cy="22" r="2.5" />
            <circle cx="14" cy="15.5" r="2" />
          </svg>
          <span className="preloader-word font-display text-4xl font-semibold tracking-tight text-fg">
            Riyadvi<span className="text-gold">.</span>
          </span>
        </div>
      </div>
    </>
  );
}
