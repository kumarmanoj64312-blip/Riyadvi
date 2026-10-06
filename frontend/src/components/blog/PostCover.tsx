import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/**
 * Generated cover art for a post — accent-tinted gradient + a node-network
 * motif + category label. No stock photos to license or download; a CMS
 * image field can replace it later (render <Image> when `cover` exists).
 */
export function PostCover({ accent, category, className, large }: { accent: string; category: string; className?: string; large?: boolean }) {
  return (
    <div
      aria-hidden="true"
      style={{ "--accent": accent } as CSSProperties}
      className={cn(
        "relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,color-mix(in_srgb,var(--accent)_35%,transparent),transparent_65%),linear-gradient(160deg,#141414,#050505)]",
        className,
      )}
    >
      <svg viewBox="0 0 400 225" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" fill="none">
        <g stroke="var(--accent)" strokeOpacity="0.35" strokeWidth="1">
          <path d="M40 170L120 110L210 140L300 70L370 100 M120 110L150 40L300 70 M210 140L250 200L370 100" />
        </g>
        <g fill="var(--accent)">
          {[[40, 170], [120, 110], [210, 140], [300, 70], [370, 100], [150, 40], [250, 200]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i === 3 ? 6 : 3.5} fillOpacity={i === 3 ? 0.9 : 0.6} />
          ))}
        </g>
      </svg>
      <span className={cn("absolute left-5 top-5 rounded-full border border-white/15 bg-black/40 px-3 py-1 font-medium text-white/90", large ? "text-sm" : "text-xs")}>
        {category}
      </span>
    </div>
  );
}
