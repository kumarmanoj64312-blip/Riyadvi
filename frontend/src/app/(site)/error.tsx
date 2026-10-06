"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { whatsappLink } from "@/lib/site";

/**
 * Branded error boundary for public pages: the navbar/footer (layout) stay,
 * only the broken page content is replaced. Offers retry + real contact paths
 * so a visitor with intent is never lost.
 */
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="container-site flex min-h-[70dvh] flex-col items-start justify-center pt-28">
      <p className="text-sm font-medium uppercase tracking-[0.25em] text-gold">Something went wrong</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">This page hit a snag.</h1>
      <p className="mt-4 max-w-lg text-muted">
        Please try again. If it keeps happening, reach us directly — we&apos;ll respond within one business day.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button type="button" onClick={reset}>
          Try again
        </Button>
        <Button href={whatsappLink("Hi Riyadvi, I ran into an error on your website.")} variant="secondary">
          Message us on WhatsApp
        </Button>
      </div>
      {error.digest && <p className="mt-8 font-mono text-xs text-subtle">Reference: {error.digest}</p>}
    </section>
  );
}
