import type { Metadata } from "next";
import { adminFetch, type Paginated } from "@/lib/adminServer";
import { DataTable } from "@/components/admin/DataTable";
import { DateCell, PersonCell } from "@/components/admin/cells";
import { StatusSelect } from "@/components/admin/StatusSelect";

export const metadata: Metadata = { title: "Guide downloads" };

type Row = { id: string; name: string; email: string; phone: string; company: string; resource: string; status: string; createdAt: string };

export default async function LeadMagnetPage({ searchParams }: PageProps<"/admin/leads">) {
  const { q, status, page } = (await searchParams) as Record<string, string | undefined>;
  const query = { q, status, page };
  const data = await adminFetch<Paginated<Row>>("/lead-magnet", query);

  return (
    <DataTable
      title="Lead magnet leads"
      description="Software Project Planning Guide downloads"
      data={data}
      query={query}
      basePath="/admin/leads"
      columns={[
        { header: "Name", cell: (r) => <PersonCell name={r.name} email={r.email} phone={r.phone} /> },
        { header: "Company", cell: (r) => r.company },
        { header: "Resource", cell: (r) => <span className="text-xs text-muted">{r.resource}</span> },
        { header: "Date", cell: (r) => <DateCell iso={r.createdAt} /> },
        { header: "Status", cell: (r) => <StatusSelect collection="lead-magnet" id={r.id} status={r.status} statuses={data.statuses} /> },
      ]}
    />
  );
}
