import { z } from "zod";
import { checkupSteps, type CheckupQuestion } from "@/data/healthCheckup";

/*
 * Client-side logic for the Business Health Checkup, derived from the same
 * config the server validates and scores with (data/healthCheckup.ts).
 */

export const allQuestions = checkupSteps.flatMap((s) => s.questions);

/** Zod rule for one question — mirrors server/services/healthCheckup.service.ts. */
function ruleFor(q: CheckupQuestion) {
  const values = (q.options ?? []).map((o) => o.value) as [string, ...string[]];
  switch (q.type) {
    case "single":
    case "select": {
      const rule = z.enum(values, { error: "Please choose an option." });
      return q.required ? rule : rule.optional();
    }
    case "multi": {
      // Unchecked checkbox groups arrive as false/undefined → normalise to [].
      const rule = z.preprocess(
        (v) => (Array.isArray(v) ? v : v ? [v] : []),
        z
          .array(z.enum(values))
          .max(q.max ?? values.length, `Please choose up to ${q.max ?? values.length}.`)
          .min(q.required ? 1 : 0, "Please choose at least one."),
      );
      return rule;
    }
    case "rating": {
      const rule = z.coerce.number({ error: "Please choose a rating." }).int().min(1, "Please choose a rating.").max(5);
      return q.required ? rule : rule.optional();
    }
    default:
      return z.string().trim().max(q.maxLength ?? 500, "That's a bit long.").optional();
  }
}

export const checkupFormSchema = z.object({
  answers: z.object(Object.fromEntries(allQuestions.map((q) => [q.id, ruleFor(q)]))),
  contact: z.object({
    name: z.string().trim().min(2, "Please enter your name.").max(80),
    email: z.string().trim().max(120).pipe(z.email("Please enter a valid email address.")),
    phone: z.string().trim().regex(/^\+?[\d\s()-]{7,20}$/, "Please enter a valid phone number."),
    company: z.string().trim().max(120).optional(),
  }),
  consent: z.literal(true, { error: "Please agree so we can send your results." }),
  website: z.string().max(0).optional(), // honeypot
});

/** Loose form-state type (inputs hold strings/arrays before Zod coerces them). */
export type CheckupFormValues = {
  answers: Record<string, string | string[] | undefined>;
  contact: { name: string; email: string; phone: string; company?: string };
  consent: boolean;
  website?: string;
};

/** RHF field paths to validate before leaving step `i` (last step = contact). */
export function fieldsForStep(i: number): string[] {
  const step = checkupSteps[i];
  if (step) return step.questions.map((q) => `answers.${q.id}`);
  return ["contact.name", "contact.email", "contact.phone", "contact.company", "consent"];
}

/** Human-readable answer for the review screen. */
export function describeAnswer(q: CheckupQuestion, value: unknown): string {
  if (value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) return "—";
  if (q.type === "rating") return `${value} / 5`;
  if (q.type === "text") return String(value);
  const label = (v: string) => q.options?.find((o) => o.value === v)?.label ?? v;
  return Array.isArray(value) ? value.map(label).join(", ") : label(String(value));
}

/** Result returned by POST /api/health-checkup. */
export type CheckupResult = {
  id: string;
  score: { total: number; areas: Record<string, number> };
  recommendations: string[];
};
