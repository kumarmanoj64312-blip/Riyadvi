import type { Metadata } from "next";
import { adminList } from "@/lib/adminServer";
import { DataTable } from "@/components/admin/DataTable";
import { DateCell, Muted, PersonCell } from "@/components/admin/cells";
import { StatusSelect } from "@/components/admin/StatusSelect";

export const metadata: Metadata = { title: "Health checkups" };

type Row = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  score: { total: number; areas: Record<string, number> };
  recommendations: string[];
  answers: Record<string, unknown>;
  status: string;
  createdAt: string;
};

export default async function HealthCheckupsPage({ searchParams }: PageProps<"/admin/health-checkups">) {
  const { q, status, page } = (await searchParams) as Record<string, string | undefined>;
  const query = { q, status, page };
  const data = await adminList<Row>("health-checkups", query);

  return (
    <DataTable
      title="Health checkup leads"
      description="Business Health Checkup submissions, scored on the server"
      data={data}
      query={query}
      basePath="/admin/health-checkups"
      columns={[
        { header: "Name", cell: (r) => <PersonCell name={r.name} email={r.email} phone={r.phone} /> },
        { header: "Company", cell: (r) => <Muted>{r.company || "—"}</Muted> },
        {
          header: "Score",
          cell: (r) => (
            <div>
              <p className="text-lg font-semibold text-gold">{r.score?.total ?? "—"}</p>
              <p className="text-[11px] text-subtle">
                {Object.entries(r.score?.areas ?? {})
                  .map(([a, s]) => `${a} ${s}`)
                  .join(" · ")}
              </p>
            </div>
          ),
        },
        { header: "Recommended", cell: (r) => <Muted>{r.recommendations.join(", ") || "—"}</Muted> },
        {
          header: "Challenges / timeline",
          cell: (r) => (
            <Muted>
              {[r.answers.challenges].flat().filter(Boolean).join(", ")} · {String(r.answers.timeline ?? "—")}
            </Muted>
          ),
        },
        { header: "Date", cell: (r) => <DateCell iso={r.createdAt} /> },
        { header: "Status", cell: (r) => <StatusSelect collection="health-checkups" id={r.id} status={r.status} statuses={data.statuses} /> },
      ]}
    />
  );
}
