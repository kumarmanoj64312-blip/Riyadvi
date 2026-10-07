import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminFetch } from "@/lib/adminServer";

/**
 * Protected admin shell. Verifies the session on the SERVER (GET /me) before
 * rendering anything — invalid/missing session → redirect to /admin/login.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const me = await adminFetch<{ email: string }>("/me");
  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[264px_1fr]">
      <AdminSidebar email={me.email} />
      <main id="main" className="min-w-0 p-4 sm:p-6 lg:p-10">
        {children}
      </main>
    </div>
  );
}
