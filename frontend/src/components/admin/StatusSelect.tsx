"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Combobox } from "@/components/ui/Combobox";

const TONE: Record<string, string> = {
  new: "border-gold/60 text-gold",
  contacted: "border-sky-400/50 text-sky-300",
  reviewing: "border-sky-400/50 text-sky-300",
  shortlisted: "border-violet-400/50 text-violet-300",
  hired: "border-emerald-400/50 text-emerald-300",
  closed: "border-line-strong text-subtle",
  rejected: "border-line-strong text-subtle",
};

/**
 * Inline status editor: optimistic update → PATCH (JSON, same-origin cookie)
 * → refresh server data. Reverts and shows an error if the request fails.
 */
export function StatusSelect({ collection, id, status, statuses }: { collection: string; id: string; status: string; statuses: string[] }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  const change = async (next: string) => {
    const previous = value;
    setValue(next);
    setError(false);
    const res = await fetch(`/api/admin/${collection}/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    }).catch(() => null);
    if (!res?.ok) {
      setValue(previous);
      setError(true);
      if (res?.status === 401) router.replace("/admin/login");
      return;
    }
    startTransition(() => router.refresh()); // re-fetch counts/filters on the server
  };

  return (
    <div className="w-36">
      <Combobox
        aria-label="Status"
        size="xs"
        searchable={false}
        value={value}
        disabled={pending}
        onChange={change}
        colorClass={error ? "border-[#f87171] bg-ink text-[#fca5a5]" : `bg-ink ${TONE[value] ?? "border-line-strong text-fg"}`}
        options={statuses.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
      />
    </div>
  );
}
