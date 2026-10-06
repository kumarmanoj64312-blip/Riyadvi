"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CONSULTATION_SLOTS, consultationSchema, type ConsultationValues } from "@/schemas/leads";
import { postJson } from "@/lib/apiClient";
import { Button } from "@/components/ui/Button";
import { Field, Honeypot, Input, Select, Textarea } from "@/components/forms/fields";
import { FormError, FormSuccess } from "@/components/forms/FormStatus";

type Props = { requirements: { value: string; label: string }[] };

/** Local YYYY-MM-DD for the date input's `min`. */
const todayISO = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

/** "Book a Free Consultation" → POST /api/consultation → MongoDB (+ team email). */
export function ConsultationForm({ requirements }: Props) {
  const pathname = usePathname();
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [serverMessage, setServerMessage] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ConsultationValues>({ resolver: zodResolver(consultationSchema), mode: "onTouched" });

  const onSubmit = async (values: ConsultationValues) => {
    const result = await postJson("/consultation", { ...values, sourcePage: pathname });
    if (result.ok) {
      setServerMessage(result.message);
      setStatus("success");
      reset();
      return;
    }
    for (const [field, message] of Object.entries(result.fieldErrors)) {
      setError(field as keyof ConsultationValues, { message });
    }
    setServerMessage(result.message);
    setStatus("error");
  };

  if (status === "success") {
    return <FormSuccess title="Consultation requested" message={serverMessage} onReset={() => setStatus("idle")} />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative grid gap-5 sm:grid-cols-2">
      <Field label="Full name" required error={errors.name?.message}>
        {(a11y) => <Input {...a11y} {...register("name")} autoComplete="name" />}
      </Field>
      <Field label="Email" required error={errors.email?.message}>
        {(a11y) => <Input {...a11y} {...register("email")} type="email" autoComplete="email" />}
      </Field>
      <Field label="Phone" required error={errors.phone?.message}>
        {(a11y) => <Input {...a11y} {...register("phone")} type="tel" autoComplete="tel" />}
      </Field>
      <Field label="Topic" required error={errors.requirement?.message}>
        {(a11y) => (
          <Select {...a11y} {...register("requirement")} defaultValue="">
            <option value="">Choose one…</option>
            {requirements.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Field label="Preferred date" required error={errors.preferredDate?.message}>
        {/* `min` depends on the visitor's clock, so server/client may differ by a day. */}
        {(a11y) => <Input {...a11y} {...register("preferredDate")} type="date" min={todayISO()} suppressHydrationWarning />}
      </Field>
      <Field label="Preferred time (IST)" required error={errors.preferredTime?.message}>
        {(a11y) => (
          <Select {...a11y} {...register("preferredTime")} defaultValue="">
            <option value="">Choose a slot…</option>
            {CONSULTATION_SLOTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Field label="Anything we should prepare?" error={errors.notes?.message} className="sm:col-span-2">
        {(a11y) => <Textarea {...a11y} {...register("notes")} className="min-h-24" placeholder="Optional" />}
      </Field>

      <Honeypot {...register("website")} />

      <div className="flex flex-col gap-4 sm:col-span-2">
        <FormError status={status === "error" ? "error" : "idle"} message={serverMessage} />
        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto sm:self-start">
          {isSubmitting ? "Booking…" : "Request my free consultation"}
        </Button>
      </div>
    </form>
  );
}
