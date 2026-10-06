"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { applicationSchema, RESUME_MAX_MB, type ApplicationValues } from "@/schemas/leads";
import { postForm } from "@/lib/apiClient";
import { Button } from "@/components/ui/Button";
import { Field, Honeypot, Input, Textarea } from "@/components/forms/fields";
import { FormError, FormSuccess } from "@/components/forms/FormStatus";

type Props = { jobSlug: string; position: string };

/**
 * Job application → multipart POST /api/applications.
 * The file is validated here for fast feedback (type, size), then again on
 * the server — including its actual content bytes.
 */
export function JobApplicationForm({ jobSlug, position }: Props) {
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [serverMessage, setServerMessage] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationValues>({ resolver: zodResolver(applicationSchema), mode: "onTouched" });
  const file = watch("resume")?.[0];

  const onSubmit = async (values: ApplicationValues) => {
    const form = new FormData();
    form.append("jobSlug", jobSlug);
    form.append("name", values.name);
    form.append("email", values.email);
    form.append("phone", values.phone);
    form.append("message", values.message ?? "");
    form.append("website", values.website ?? "");
    form.append("resume", values.resume[0]);

    const res = await postForm("/applications", form);
    if (res.ok) {
      setServerMessage(res.message);
      setStatus("success");
      reset();
      return;
    }
    for (const [field, message] of Object.entries(res.fieldErrors)) setError(field as keyof ApplicationValues, { message });
    setServerMessage(res.message);
    setStatus("error");
  };

  if (status === "success") {
    return <FormSuccess title="Application sent" message={serverMessage} onReset={() => setStatus("idle")} />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative grid gap-5 sm:grid-cols-2">
      <Field label="Position" className="sm:col-span-2">
        {(a11y) => <Input {...a11y} value={position} readOnly className="text-muted" />}
      </Field>
      <Field label="Full name" required error={errors.name?.message}>
        {(a11y) => <Input {...a11y} {...register("name")} autoComplete="name" />}
      </Field>
      <Field label="Email" required error={errors.email?.message}>
        {(a11y) => <Input {...a11y} {...register("email")} type="email" autoComplete="email" />}
      </Field>
      <Field label="Phone" required error={errors.phone?.message}>
        {(a11y) => <Input {...a11y} {...register("phone")} type="tel" autoComplete="tel" />}
      </Field>
      <Field label="Resume" required error={errors.resume?.message as string | undefined} hint={`PDF, DOC or DOCX · max ${RESUME_MAX_MB} MB`}>
        {(a11y) => (
          <div>
            <Input
              {...a11y}
              {...register("resume")}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="flex items-center py-2.5 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-gold file:px-4 file:py-1.5 file:text-sm file:font-medium file:text-ink"
            />
            {file && (
              <p className="mt-1 truncate text-xs text-muted">
                {file.name} · {Math.round(file.size / 1024)} KB
              </p>
            )}
          </div>
        )}
      </Field>
      <Field label="Why Riyadvi? (optional)" error={errors.message?.message} className="sm:col-span-2">
        {(a11y) => <Textarea {...a11y} {...register("message")} className="min-h-24" />}
      </Field>
      <Honeypot {...register("website")} />
      <div className="flex flex-col gap-4 sm:col-span-2">
        <FormError status={status === "error" ? "error" : "idle"} message={serverMessage} />
        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto sm:self-start">
          {isSubmitting ? "Uploading…" : "Submit application"}
        </Button>
      </div>
    </form>
  );
}
