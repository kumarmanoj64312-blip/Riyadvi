import type { Metadata } from "next";
import { Logo } from "@/components/layout/Logo";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Logo />
        <div className="mt-8 rounded-3xl border border-line bg-ink p-8">
          <h1 className="text-2xl font-semibold tracking-tight">Admin sign in</h1>
          <p className="mt-1 text-sm text-muted">Leads, enquiries and applications.</p>
          <div className="mt-6">
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
