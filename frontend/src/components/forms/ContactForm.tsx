"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactValues } from "@/schemas/leads";
import { postJson, warmUpBackend } from "@/lib/apiClient";
import { Button } from "@/components/ui/Button";
import { Field, Honeypot, Input, Select, Textarea } from "@/components/forms/fields";
import { FormError, FormSuccess } from "@/components/forms/FormStatus";

type Props = {
  /** Options for "What do you need help with?" (services + extras). */
  requirements: { value: string; label: string }[];
  /** Pre-selected requirement, e.g. from /contact?service=web-development. */
  defaultRequirement?: string;
};

/**
 * Contact / quote form → POST /api/contact → MongoDB (+ team email).
 * react-hook-form keeps inputs uncontrolled (no re-render per keystroke);
 * zodResolver validates with the same rules as the server.
 */
export function ContactForm({ requirements, defaultRequirement = "" }: Props) {
  const pathname = usePathname();
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [serverMessage, setServerMessage] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { requirement: defaultRequirement },
    mode: "onTouched", // validate a field once the user leaves it
  });

  // Wake a sleeping free-tier backend while the user is still typing.
  useEffect(() => warmUpBackend(), []);

  const onSubmit = async (values: ContactValues) => {
    const result = await postJson("/contact", { ...values, sourcePage: pathname });
    if (result.ok) {
      setServerMessage(result.message);
      setStatus("success");
      reset({ requirement: defaultRequirement });
      return;
    }
    // Map server-side field errors back onto the inputs.
    for (const [field, message] of Object.entries(result.fieldErrors)) {
      setError(field as keyof ContactValues, { message });
    }
    setServerMessage(result.message);
    setStatus("error");
  };

  if (status === "success") {
    return <FormSuccess title="Message received" message={serverMessage} onReset={() => setStatus("idle")} />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative grid gap-5 sm:grid-cols-2">
      <Field label="Full name" required error={errors.name?.message}>
        {(a11y) => <Input {...a11y} {...register("name")} autoComplete="name" placeholder="Your name" />}
      </Field>
      <Field label="Email" required error={errors.email?.message}>
        {(a11y) => <Input {...a11y} {...register("email")} type="email" autoComplete="email" placeholder="you@company.com" />}
      </Field>
      <Field label="Phone" required error={errors.phone?.message} hint="Include country code, e.g. +91">
        {(a11y) => <Input {...a11y} {...register("phone")} type="tel" autoComplete="tel" placeholder="+91 98765 43210" />}
      </Field>
      <Field label="Company" error={errors.company?.message}>
        {(a11y) => <Input {...a11y} {...register("company")} autoComplete="organization" placeholder="Optional" />}
      </Field>
      <Field label="What do you need help with?" required error={errors.requirement?.message} className="sm:col-span-2">
        {(a11y) => (
          <Select {...a11y} {...register("requirement")}>
            <option value="">Choose one…</option>
            {requirements.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Field label="Tell us about your project" required error={errors.message?.message} className="sm:col-span-2">
        {(a11y) => <Textarea {...a11y} {...register("message")} placeholder="Goals, timeline, budget range — anything that helps." />}
      </Field>

      <Honeypot {...register("website")} />

      <div className="flex flex-col gap-4 sm:col-span-2">
        <FormError status={status === "error" ? "error" : "idle"} message={serverMessage} />
        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto sm:self-start">
          {isSubmitting ? "Sending…" : "Send message"}
        </Button>
        <p className="text-xs text-subtle">We reply within one business day. Your details are never shared.</p>
      </div>
    </form>
  );
}
