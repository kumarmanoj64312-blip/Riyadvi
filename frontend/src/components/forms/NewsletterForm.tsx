"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, m } from "motion/react";
import { postJson } from "@/lib/apiClient";
import { Button } from "@/components/ui/Button";

// Same rule as the server's Zod email check (the server re-validates everything).
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Footer newsletter signup → POST /api/newsletter → MongoDB.
 *
 * Deliberately plain React (no react-hook-form / zod on the client): the
 * footer is on every page, and for ONE field those libraries cost more JS on
 * every page load than they save. Lighthouse measured the difference.
 * The label is visually hidden but present for screen readers; error and
 * success text is announced (role=alert / role=status).
 * The input / honeypot markup mirrors components/forms/fields.tsx, without
 * importing it (that module also pulls in react-hook-form and the combobox).
 */
export function NewsletterForm() {
  const pathname = usePathname();
  const [state, setState] = useState<{ status: "idle" | "sending" | "done"; message: string; error: string }>({
    status: "idle",
    message: "",
    error: "",
  });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    if (!EMAIL.test(email)) {
      setState({ status: "idle", message: "", error: "Please enter a valid email address." });
      return;
    }
    setState({ status: "sending", message: "", error: "" });
    const res = await postJson("/newsletter", { email, website: form.get("website") ?? "", sourcePage: pathname });
    if (res.ok) setState({ status: "done", message: res.message, error: "" });
    else setState({ status: "idle", message: "", error: res.fieldErrors.email ?? res.message });
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait" initial={false}>
        {state.status === "done" ? (
          <m.p
            key="done"
            role="status"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-gold/40 bg-gold/5 px-4 py-3 text-sm text-fg"
          >
            {state.message}
          </m.p>
        ) : (
          <m.form key="form" exit={{ opacity: 0 }} onSubmit={onSubmit} noValidate>
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <div className="flex gap-2">
              <input
                id="newsletter-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                maxLength={120}
                aria-invalid={!!state.error}
                aria-describedby={state.error ? "newsletter-error" : undefined}
                className="h-12 w-0 min-w-0 flex-1 rounded-xl border border-line-strong bg-surface-2 px-4 text-fg transition-colors duration-200 placeholder:text-subtle focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 focus-visible:outline-none aria-[invalid=true]:border-[#f87171]"
              />
              <Button type="submit" disabled={state.status === "sending"} size="lg" className="shrink-0 h-12! px-5!">
                {state.status === "sending" ? "Subscribing…" : "Subscribe"}
              </Button>
            </div>
            {/* Honeypot: off-screen, untabbable, hidden from assistive tech; bots fill it, people don't. */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label>
                Leave this field empty
                <input type="text" name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            {state.error && (
              <p id="newsletter-error" role="alert" className="mt-2 text-sm text-[#fca5a5]">
                {state.error}
              </p>
            )}
          </m.form>
        )}
      </AnimatePresence>
    </div>
  );
}
