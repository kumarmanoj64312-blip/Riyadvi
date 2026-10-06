"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { useForm, type Path, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { checkupSteps } from "@/data/healthCheckup";
import { checkupFormSchema, describeAnswer, fieldsForStep, type CheckupFormValues, type CheckupResult } from "@/lib/checkup";
import { postJson, warmUpBackend } from "@/lib/apiClient";
import { Button } from "@/components/ui/Button";
import { Field, Honeypot, Input } from "@/components/forms/fields";
import { FormError } from "@/components/forms/FormStatus";
import { QuestionField } from "@/components/checkup/QuestionField";
import { CheckupResults, type ServiceSummary } from "@/components/checkup/CheckupResults";
import { cn } from "@/lib/cn";

const STORAGE_KEY = "riyadvi.health-checkup.v1";
const STEP_TITLES = [...checkupSteps.map((s) => s.title), "Review & submit"];
const LAST = STEP_TITLES.length - 1;

type Saved = { step: number; answers: CheckupFormValues["answers"] };

/** sessionStorage can throw (private mode, blocked storage) — never let that break the form. */
const storage = {
  read(): Saved | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Saved) : null;
    } catch {
      return null;
    }
  },
  write(data: Saved) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  },
  clear() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
  },
};

/**
 * Business Health Checkup — 5 question steps + review, rendered from config.
 *
 * - One react-hook-form instance for all steps; `trigger(stepFields)` validates
 *   only the current step before moving on.
 * - Progress (answers + step) is kept in sessionStorage so a refresh doesn't
 *   lose work. Personal details (name/email/phone) are NEVER persisted.
 * - Direction-aware Motion transitions; focus moves to the new step heading.
 */
export function HealthCheckup({ services }: { services: ServiceSummary[] }) {
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [restored, setRestored] = useState(false);
  const [result, setResult] = useState<CheckupResult | null>(null);
  const [serverError, setServerError] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const stepRef = useRef(0);
  const didMount = useRef(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    reset,
    getValues,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<CheckupFormValues>({
    // Zod coerces inputs (e.g. rating "4" → 4), so its output type differs
    // from the loose form-state type — cast once here.
    resolver: zodResolver(checkupFormSchema) as unknown as Resolver<CheckupFormValues>,
    defaultValues: { answers: {}, contact: { name: "", email: "", phone: "", company: "" }, consent: false },
    mode: "onTouched",
  });

  // Restore saved progress after hydration (server render always starts at step 0).
  useEffect(() => {
    warmUpBackend();
    const saved = storage.read();
    if (!saved?.answers) return;
    reset({ ...getValues(), answers: saved.answers });
    const resumeAt = Math.min(Math.max(saved.step ?? 0, 0), LAST);
    stepRef.current = resumeAt;
    setStep(resumeAt);
    setRestored(true);
  }, [reset, getValues]);

  // On every change: persist answers, and clear that field's error right away.
  // (Errors from the step check otherwise linger until blur; removing them on
  // blur shifts the layout under the cursor and swallows the "Next" click.)
  useEffect(() => {
    const sub = watch((values, { name }) => {
      storage.write({ step: stepRef.current, answers: values.answers ?? {} });
      if (name) clearErrors(name);
    });
    return () => sub.unsubscribe();
  }, [watch, clearErrors]);

  // On step change: persist the step, move focus to the new heading.
  useEffect(() => {
    stepRef.current = step;
    storage.write({ step, answers: getValues().answers });
    if (didMount.current) headingRef.current?.focus({ preventScroll: false });
    didMount.current = true;
  }, [step, getValues]);

  const goTo = (target: number) => {
    setDirection(target > step ? 1 : -1);
    setStep(target);
  };

  const next = async () => {
    const valid = await trigger(fieldsForStep(step) as Path<CheckupFormValues>[], { shouldFocus: true });
    if (valid) goTo(step + 1);
  };

  const submit = handleSubmit(async (values) => {
    setServerError("");
    const res = await postJson<CheckupResult>("/health-checkup", {
      answers: values.answers,
      contact: values.contact,
      consent: values.consent,
      website: values.website,
      sourcePage: pathname,
    });
    if (res.ok && res.data) {
      storage.clear();
      setResult(res.data);
      window.scrollTo({ top: 0 });
      return;
    }
    if (!res.ok) {
      for (const [field, message] of Object.entries(res.fieldErrors)) setError(field as Path<CheckupFormValues>, { message });
      setServerError(res.message);
    }
  });

  // Enter key on intermediate steps means "Next", not "submit".
  const onSubmit = (e: FormEvent) => {
    if (step < LAST) {
      e.preventDefault();
      void next();
    } else {
      void submit(e);
    }
  };

  const startOver = () => {
    storage.clear();
    reset();
    setResult(null);
    setRestored(false);
    setDirection(-1);
    setStep(0);
  };

  if (result) return <CheckupResults result={result} services={services} onRestart={startOver} />;

  const current = checkupSteps[step];
  const answerError = (id: string) => (errors.answers?.[id] as { message?: string } | undefined)?.message;

  return (
    <div className="rounded-3xl border border-line bg-surface p-5 sm:p-8 md:p-10">
      {/* Progress */}
      <div>
        <div className="flex items-baseline justify-between gap-4 text-sm">
          <span className="font-medium text-gold">
            Step {step + 1} of {STEP_TITLES.length}
          </span>
          <span className="truncate text-subtle">{STEP_TITLES[step]}</span>
        </div>
        <div
          role="progressbar"
          aria-label="Checkup progress"
          aria-valuemin={1}
          aria-valuemax={STEP_TITLES.length}
          aria-valuenow={step + 1}
          className="mt-3 grid gap-1.5"
          style={{ gridTemplateColumns: `repeat(${STEP_TITLES.length}, 1fr)` }}
        >
          {STEP_TITLES.map((t, i) => (
            <span key={t} className={cn("h-1.5 rounded-full transition-colors duration-500", i <= step ? "bg-gold" : "bg-line-strong")} />
          ))}
        </div>
        {restored && (
          <p className="mt-4 text-sm text-muted">
            We restored your progress.{" "}
            <button type="button" onClick={startOver} className="text-gold underline-offset-4 hover:underline">
              Start over
            </button>
          </p>
        )}
      </div>

      <form onSubmit={onSubmit} noValidate className="relative mt-8">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <m.div
            key={step}
            custom={direction}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold tracking-tight outline-none md:text-3xl">
              {current ? current.title : "Review & submit"}
            </h2>
            <p className="mt-2 text-muted">
              {current ? current.description : "Check your answers, then tell us where to send your results."}
            </p>

            {current ? (
              <div className="mt-8 space-y-8">
                {current.questions.map((q) => (
                  <QuestionField
                    key={q.id}
                    question={q}
                    register={register}
                    error={answerError(q.id)}
                    value={watch(`answers.${q.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-8 space-y-8">
                {/* Summary of every step, each editable */}
                <ul className="divide-y divide-line rounded-2xl border border-line">
                  {checkupSteps.map((s, i) => (
                    <li key={s.id} className="p-5">
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="font-semibold">{s.title}</h3>
                        <button type="button" onClick={() => goTo(i)} className="text-sm text-gold hover:underline">
                          Edit
                        </button>
                      </div>
                      <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                        {s.questions.map((q) => (
                          <div key={q.id} className="min-w-0">
                            <dt className="text-subtle">{q.label}</dt>
                            <dd className="break-words text-fg">{describeAnswer(q, watch(`answers.${q.id}`))}</dd>
                          </div>
                        ))}
                      </dl>
                    </li>
                  ))}
                </ul>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Full name" required error={errors.contact?.name?.message}>
                    {(a11y) => <Input {...a11y} {...register("contact.name")} autoComplete="name" />}
                  </Field>
                  <Field label="Email" required error={errors.contact?.email?.message}>
                    {(a11y) => <Input {...a11y} {...register("contact.email")} type="email" autoComplete="email" />}
                  </Field>
                  <Field label="Phone" required error={errors.contact?.phone?.message}>
                    {(a11y) => <Input {...a11y} {...register("contact.phone")} type="tel" autoComplete="tel" />}
                  </Field>
                  <Field label="Company" error={errors.contact?.company?.message}>
                    {(a11y) => <Input {...a11y} {...register("contact.company")} autoComplete="organization" />}
                  </Field>
                </div>

                <div>
                  <label className="flex items-start gap-3 text-sm text-muted">
                    <input type="checkbox" {...register("consent")} className="mt-0.5 h-4 w-4 accent-[var(--color-gold)]" />
                    I agree that Riyadvi may contact me about my results. We never share your details.
                  </label>
                  {errors.consent?.message && (
                    <p role="alert" className="mt-2 text-sm text-[#f87171]">
                      {errors.consent.message}
                    </p>
                  )}
                </div>
                <Honeypot {...register("website")} />
              </div>
            )}
          </m.div>
        </AnimatePresence>

        <div className="mt-10 flex flex-col gap-4">
          <FormError status={serverError ? "error" : "idle"} message={serverError} />
          <div className="flex items-center justify-between gap-4">
            <Button type="button" variant="ghost" onClick={() => goTo(step - 1)} disabled={step === 0}>
              ← Back
            </Button>
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {step < LAST ? "Next →" : isSubmitting ? "Calculating…" : "Get my results"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
