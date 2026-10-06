"use client";

import { useMemo } from "react";
import Link from "next/link";
import { m, useMotionTemplate, useMotionValue, useReducedMotion } from "motion/react";
import { SceneView } from "@/three/canvas/SceneView";
import { ServiceFallback } from "@/three/fallbacks/ServiceFallback";
import type { Service } from "@/types/content";

export type ServiceCardData = Pick<Service, "slug" | "title" | "tagline" | "sceneType">;

type Props = { service: ServiceCardData; index: number };

/**
 * Interactive service card — NOT a static card:
 *  - its own live 3D visual (ServiceScene "tile" variant) that reacts when the
 *    card is hovered (the card is the `data-scene-host`)
 *  - Motion: staggered entrance, hover lift, and a gold spotlight that follows
 *    the cursor (motion values → no React re-render on pointer move)
 *  - the whole card links to the service's own page
 */
export function ServiceTile({ service, index }: Props) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(-500);
  const my = useMotionValue(-500);
  const spotlight = useMotionTemplate`radial-gradient(380px circle at ${mx}px ${my}px, rgb(212 175 55 / 0.13), transparent 70%)`;

  const params = useMemo(() => ({ serviceType: service.sceneType, variant: "tile" as const }), [service.sceneType]);

  return (
    <m.div
      initial={reduce ? false : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: (index % 3) * 0.08 }}
      whileHover={reduce ? undefined : { y: -6 }}
      className="h-full"
    >
      <Link
        href={`/services/${service.slug}`}
        data-scene-host
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set(e.clientX - r.left);
          my.set(e.clientY - r.top);
        }}
        onPointerLeave={() => {
          mx.set(-500);
          my.set(-500);
        }}
        className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line transition-colors duration-500 hover:border-gold/40"
      >
        {/* Transparent visual area: the shared WebGL canvas shows through here. */}
        <div className="relative aspect-[4/3]">
          <SceneView
            scene="service"
            params={params}
            fallback={<ServiceFallback type={service.sceneType} />}
            className="absolute inset-0"
          />
        </div>

        <div className="relative mt-auto bg-gradient-to-t from-surface-2 to-transparent p-6 pt-2">
          <p className="font-mono text-xs tracking-widest text-gold">{String(index + 1).padStart(2, "0")}</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight">{service.title}</h3>
          <p className="mt-1 text-sm text-muted">{service.tagline}</p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gold">
            Explore
            <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </span>
        </div>

        {/* Cursor spotlight (above the 3D, below nothing interactive). */}
        <m.div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: spotlight }} />
      </Link>
    </m.div>
  );
}
