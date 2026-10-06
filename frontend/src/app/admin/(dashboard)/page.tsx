import Link from "next/link";
import { adminFetch, type Paginated } from "@/lib/adminServer";
import { PersonCell, DateCell } from "@/components/admin/cells";
import { StatusSelect } from "@/components/admin/StatusSelect";

type Stat = { total: number; new: number; thisWeek: number };
type Enquiry = { id: string; name: string; email: string; phone: string; requirement: string; status: string; createdAt: string };

const CARDS = [
  { key: "enquiries", label: "Total enquiries", href: "/admin/enquiries" },
  { key: "consultations", label: "Consultation requests", href: "/admin/consultations" },
  { key: "health-checkups", label: "Health checkup leads", href: "/admin/health-checkups" },
  { key: "lead-magnet", label: "Lead magnet leads", href: "/admin/leads" },
  { key: "applications", label: "Job applications", href: "/admin/applications" },
] as const;

/** /admin — totals per lead type + the latest enquiries to act on. */
export default async function AdminDashboard() {
  const [stats, latest] = await Promise.all([
    adminFetch<Record<string, Stat>>("/stats"),
    adminFetch<Paginated<Enquiry>>("/enquiries", { limit: "5" }),
  ]);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Every lead captured by the website, in one place.</p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {CARDS.map((c) => {
          const s = stats[c.key];
          return (
            <li key={c.key}>
              <Link href={c.href} className="block rounded-2xl border border-line bg-ink p-5 transition-colors hover:border-gold/40">
                <p className="text-sm text-muted">{c.label}</p>
                <p className="text-gold-gradient mt-2 text-4xl font-semibold tracking-tight">{s.total}</p>
                <p className="mt-2 text-xs text-subtle">
                  <span className={s.new > 0 ? "text-gold" : undefined}>{s.new} new</span> · {s.thisWeek} this week
                </p>
              </Link>
            </li>
          );
        })}
      </ul>

      <section aria-labelledby="latest-heading">
        <div className="flex items-baseline justify-between">
          <h2 id="latest-heading" className="text-lg font-semibold">
            Latest enquiries
          </h2>
          <Link href="/admin/enquiries" className="text-sm text-gold hover:underline">
            View all →
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-ink">
          {latest.items.map((e) => (
            <li key={e.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <PersonCell name={e.name} email={e.email} />
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted">{e.requirement}</span>
                <DateCell iso={e.createdAt} />
                <StatusSelect collection="enquiries" id={e.id} status={e.status} statuses={latest.statuses} />
              </div>
            </li>
          ))}
          {latest.items.length === 0 && <li className="p-8 text-center text-muted">No enquiries yet.</li>}
        </ul>
      </section>
    </div>
  );
}
