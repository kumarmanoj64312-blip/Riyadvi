"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useController, type Control, type FieldValues, type Path } from "react-hook-form";
import { Combobox, type ComboOption } from "@/components/ui/Combobox";

/*
 * Accessible form primitives.
 * Every control gets: a real <label>, aria-invalid when in error, and
 * aria-describedby pointing at its hint/error text — so screen readers
 * announce the problem when the field is focused.
 */

const control =
  "w-full rounded-xl border bg-surface-2 px-4 text-fg placeholder:text-subtle transition-colors duration-200 " +
  "focus:border-gold focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-gold/30 " +
  "disabled:opacity-60";

type FieldProps = {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: (a11y: { id: string; "aria-invalid": boolean; "aria-describedby"?: string }) => ReactNode;
};

/** Label + control + hint/error, wired together with ids. */
export function Field({ label, error, hint, required, className, children }: FieldProps) {
  const id = useId();
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;
  return (
    // min-w-0: grid/flex children otherwise grow to their content (e.g. a long <option>).
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-fg">
        {label}
        {required && <span className="text-gold"> *</span>}
      </label>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy })}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-subtle">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-[#f87171]">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      {...props}
      className={cn(control, "h-12 aria-[invalid=true]:border-[#f87171]", "border-line-strong", className)}
    />
  );
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      {...props}
      className={cn(control, "min-h-32 resize-y py-3 aria-[invalid=true]:border-[#f87171]", "border-line-strong", className)}
    />
  );
}

/**
 * Dropdown field for react-hook-form: the custom searchable Combobox wired up
 * with useController (value, change, blur/touched, and focus on error).
 * Replaces the browser's native <select>.
 */
export function FormSelect<T extends FieldValues>({
  control,
  name,
  options,
  placeholder = "Choose one…",
  searchable,
  ...a11y
}: {
  control: Control<T>;
  name: Path<T>;
  options: ComboOption[];
  placeholder?: string;
  searchable?: boolean;
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}) {
  const { field } = useController({ control, name });
  return (
    <Combobox
      {...a11y}
      name={field.name}
      value={(field.value as string | undefined) ?? ""}
      onChange={field.onChange}
      onBlur={field.onBlur}
      buttonRef={field.ref}
      options={options}
      placeholder={placeholder}
      searchable={searchable}
    />
  );
}

/**
 * Honeypot: positioned off-screen (not display:none — some bots skip hidden
 * inputs), removed from tab order and the accessibility tree.
 */
export function Honeypot(props: ComponentProps<"input">) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Leave this field empty
        <input type="text" tabIndex={-1} autoComplete="off" {...props} />
      </label>
    </div>
  );
}
