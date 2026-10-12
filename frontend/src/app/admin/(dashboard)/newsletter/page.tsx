import type { Metadata } from "next";
import { adminList } from "@/lib/adminServer";
import { DataTable } from "@/components/admin/DataTable";
import { DateCell } from "@/components/admin/cells";
import { StatusSelect } from "@/components/admin/StatusSelect";

export const metadata: Metadata = { title: "Newsletter" };

type Row = { id: string; email: string; sourcePage: string; status: string; createdAt: string };

/** /admin/newsletter: footer signups; mark them "added" once exported to the mailing tool. */
export default async function NewsletterPage({ searchParams }: PageProps<"/admin/newsletter">) {
  const { q, status, page } = (await searchParams) as Record<string, string | undefined>;
  const query = { q, status, page };
  const data = await adminList<Row>("newsletter", query);

  return (
    <DataTable
      title="Newsletter subscribers"
      description="Signups from the site footer"
      data={data}
      query={query}
      basePath="/admin/newsletter"
      columns={[
        {
          header: "Email",
          cell: (r) => (
            <a href={`mailto:${r.email}`} className="text-fg hover:text-gold">
              {r.email}
            </a>
          ),
        },
        { header: "Signed up on", cell: (r) => <span className="text-xs text-muted">{r.sourcePage || "-"}</span> },
        { header: "Date", cell: (r) => <DateCell iso={r.createdAt} /> },
        {
          header: "Status",
          cell: (r) => <StatusSelect collection="newsletter" id={r.id} status={r.status} statuses={data.statuses} />,
        },
      ]}
    />
  );
}
