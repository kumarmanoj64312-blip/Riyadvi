"use client";

import { Fragment, useEffect, useRef, type CSSProperties } from "react";
import { cn } from "@/lib/cn";

type Props = {
  /** Plain text, split on spaces into individually animated words. */
  text: string;
  /** Optional trailing words rendered with the gold gradient (e.g. the hero's "Grow Your Business"). */
  accent?: string;
  /**
   * "load" – start at first paint (pure CSS, works before hydration → no LCP delay). Use above the fold.
   * "view" – wait until the text scrolls into view (IntersectionObserver adds `data-inview`).
   */
  trigger?: "load" | "view";
  /** Extra delay before the first word, in ms. */
  delay?: number;
  className?: string;
};

/**
 * Masked word-by-word reveal: each word sits in an `overflow:hidden` mask and
 * its inner span slides up from below (CSS `split-rise`, see globals.css).
 * Only `transform` animates → no layout work, GPU-composited.
 *
 * We split on WORDS, not characters, so screen readers still read normal
 * words and line-wrapping/`text-balance` behave as for plain text.
 * Reduced motion and no-JS cases are handled in CSS (text shown instantly).
 */
export function SplitText({ text, accent, trigger = "view", delay = 0, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (trigger !== "view") return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.inview = "";
          io.disconnect(); // reveal once
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [trigger]);

  const words = text.split(/\s+/).filter(Boolean);
  const accentWords = accent ? accent.split(/\s+/).filter(Boolean) : [];

  // Running index → staggered delay via the --i custom property.
  let i = 0;
  const renderWord = (word: string, accented: boolean) => {
    const index = i++;
    // The space sits OUTSIDE the inline-block mask — a trailing space inside it would collapse.
    return (
      <Fragment key={index}>
        <span className="split-word">
          <span
            className={cn("split-inner", accented && "text-gold-gradient")}
            style={{ "--i": index } as CSSProperties}
          >
            {word}
          </span>
        </span>{" "}
      </Fragment>
    );
  };

  return (
    <span
      ref={ref}
      data-split={trigger}
      className={className}
      style={{ "--split-delay": `${delay}ms` } as CSSProperties}
    >
      {words.map((w) => renderWord(w, false))}
      {accentWords.map((w) => renderWord(w, true))}
    </span>
  );
}
