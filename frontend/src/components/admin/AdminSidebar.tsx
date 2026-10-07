"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { postJson } from "@/lib/apiClient";
import { cn } from "@/lib/cn";

/* Inline 20px stroke icons (no icon library needed). */
const icon = (d: ReactNode) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
    {d}
  </svg>
);
const ICONS = {
  dashboard: icon(<><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>),
  enquiries: icon(<><path d="M4 5h16v11H8l-4 4z" /></>),
  consultations: icon(<><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></>),
  checkups: icon(<><path d="M3 12h4l3-7 4 14 3-7h4" /></>),
  downloads: icon(<><path d="M12 3v12m0 0-4-4m4 4 4-4M4 19h16" /></>),
  applications: icon(<><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>),
  home: icon(<><path d="M3 11 12 4l9 7" /><path d="M5 10v10h14V10" /></>),
  logout: icon(<><path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" /></>),
};

export const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: ICONS.dashboard, group: "Overview" },
  { href: "/admin/enquiries", label: "Enquiries", icon: ICONS.enquiries, group: "Leads" },
  { href: "/admin/consultations", label: "Consultations", icon: ICONS.consultations, group: "Leads" },
  { href: "/admin/health-checkups", label: "Health checkups", icon: ICONS.checkups, group: "Leads" },
  { href: "/admin/leads", label: "Guide downloads", icon: ICONS.downloads, group: "Leads" },
  { href: "/admin/applications", label: "Job applications", icon: ICONS.applications, group: "Leads" },
] as const;
const GROUPS = ["Overview", "Leads"] as const;

/**
 * Admin navigation. Desktop: fixed-height column (logo · grouped nav ·
 * Home / account / logout pinned to the bottom with flexbox, no absolute
 * positioning). Mobile: compact top bar with a horizontally scrollable nav.
 */
export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const logout = async () => {
    if (signingOut) return; // guard against double clicks → duplicate requests
    setSigningOut(true);
    await postJson("/admin/logout", {});
    router.replace("/admin/login");
    router.refresh();
  };

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const navLink = (item: (typeof ADMIN_NAV)[number]) => {
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group relative flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
          active ? "bg-gold/10 text-gold" : "text-muted hover:bg-white/[0.04] hover:text-fg",
        )}
      >
        {/* Active indicator bar (desktop) */}
        <span aria-hidden="true" className={cn("absolute inset-y-2 -left-3 hidden w-0.5 rounded-full bg-gold lg:block", active ? "opacity-100" : "opacity-0")} />
        {item.icon}
        <span className="whitespace-nowrap">{item.label}</span>
      </Link>
    );
  };

  return (
    <aside className="z-20 border-b border-line bg-surface lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:border-b-0 lg:border-r">
      {/* Brand */}
      <div className="flex items-center justify-between gap-3 px-4 py-4 lg:px-6 lg:py-6">
        <div>
          <Logo href="/admin" label="admin dashboard" />
          <p className="mt-1 hidden pl-[38px] text-[11px] font-medium uppercase tracking-[0.18em] text-subtle lg:block">Admin panel</p>
        </div>
        {/* Mobile quick actions */}
        <div className="flex items-center gap-1 lg:hidden">
          <Link href="/" aria-label="Back to website home" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-white/5 hover:text-fg">
            {ICONS.home}
          </Link>
          <button type="button" onClick={logout} disabled={signingOut} aria-label="Log out" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-white/5 hover:text-fg disabled:opacity-50">
            {ICONS.logout}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-4 pb-3 [scrollbar-width:none] lg:flex-1 lg:flex-col lg:gap-6 lg:overflow-y-auto lg:px-6 lg:pb-6">
        {GROUPS.map((group) => (
          <div key={group} className="flex gap-1 lg:flex-col">
            <p className="hidden px-3 pb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-subtle lg:block">{group}</p>
            {ADMIN_NAV.filter((i) => i.group === group).map(navLink)}
          </div>
        ))}
      </nav>

      {/* Bottom: Home · account · logout (desktop) */}
      <div className="hidden border-t border-line p-4 lg:block">
        <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-white/[0.04] hover:text-fg">
          {ICONS.home}
          Home
          <span className="ml-auto text-xs text-subtle">View site ↗</span>
        </Link>
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-line bg-ink px-3 py-3">
          <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/15 text-sm font-semibold uppercase text-gold">
            {email.charAt(0)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-subtle">Signed in as</p>
            <p className="truncate text-sm text-fg" title={email}>
              {email}
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            disabled={signingOut}
            aria-label="Log out"
            title="Log out"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-gold disabled:opacity-50"
          >
            {ICONS.logout}
          </button>
        </div>
      </div>
    </aside>
  );
}
