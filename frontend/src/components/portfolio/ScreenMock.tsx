import type { CSSProperties } from "react";
import type { ProjectScreen } from "@/types/content";
import { cn } from "@/lib/cn";

type Props = {
  client: string;
  accent: string;
  screen: ProjectScreen;
  /** Varies the layout so a project's screens don't all look identical. */
  variant?: number;
  className?: string;
};

/**
 * Generated UI mockup of a project screen — pure HTML/CSS, zero image
 * requests. Stands in for real screenshots (swap this for <Image> once the
 * client provides approved captures). The project's brand accent arrives as a
 * CSS variable, so the same component renders every project on-brand.
 */
export function ScreenMock({ client, accent, screen, variant = 0, className }: Props) {
  const style = { "--accent": accent } as CSSProperties;
  const mobile = screen.kind === "mobile";
  const v = variant % 3;

  return (
    <div
      style={style}
      aria-label={`${client} — ${screen.label} screen (illustration)`}
      role="img"
      className={cn(
        "overflow-hidden border border-line-strong bg-[#0c0c0c] shadow-[0_30px_80px_-30px_rgb(0_0_0/0.9)]",
        mobile ? "aspect-[9/19] w-full max-w-[240px] rounded-[2rem] p-2" : "aspect-[16/10] w-full rounded-xl",
        className,
      )}
    >
      {/* Chrome: browser bar or phone notch */}
      {mobile ? (
        <div className="mx-auto mb-2 h-1.5 w-16 rounded-full bg-white/10" />
      ) : (
        <div className="flex items-center gap-1.5 border-b border-line px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-white/10" />
          <span className="ml-3 h-3 flex-1 rounded bg-white/5" />
        </div>
      )}

      <div className={cn("flex h-full flex-col gap-2", mobile ? "rounded-[1.5rem] bg-[#111] p-3" : "p-4")}>
        {/* Nav */}
        <div className="flex items-center justify-between">
          <span className="truncate text-[10px] font-semibold tracking-wide text-fg">{client}</span>
          <span className="h-1.5 w-8 rounded bg-white/15" />
        </div>

        {/* Hero block in the brand accent */}
        <div
          className={cn(
            "relative overflow-hidden rounded-lg p-3",
            v === 1 ? "bg-white/5" : "bg-[linear-gradient(135deg,var(--accent),transparent_85%)]",
            mobile ? "min-h-[28%]" : "min-h-[38%]",
          )}
        >
          <p className="text-[11px] font-semibold leading-tight text-white">{screen.label}</p>
          <span className="mt-2 block h-1.5 w-2/3 rounded bg-white/40" />
          <span className="mt-1 block h-1.5 w-1/2 rounded bg-white/25" />
          <span className="mt-3 inline-block h-3 w-14 rounded-full bg-[var(--accent)]" />
        </div>

        {/* Content: cards or list depending on variant */}
        {v === 2 || mobile ? (
          <div className="flex flex-col gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-2 rounded-md bg-white/5 p-2">
                <span className="h-4 w-4 shrink-0 rounded-full bg-[var(--accent)] opacity-70" />
                <span className="h-1.5 flex-1 rounded bg-white/15" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid flex-1 grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-md bg-white/5 p-2">
                <span className="block aspect-video rounded bg-[var(--accent)] opacity-25" />
                <span className="mt-2 block h-1.5 w-3/4 rounded bg-white/15" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
