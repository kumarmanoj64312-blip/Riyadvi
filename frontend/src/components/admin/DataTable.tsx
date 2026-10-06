import Link from "next/link";
import type { ReactNode } from "react";
import { TableToolbar } from "@/components/admin/TableToolbar";
import type { Paginated } from "@/lib/adminServer";

export type Column<T> = { header: string; cell: (row: T) => ReactNode; className?: string };

type Props<T extends { id: string }> = {
  title: string;
  description: string;
  data: Paginated<T>;
  columns: Column<T>[];
  /** Current query, used to build pagination links. */
  query: Record<string, string | undefined>;
  basePath: string;
};

/**
 * Generic admin table (Server Component): column definitions in, accessible
 * table + toolbar + pagination out. Every lead type reuses it.
 */
export function DataTable<T extends { id: string }>({ title, description, data, columns, query, basePath }: Props<T>) {
  const pageHref = (page: number) => {
    const p = new URLSearchParams(Object.entries(query).filter((e): e is [string, string] => Boolean(e[1])));
    p.set("page", String(page));
    return `${basePath}?${p.toString()}`;
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted">
          {description} · {data.total} total
        </p>
      </header>
      <TableToolbar statuses={data.statuses} />

      <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-ink">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-[0.12em] text-subtle">
            <tr>
              {columns.map((c) => (
                <th key={c.header} scope="col" className="px-4 py-3 font-medium">
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {data.items.map((row) => (
              <tr key={row.id} className="align-top transition-colors hover:bg-white/[0.02]">
                {columns.map((c) => (
                  <td key={c.header} className={c.className ?? "px-4 py-3"}>
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
            {data.items.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-muted">
                  Nothing here yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data.pages > 1 && (
        <nav aria-label="Pagination" className="mt-4 flex items-center justify-between text-sm">
          <span className="text-subtle">
            Page {data.page} of {data.pages}
          </span>
          <div className="flex gap-2">
            {data.page > 1 && (
              <Link href={pageHref(data.page - 1)} className="rounded-full border border-line-strong px-4 py-1.5 hover:border-gold">
                Previous
              </Link>
            )}
            {data.page < data.pages && (
              <Link href={pageHref(data.page + 1)} className="rounded-full border border-line-strong px-4 py-1.5 hover:border-gold">
                Next
              </Link>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
