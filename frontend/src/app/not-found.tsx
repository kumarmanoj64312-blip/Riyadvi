import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Page not found" };

/**
 * Global 404. It renders under the root layout (not the "(site)" group), so it
 * includes the navbar/footer itself to keep visitors inside the site.
 */
export default function NotFound() {
  return (
    <>
      <Navbar />
      <main id="main" className="container-site flex min-h-[80dvh] flex-col items-start justify-center pt-24">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-gold">Error 404</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
          This page drifted out of the network.
        </h1>
        <p className="mt-4 max-w-lg text-muted">
          The link may be outdated or the page may have moved. Let&apos;s get you back on track.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button href="/">Back to home</Button>
          <Button href="/contact" variant="secondary">
            Contact us
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
