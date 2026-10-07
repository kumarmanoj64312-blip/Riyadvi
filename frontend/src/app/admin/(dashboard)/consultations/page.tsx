import type { Metadata } from "next";
import { adminList } from "@/lib/adminServer";
import { DataTable } from "@/components/admin/DataTable";
import { DateCell, Muted, PersonCell } from "@/components/admin/cells";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Consultations" };

type Row = { id: string; name: string; email: string; phone: string; preferredDate: string; preferredTime: string; requirement: string; notes: string; status: string; createdAt: string };

export default async function ConsultationsPage({ searchParams }: PageProps<"/admin/consultations">) {
  const { q, status, page } = (await searchParams) as Record<string, string | undefined>;
  const query = { q, status, page };
  const data = await adminList<Row>("consultations", query);

  return (
    <DataTable
      title="Consultation requests"
      description="Free consultation bookings"
      data={data}
      query={query}
      basePath="/admin/consultations"
      columns={[
        { header: "Name", cell: (r) => <PersonCell name={r.name} email={r.email} phone={r.phone} /> },
        {
          header: "Preferred slot",
          cell: (r) => (
            <span className="whitespace-nowrap">
              {formatDate(r.preferredDate.slice(0, 10))} <Muted>· {r.preferredTime}</Muted>
            </span>
          ),
        },
        { header: "Topic", cell: (r) => r.requirement },
        { header: "Notes", cell: (r) => <p className="line-clamp-3 max-w-xs text-xs text-muted">{r.notes || "—"}</p> },
        { header: "Requested", cell: (r) => <DateCell iso={r.createdAt} /> },
        { header: "Status", cell: (r) => <StatusSelect collection="consultations" id={r.id} status={r.status} statuses={data.statuses} /> },
      ]}
    />
  );
}
