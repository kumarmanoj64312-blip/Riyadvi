import type { Metadata } from "next";
import { adminList } from "@/lib/adminServer";
import { DataTable } from "@/components/admin/DataTable";
import { DateCell, PersonCell } from "@/components/admin/cells";
import { StatusSelect } from "@/components/admin/StatusSelect";

export const metadata: Metadata = { title: "Job applications" };

type Row = {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  message: string;
  resume: { filename: string; size: number };
  status: string;
  createdAt: string;
};

/** Applications + authenticated resume download (streamed from GridFS via the /api proxy). */
export default async function ApplicationsPage({ searchParams }: PageProps<"/admin/applications">) {
  const { q, status, page } = (await searchParams) as Record<string, string | undefined>;
  const query = { q, status, page };
  const data = await adminList<Row>("applications", query);

  return (
    <DataTable
      title="Job applications"
      description="Applications from /careers"
      data={data}
      query={query}
      basePath="/admin/applications"
      columns={[
        { header: "Applicant", cell: (r) => <PersonCell name={r.name} email={r.email} phone={r.phone} /> },
        { header: "Position", cell: (r) => r.position },
        {
          header: "Resume",
          cell: (r) => (
            <a
              href={`/api/admin/applications/${r.id}/resume`}
              className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 px-3 py-1 text-xs text-gold hover:bg-gold/10"
            >
              ↓ Download <span className="text-subtle">({Math.round(r.resume.size / 1024)} KB)</span>
            </a>
          ),
        },
        { header: "Message", cell: (r) => <p className="line-clamp-3 max-w-xs text-xs text-muted">{r.message || "—"}</p> },
        { header: "Applied", cell: (r) => <DateCell iso={r.createdAt} /> },
        { header: "Status", cell: (r) => <StatusSelect collection="applications" id={r.id} status={r.status} statuses={data.statuses} /> },
      ]}
    />
  );
}
