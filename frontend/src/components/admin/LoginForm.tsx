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
 * origin thanks to the /api proxy). Nothing is stored in localStorage.
 */
export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
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
        {(a11y) => <Input {...a11y} {...register("password")} type="password" autoComplete="current-password" />}
      </Field>
      <FormError status={error ? "error" : "idle"} message={error} />
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
