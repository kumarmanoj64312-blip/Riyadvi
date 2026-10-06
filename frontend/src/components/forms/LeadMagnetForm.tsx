"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { m } from "motion/react";
import { leadMagnetSchema, type LeadMagnetValues } from "@/schemas/leads";
import { postJson } from "@/lib/apiClient";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Field, Honeypot, Input } from "@/components/forms/fields";
import { FormError } from "@/components/forms/FormStatus";

/**
 * Lead magnet: validate → POST /api/lead-magnet → store lead → reveal the
 * download link returned by the API (so the file location is server-controlled).
 */
export function LeadMagnetForm() {
  const pathname = usePathname();
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LeadMagnetValues>({ resolver: zodResolver(leadMagnetSchema), mode: "onTouched" });

  const onSubmit = async (values: LeadMagnetValues) => {
    setServerError("");
    const res = await postJson<{ downloadUrl: string }>("/lead-magnet", { ...values, sourcePage: pathname });
    if (res.ok && res.data) {
      setDownloadUrl(res.data.downloadUrl);
      return;
    }
    if (!res.ok) {
      for (const [field, message] of Object.entries(res.fieldErrors)) setError(field as keyof LeadMagnetValues, { message });
      setServerError(res.message);
    }
  };

  if (downloadUrl) {
    return (
      <m.div
        role="status"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-start gap-4 rounded-2xl border border-gold/40 bg-gold/5 p-8"
      >
        <h2 className="text-2xl font-semibold">Your guide is ready</h2>
        <p className="text-muted">Thanks! Download the PDF below — it&apos;s yours to keep and share with your team.</p>
        <a href={downloadUrl} download className={buttonClasses({ size: "lg" })}>
          Download the guide (PDF)
        </a>
        <p className="text-sm text-muted">
          Want help applying it?{" "}
          <a href="/contact#consultation" className="text-gold hover:underline">
            Book a free 30-minute consultation
          </a>
          .
        </p>
      </m.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative grid gap-5">
      <Field label="Full name" required error={errors.name?.message}>
        {(a11y) => <Input {...a11y} {...register("name")} autoComplete="name" />}
      </Field>
      <Field label="Company" required error={errors.company?.message}>
        {(a11y) => <Input {...a11y} {...register("company")} autoComplete="organization" />}
      </Field>
      <Field label="Work email" required error={errors.email?.message}>
        {(a11y) => <Input {...a11y} {...register("email")} type="email" autoComplete="email" />}
      </Field>
      <Field label="Phone" required error={errors.phone?.message}>
        {(a11y) => <Input {...a11y} {...register("phone")} type="tel" autoComplete="tel" />}
      </Field>
      <Honeypot {...register("website")} />
      <FormError status={serverError ? "error" : "idle"} message={serverError} />
      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Preparing your guide…" : "Get the free guide"}
      </Button>
      <p className="text-xs text-subtle">No spam. We&apos;ll only contact you about your project.</p>
    </form>
  );
}
