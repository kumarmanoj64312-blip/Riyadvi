"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { postJson } from "@/lib/apiClient";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/forms/fields";
import { FormError } from "@/components/forms/FormStatus";

const schema = z.object({
  email: z.string().trim().min(1, "Email is required."),
  password: z.string().min(1, "Password is required."),
});
type Values = z.infer<typeof schema>;

/**
 * POST /api/admin/login → the API sets an httpOnly session cookie (same
 * origin — the API is part of this app). Nothing is stored in localStorage.
 */
export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Values) => {
    setError("");
    const res = await postJson("/admin/login", values);
    if (res.ok) {
      router.replace("/admin");
      router.refresh();
    } else {
      setError(res.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
      <Field label="Email" error={errors.email?.message}>
        {(a11y) => <Input {...a11y} {...register("email")} type="email" autoComplete="username" />}
      </Field>
      <Field label="Password" error={errors.password?.message}>
        {(a11y) => (
          <div className="relative">
            <Input
              {...a11y}
              {...register("password")}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="pr-12"
            />
            {/* Show/hide toggle — a real button, so it's keyboard- and screen-reader accessible */}
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-subtle transition-colors hover:text-gold focus-visible:text-gold"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" />
                {showPassword && <path d="M3 3l18 18" />}
              </svg>
            </button>
          </div>
        )}
      </Field>
      <FormError status={error ? "error" : "idle"} message={error} />
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
