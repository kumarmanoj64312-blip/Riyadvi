"use client";

import { useId } from "react";
import type { UseFormRegister } from "react-hook-form";
import type { CheckupQuestion } from "@/data/healthCheckup";
import type { CheckupFormValues } from "@/lib/checkup";
import { Select, Textarea } from "@/components/forms/fields";
import { cn } from "@/lib/cn";

type Props = {
  question: CheckupQuestion;
  register: UseFormRegister<CheckupFormValues>;
  error?: string;
  /** Current value — used to cap multi-select at `max`. */
  value: unknown;
};

/**
 * Renders ANY checkup question from config. Options are real radio/checkbox
 * inputs (keyboard + screen-reader friendly), visually styled as cards via
 * the `peer` pattern. Grouped in a <fieldset> with <legend> for context.
 */
export function QuestionField({ question: q, register, error, value }: Props) {
  const id = useId();
  const name = `answers.${q.id}` as const;
  const errorId = `${id}-error`;
  const describedBy = [error && errorId, q.help && `${id}-help`].filter(Boolean).join(" ") || undefined;

  const legend = (
    <legend className="text-base font-medium text-fg">
      {q.label}
      {q.required && <span className="text-gold"> *</span>}
    </legend>
  );
  const help = q.help && (
    <p id={`${id}-help`} className="mt-1 text-sm text-subtle">
      {q.help}
    </p>
  );
  const err = error && (
    <p id={errorId} role="alert" className="mt-2 text-sm text-[#f87171]">
      {error}
    </p>
  );

  if (q.type === "select") {
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={id} className="text-base font-medium text-fg">
          {q.label}
          {q.required && <span className="text-gold"> *</span>}
        </label>
        <Select id={id} aria-invalid={Boolean(error)} aria-describedby={describedBy} defaultValue="" {...register(name)}>
          <option value="">Choose one…</option>
          {q.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        {err}
      </div>
    );
  }

  if (q.type === "text") {
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={id} className="text-base font-medium text-fg">
          {q.label} <span className="text-sm font-normal text-subtle">(optional)</span>
        </label>
        <Textarea id={id} maxLength={q.maxLength} aria-describedby={describedBy} {...register(name)} />
        {err}
      </div>
    );
  }

  if (q.type === "rating") {
    return (
      <fieldset aria-describedby={describedBy}>
        {legend}
        {help}
        <div className="mt-3 flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="relative">
              <input type="radio" value={n} className="peer sr-only" {...register(name)} />
              <span className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border border-line-strong text-lg transition-colors peer-checked:border-gold peer-checked:bg-gold peer-checked:text-ink peer-focus-visible:ring-2 peer-focus-visible:ring-gold hover:border-gold/60">
                {n}
              </span>
            </label>
          ))}
        </div>
        {err}
      </fieldset>
    );
  }

  // single (radio cards) / multi (checkbox cards)
  const multi = q.type === "multi";
  const selected = Array.isArray(value) ? value : value ? [value] : [];
  const atMax = multi && q.max !== undefined && selected.length >= q.max;

  return (
    <fieldset aria-describedby={describedBy}>
      {legend}
      {help}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {q.options?.map((o) => {
          const isChecked = selected.includes(o.value);
          const disabled = atMax && !isChecked;
          return (
            <label key={o.value} className={cn("relative", disabled && "opacity-40")}>
              <input
                type={multi ? "checkbox" : "radio"}
                value={o.value}
                disabled={disabled}
                className="peer sr-only"
                {...register(name)}
              />
              <span className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-line-strong px-4 py-3 text-sm transition-colors peer-checked:border-gold peer-checked:bg-gold/10 peer-checked:text-fg peer-focus-visible:ring-2 peer-focus-visible:ring-gold hover:border-gold/60">
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center border border-subtle text-[10px]",
                    multi ? "rounded" : "rounded-full",
                    isChecked && "border-gold bg-gold text-ink",
                  )}
                >
                  {isChecked && (multi ? "✓" : "")}
                </span>
                {o.label}
              </span>
            </label>
          );
        })}
      </div>
      {err}
    </fieldset>
  );
}
