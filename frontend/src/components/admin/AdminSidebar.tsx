"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { postJson } from "@/lib/apiClient";
import { cn } from "@/lib/cn";

export const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/consultations", label: "Consultations" },
  { href: "/admin/health-checkups", label: "Health checkups" },
  { href: "/admin/leads", label: "Guide downloads" },
  { href: "/admin/applications", label: "Job applications" },
];

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await postJson("/admin/logout", {});
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <aside className="border-b border-line bg-ink p-4 lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:border-r lg:p-6">
      <div className="flex items-center justify-between lg:block">
        <Logo />
        <p className="hidden text-xs text-subtle lg:mt-1 lg:block">Admin</p>
      </div>
      <nav aria-label="Admin" className="mt-4 flex gap-1 overflow-x-auto lg:mt-10 lg:flex-col">
        {ADMIN_NAV.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-lg px-3 py-2 text-sm transition-colors",
                active ? "bg-gold/10 text-gold" : "text-muted hover:bg-white/5 hover:text-fg",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-4 hidden border-t border-line pt-4 text-xs text-subtle lg:absolute lg:bottom-6 lg:left-6 lg:right-6 lg:block">
        <p className="truncate">{email}</p>
        <button type="button" onClick={logout} className="mt-2 text-gold hover:underline">
          Sign out
        </button>
      </div>
      <button type="button" onClick={logout} className="mt-3 text-xs text-gold lg:hidden">
        Sign out
      </button>
    </aside>
  );
}
