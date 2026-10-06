"use client";

import { AnimatePresence, m } from "motion/react";

type Props = { status: "idle" | "error"; message?: string };

/** Animated error banner for a form (role=alert → announced immediately). */
export function FormError({ status, message }: Props) {
  return (
    <AnimatePresence>
      {status === "error" && message && (
        <m.p
          role="alert"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="rounded-xl border border-[#f87171]/40 bg-[#f87171]/10 px-4 py-3 text-sm text-[#fca5a5]"
        >
          {message}
        </m.p>
      )}
    </AnimatePresence>
  );
}

/** Success state that replaces the form after submission. */
export function FormSuccess({ title, message, onReset }: { title: string; message: string; onReset: () => void }) {
  return (
    <m.div
      role="status"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-start gap-4 rounded-2xl border border-gold/40 bg-gold/5 p-8"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold text-xl text-ink" aria-hidden="true">
        ✓
      </span>
      <h3 className="text-2xl font-semibold">{title}</h3>
      <p className="text-muted">{message}</p>
      <button type="button" onClick={onReset} className="text-sm font-medium text-gold underline-offset-4 hover:underline">
        Send another request
      </button>
    </m.div>
  );
}
