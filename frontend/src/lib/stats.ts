import { siteConfig } from "@/lib/site";
import type { Project, Service } from "@/types/content";

/**
 * Company figures DERIVED from the content itself — never typed in by hand,
 * so they can't drift from (or overstate) what the site actually shows.
 */
export function companyStats(projects: Project[], services: Service[]) {
  const industries = new Set(projects.map((p) => p.industry)).size;
  return [
    { value: String(siteConfig.founded), label: "Founded" },
    { value: `${projects.length}`, label: "Featured case studies" },
    { value: `${industries}`, label: "Industries served" },
    { value: `${services.length}`, label: "Core capabilities" },
  ];
}
