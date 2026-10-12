"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// The form's code (react-hook-form, zod, the combobox) is split into its own chunk…
const ContactForm = dynamic(() => import("@/components/forms/ContactForm").then((m) => m.ContactForm), {
  ssr: false,
  loading: () => null,
});

type Props = { requirements: { value: string; label: string }[] };

/**
 * …and only downloaded when the visitor scrolls within ~1 screen of it.
 *
 * Used for the contact form at the very bottom of the home page: hydrating it
 * at load made the home page's JavaScript (and its Lighthouse LCP) measurably
 * worse, although nobody can see it yet. The placeholder reserves the form's
 * height so nothing shifts (CLS 0) when it mounts. /contact still renders the
 * form directly, since there it IS the main content.
 */
export function LazyContactForm({ requirements }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="min-h-[34rem] md:min-h-[30rem]">
      {show ? (
        <ContactForm requirements={requirements} />
      ) : (
        <p className="text-sm text-subtle">
          Loading the form… If it doesn&apos;t appear, use the <a href="/contact" className="text-gold underline">contact page</a>.
        </p>
      )}
    </div>
  );
}
