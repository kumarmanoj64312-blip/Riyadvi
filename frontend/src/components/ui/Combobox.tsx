"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

export type ComboOption = { value: string; label: string };

type Props = {
  options: ComboOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Show the search box (default: when there are more than 5 options). */
  searchable?: boolean;
  /** Visual size: "md" form field (48px) · "sm" filter/table control (40px / 32px). */
  size?: "md" | "sm" | "xs";
  id?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  /** Replaces the default border/background/text colours (e.g. status tones). */
  colorClass?: string;
  /** Callback ref — lets react-hook-form focus the field on validation errors. */
  buttonRef?: (el: HTMLButtonElement | null) => void;
  onBlur?: () => void;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

const SIZES = {
  md: "h-12 rounded-xl px-4 text-base",
  sm: "h-10 rounded-full px-4 text-sm",
  xs: "h-8 rounded-full px-3 text-xs",
};

/**
 * Custom dropdown with search — replaces the browser's native <select>.
 *
 * Accessibility (WAI-ARIA "select-only combobox" + listbox):
 *  - trigger: button[aria-haspopup=listbox][aria-expanded]
 *  - search box drives the list via aria-activedescendant
 *  - keyboard: ↓/↑ move, Home/End, Enter selects, Esc closes, Tab leaves
 * The panel renders in a portal with fixed positioning, so it is never clipped
 * by scrolling containers (e.g. the admin table) and flips upward when there
 * isn't enough room below.
 */
export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select…",
  searchable,
  size = "md",
  id,
  name,
  disabled,
  className,
  colorClass = "border-line-strong bg-surface-2 text-fg",
  buttonRef,
  onBlur,
  ...aria
}: Props) {
  const uid = useId();
  const listId = `${uid}-list`;
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState<{ left: number; width: number; top?: number; bottom?: number; maxHeight: number } | null>(null);

  const showSearch = searchable ?? options.length > 5;
  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  }, [options, query]);

  // Merge our ref with react-hook-form's (callback) ref.
  const setTriggerRef = useCallback(
    (el: HTMLButtonElement | null) => {
      triggerRef.current = el;
      buttonRef?.(el);
    },
    [buttonRef],
  );

  /** Place the panel under (or above) the trigger, inside the viewport. */
  const place = useCallback(() => {
    const t = triggerRef.current;
    if (!t) return;
    const r = t.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom - 12;
    const spaceAbove = r.top - 12;
    const below = spaceBelow >= 240 || spaceBelow >= spaceAbove;
    const width = Math.max(r.width, 200);
    const left = Math.min(r.left, window.innerWidth - width - 8);
    setPos(
      below
        ? { left, width, top: r.bottom + 6, maxHeight: Math.min(320, spaceBelow) }
        : { left, width, bottom: window.innerHeight - r.top + 6, maxHeight: Math.min(320, spaceAbove) },
    );
  }, []);

  const openPanel = () => {
    if (disabled) return;
    setQuery("");
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    place();
    setOpen(true);
  };

  const close = useCallback(
    (refocus = true) => {
      setOpen(false);
      if (refocus) triggerRef.current?.focus();
      onBlur?.();
    },
    [onBlur],
  );

  const choose = (opt: ComboOption | undefined) => {
    if (!opt) return;
    if (opt.value !== value) onChange(opt.value);
    close();
  };

  // While open: follow scroll/resize, close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panelRef.current?.contains(t) && !triggerRef.current?.contains(t)) close(false);
    };
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    document.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open, place, close]);

  // Focus the search box (or the list) once the panel is in the DOM.
  useLayoutEffect(() => {
    if (!open) return;
    (showSearch ? searchRef.current : listRef.current)?.focus();
  }, [open, showSearch]);

  // Keep the active option scrolled into view.
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const onListKey = (e: React.KeyboardEvent) => {
    const last = filtered.length - 1;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((i) => Math.min(last, i + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(last);
        break;
      case "Enter":
        e.preventDefault();
        choose(filtered[active]);
        break;
      case "Escape":
        e.preventDefault();
        close();
        break;
      case "Tab":
        close(false);
        break;
    }
  };

  const onTriggerKey = (e: React.KeyboardEvent) => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      openPanel();
    }
  };

  const optionId = (i: number) => `${uid}-opt-${i}`;

  return (
    <>
      <button
        ref={setTriggerRef}
        type="button"
        id={id}
        name={name}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={aria["aria-label"]}
        aria-invalid={aria["aria-invalid"]}
        aria-describedby={aria["aria-describedby"]}
        onClick={() => (open ? close() : openPanel())}
        onKeyDown={onTriggerKey}
        className={cn(
          "flex w-full items-center justify-between gap-2 border text-left transition-colors",
          colorClass,
          "hover:border-gold/50 focus-visible:border-gold disabled:opacity-50 aria-[invalid=true]:border-[#f87171]",
          open && "border-gold",
          SIZES[size],
          className,
        )}
      >
        <span className={cn("truncate", !selected && "text-subtle")}>{selected?.label ?? placeholder}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={cn("shrink-0 text-subtle transition-transform duration-200", open && "rotate-180 text-gold")}>
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open &&
        pos &&
        createPortal(
          <div
            ref={panelRef}
            style={{ position: "fixed", left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom }}
            className="z-[70] overflow-hidden rounded-2xl border border-line-strong bg-surface-2 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.9)]"
            data-lenis-prevent
          >
            {showSearch && (
              <div className="border-b border-line p-2">
                <div className="relative">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" strokeLinecap="round" />
                  </svg>
                  <input
                    ref={searchRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setActive(0);
                    }}
                    onKeyDown={onListKey}
                    placeholder="Search…"
                    aria-label="Search options"
                    aria-controls={listId}
                    aria-activedescendant={filtered[active] ? optionId(active) : undefined}
                    autoComplete="off"
                    className="h-10 w-full rounded-xl border border-line bg-ink pl-9 pr-3 text-sm text-fg placeholder:text-subtle focus:border-gold focus:outline-none"
                  />
                </div>
              </div>
            )}
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              tabIndex={showSearch ? -1 : 0}
              aria-activedescendant={!showSearch && filtered[active] ? optionId(active) : undefined}
              onKeyDown={showSearch ? undefined : onListKey}
              style={{ maxHeight: pos.maxHeight - (showSearch ? 58 : 0) }}
              className="overflow-y-auto overscroll-contain p-1.5 outline-none"
            >
              {filtered.map((o, i) => {
                const isSelected = o.value === value;
                return (
                  <li
                    key={o.value}
                    id={optionId(i)}
                    data-index={i}
                    role="option"
                    aria-selected={isSelected}
                    onPointerMove={() => setActive(i)}
                    onClick={() => choose(o)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm",
                      i === active ? "bg-white/[0.06] text-fg" : "text-muted",
                      isSelected && "text-gold",
                    )}
                  >
                    <span className="truncate">{o.label}</span>
                    {isSelected && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true" className="shrink-0">
                        <path d="m5 12 5 5 9-10" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </li>
                );
              })}
              {filtered.length === 0 && <li className="px-3 py-6 text-center text-sm text-subtle">No matches for “{query}”</li>}
            </ul>
          </div>,
          document.body,
        )}
    </>
  );
}
