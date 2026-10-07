import type { Metadata } from "next";
import { adminList } from "@/lib/adminServer";
import { DataTable } from "@/components/admin/DataTable";
import { DateCell, Muted, PersonCell } from "@/components/admin/cells";
import { StatusSelect } from "@/components/admin/StatusSelect";

export const metadata: Metadata = { title: "Enquiries" };

type Row = { id: string; name: string; email: string; phone: string; company: string; requirement: string; message: string; status: string; createdAt: string };

export default async function EnquiriesPage({ searchParams }: PageProps<"/admin/enquiries">) {
  const { q, status, page } = (await searchParams) as Record<string, string | undefined>;
  const query = { q, status, page };
  const data = await adminList<Row>("enquiries", query);

  return (
    <DataTable
      title="Enquiries"
      description="Contact form & quote requests"
      data={data}
      query={query}
      basePath="/admin/enquiries"
      columns={[
        { header: "Name", cell: (r) => <PersonCell name={r.name} email={r.email} phone={r.phone} /> },
        { header: "Company", cell: (r) => <Muted>{r.company || "—"}</Muted> },
        { header: "Requirement", cell: (r) => r.requirement },
        { header: "Message", cell: (r) => <p className="line-clamp-3 max-w-xs text-xs text-muted">{r.message}</p> },
        { header: "Date", cell: (r) => <DateCell iso={r.createdAt} /> },
        { header: "Status", cell: (r) => <StatusSelect collection="enquiries" id={r.id} status={r.status} statuses={data.statuses} /> },
      ]}
    />
  );
}
