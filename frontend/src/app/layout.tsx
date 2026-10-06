import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { siteConfig } from "@/lib/site";
import { MotionProvider } from "@/animation/MotionProvider";
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

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Custom Software & Digital Solutions`,
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
    <html lang="en" className={inter.variable}>
      <body className="min-h-dvh">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
