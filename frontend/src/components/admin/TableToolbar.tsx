"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Search + status filter stored in the URL (?q=&status=) — so filtered views
 * are shareable/bookmarkable and the server renders the filtered data.
 */
export function TableToolbar({ statuses }: { statuses: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page"); // new filter → back to page 1
    router.replace(`${pathname}?${next.toString()}`);
  };

  // Debounced search: query the server 300ms after typing stops.
  useEffect(() => {
    if (q === (params.get("q") ?? "")) return;
    const t = setTimeout(() => update("q", q.trim()), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the typed value changes
  }, [q]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <label className="flex-1">
        <span className="sr-only">Search</span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, email, company…"
          className="h-10 w-full rounded-full border border-line-strong bg-ink px-4 text-sm text-fg placeholder:text-subtle focus:border-gold focus:outline-none"
        />
      </label>
      <label>
        <span className="sr-only">Filter by status</span>
        <select
          value={params.get("status") ?? ""}
          onChange={(e) => update("status", e.target.value)}
          className="h-10 rounded-full border border-line-strong bg-ink px-4 text-sm capitalize text-fg focus:border-gold focus:outline-none"
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
