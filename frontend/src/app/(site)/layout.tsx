import { LenisProvider } from "@/animation/LenisProvider";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { PointerFX } from "@/components/layout/PointerFX";
import { Preloader } from "@/components/layout/Preloader";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { SceneRoot } from "@/three/canvas/SceneRoot";

/**
 * Layout for every public page (the "(site)" route group doesn't appear in
 * URLs). Server Component — LenisProvider and Navbar are the only client
 * islands here; pages passed in as children stay server-rendered.
 *
 * <PointerFX> adds magnetic buttons, card tilt and the contact spotlight (desktop only).
 *
 * <SceneRoot> is the single global 3D canvas (fixed, behind everything).
 * It lives here — not in a page — so all scenes share one WebGL context
 * and it survives navigation between pages.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <LenisProvider>
      <Preloader />
      <SceneRoot />
      <div aria-hidden="true" className="grain" />
      <Navbar />
      {/* z-10: content paints above the fixed canvas (z-0). Sections that show
          3D simply leave their background transparent. */}
      <main id="main" className="relative z-10">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
      <PointerFX />
    </LenisProvider>
  );
}
