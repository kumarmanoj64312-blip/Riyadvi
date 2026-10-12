import type { Service } from "@/types/content";

/** Non-service options for "What do you need help with?". */
const EXTRA_REQUIREMENTS = [
  { value: "business-strategy", label: "Business strategy / consulting" },
  { value: "other", label: "Something else" },
];

/**
 * Options for the contact / consultation forms: every service (so a new
 * service appears automatically) plus the extras. Shared by /contact and the
 * home page's closing contact section, so both always offer the same list.
 */
export function contactRequirements(services: Service[]) {
  return [...services.map((s) => ({ value: s.slug, label: s.title })), ...EXTRA_REQUIREMENTS];
}
