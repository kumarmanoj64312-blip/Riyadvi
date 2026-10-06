import type { ServiceSceneType } from "@/types/content";
import { palette } from "@/lib/theme";

/*
 * Static stand-in for each ServiceScene: a gold line drawing of the same idea
 * (browser, phone, chart, portal, knot, cards). Server-rendered SVG — used on
 * first paint, on low-tier devices and if WebGL fails.
 */
const ICONS: Record<ServiceSceneType, React.ReactNode> = {
  "web-development": (
    <>
      <rect x="20" y="30" width="160" height="110" rx="8" />
      <path d="M20 50h160" />
      <circle cx="34" cy="40" r="3" fill={palette.gold} />
      <circle cx="46" cy="40" r="3" />
      <path d="M38 72h60M38 86h40M110 72h50M120 86h30M38 112h36M86 112h36M134 112h28" />
    </>
  ),
  "app-development": (
    <>
      <rect x="72" y="20" width="56" height="112" rx="10" />
      <path d="M92 28h16M82 50h36M82 66h36M82 82h36M82 98h36" />
      <rect x="30" y="44" width="28" height="56" rx="4" opacity=".5" />
      <rect x="142" y="44" width="28" height="56" rx="4" opacity=".5" />
    </>
  ),
  "digital-marketing": (
    <>
      <path d="M30 140h140" />
      <path d="M40 140v-14M60 140v-20M80 140v-28M100 140v-38M120 140v-50M140 140v-66M160 140v-86" strokeWidth="10" />
      <path d="M40 116l20-6 20-8 20-10 20-12 20-16 20-20" stroke={palette.goldLight} />
    </>
  ),
  "ar-vr": (
    <>
      <circle cx="100" cy="80" r="52" strokeWidth="5" />
      <circle cx="100" cy="80" r="36" opacity=".5" />
      <circle cx="100" cy="80" r="20" opacity=".3" />
      <path d="M40 40l10 10M160 120l-10-10M150 34l-8 12" />
    </>
  ),
  "3d-modeling": (
    <>
      <path d="M100 26l52 30v60l-52 30-52-30V56z" />
      <path d="M100 26v120M48 56l104 60M152 56L48 116" opacity=".45" />
      <ellipse cx="100" cy="150" rx="46" ry="6" opacity=".5" />
    </>
  ),
  "ui-ux-design": (
    <>
      <rect x="28" y="30" width="60" height="44" rx="5" />
      <rect x="112" y="30" width="60" height="44" rx="5" strokeDasharray="4 4" />
      <rect x="28" y="90" width="60" height="44" rx="5" strokeDasharray="4 4" />
      <rect x="112" y="90" width="60" height="44" rx="5" />
      <circle cx="44" cy="46" r="6" fill={palette.gold} />
      <path d="M56 46h22M128 106h30M128 118h20" />
    </>
  ),
  generic: (
    <>
      <path d="M100 30l45 26v52l-45 26-45-26V56z" />
      <path d="M100 30v104M55 56l90 52M145 56l-90 52" opacity=".4" />
    </>
  ),
};

export function ServiceFallback({ type }: { type: ServiceSceneType }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <svg
        viewBox="0 0 200 170"
        className="h-3/5 w-3/5 max-w-[320px] transition-transform duration-700 ease-premium group-hover:scale-105"
        fill="none"
        stroke={palette.gold}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        role="presentation"
      >
        {ICONS[type] ?? ICONS.generic}
      </svg>
    </div>
  );
}
