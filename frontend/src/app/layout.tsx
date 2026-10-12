import type { Metadata, Viewport } from "next";
import { Inter, Syne } from "next/font/google";
import { siteConfig } from "@/lib/site";
import Script from "next/script";
import { MotionProvider } from "@/animation/MotionProvider";
import { PRELOADER_SCRIPT } from "@/components/layout/Preloader";
import "@/styles/globals.css";

/*
 * Inter via next/font: self-hosted at build time (no request to Google at
 * runtime), latin subset only, `swap` so text paints immediately with a
 * fallback font. Exposed as a CSS variable that the Tailwind theme reads.
 */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

/*
 * Display face for headings, big numbers and the marquee: Syne, a wide,
 * characterful grotesk with a design-studio feel, so hierarchy comes from
 * typeface contrast, not just size. Only the weights we use are shipped.
 */
const syne = Syne({
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700"],
  variable: "--font-syne",
  // Not preloaded: a high-priority font request competes with the CSS on the
  // critical path (measured in Lighthouse). Headings render in the fallback
  // stack first and swap as soon as the font arrives.
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} - Custom Software & Digital Solutions`,
    template: `%s | ${siteConfig.shortName}`, // pages set just "Services", "About"…
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

/**
 * Root layout: only the document shell. Site chrome (navbar, footer, smooth
 * scroll, 3D canvas) lives in app/(site)/layout.tsx so the admin dashboard
 * can opt out of all of it.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: the Preloader's inline script may add data-intro-seen to <html> before hydration.
    <html lang="en" className={`${inter.variable} ${syne.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh">
        {/* Decides before first paint whether the intro overlay shows (see Preloader). */}
        <Script id="rv-intro" strategy="beforeInteractive">
          {PRELOADER_SCRIPT}
        </Script>
        {/* Without JS, "view"-triggered SplitText would never start — show all text instead. */}
        <noscript>
          <style>{`.split-inner{transform:none!important;animation:none!important}`}</style>
        </noscript>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
