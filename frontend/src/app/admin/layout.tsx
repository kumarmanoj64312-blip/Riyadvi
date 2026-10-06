import type { Metadata } from "next";

/** Admin area: kept out of search engines; no site chrome, 3D canvas or smooth scroll. */
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Riyadvi Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-surface">{children}</div>;
}
