import { z } from "zod";
import { AREA_RECOMMENDATIONS, checkupSteps, type CheckupQuestion } from "@/data/healthCheckup";
import { HealthCheckupLead } from "../models/HealthCheckupLead";
import { notifyTeamInBackground } from "./notification.service";
import type { RequestMeta } from "./lead.service";

/*
 * Business Health Checkup engine.
 *
 * The questionnaire is DATA (src/data/healthCheckup.ts) and this server code
 * imports the very same module as the multi-step form, so validation, scoring
 * and recommendations can never disagree with the questions the visitor saw.
 * (With a separate backend this needed an exported JSON copy — now it's one file.)
 */
const questions = checkupSteps.flatMap((s) => s.questions);

type Answers = Record<string, unknown>;

/* ─── Validation built from the config ───────────────────────────────── */

function ruleFor(q: CheckupQuestion): z.ZodType {
  const values = (q.options ?? []).map((o) => o.value);
  let rule: z.ZodType;
  switch (q.type) {
    case "single":
    case "select":
      rule = z.enum(values as [string, ...string[]], { error: "Please choose an option." });
      break;
    case "multi":
      rule = z
        .array(z.enum(values as [string, ...string[]]))
        .max(q.max ?? values.length, `Please choose up to ${q.max ?? values.length}.`)
        .min(q.required ? 1 : 0, "Please choose at least one.");
      break;
    case "rating":
      rule = z.coerce.number().int().min(1, "Please choose a rating.").max(5);
      break;
    default: // text
      rule = z.string().trim().max(q.maxLength ?? 500);
  }
  return q.required ? rule : rule.optional();
}

/** Zod schema for `answers`: exactly the configured question ids, nothing else. */
export const answersSchema = z.object(Object.fromEntries(questions.map((q) => [q.id, ruleFor(q)])));

/* ─── Scoring ────────────────────────────────────────────────────────── */

/** Points (0–10) a single answer earns, and the max it could have earned. */
function points(q: CheckupQuestion, answer: unknown): { got: number; max: number } {
  const opts = q.options ?? [];
  if (q.type === "rating") return { got: answer ? (Number(answer) - 1) * 2.5 : 0, max: 10 };
  if (q.type === "multi") {
    const max = Math.min(10, opts.reduce((s, o) => s + (o.score ?? 0), 0));
    const got = ((answer as string[] | undefined) ?? []).reduce((s, v) => s + (opts.find((o) => o.value === v)?.score ?? 0), 0);
    return { got: Math.min(got, max), max };
  }
  const max = Math.max(0, ...opts.map((o) => o.score ?? 0));
  return { got: opts.find((o) => o.value === answer)?.score ?? 0, max };
}

/** Per-area 0–100 scores + overall average. */
export function scoreAnswers(answers: Answers) {
  const totals: Record<string, { got: number; max: number }> = {};
  for (const q of questions) {
    if (!q.area) continue;
    const { got, max } = points(q, answers[q.id]);
    totals[q.area] ??= { got: 0, max: 0 };
    totals[q.area].got += got;
    totals[q.area].max += max;
  }
  const areas = Object.fromEntries(
    Object.entries(totals).map(([area, t]) => [area, t.max ? Math.round((t.got / t.max) * 100) : 0]),
  );
  const values = Object.values(areas);
  const total = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
  return { total, areas };
}

/**
 * Up to 3 service slugs, most relevant first:
 *  1. services suggested by the visitor's own answers (goal, challenges…)
 *  2. services for weak areas (score < 60), weakest first
 */
export function recommend(answers: Answers, areas: Record<string, number>): string[] {
  const votes = new Map<string, number>();
  const vote = (slug: string, weight: number) => votes.set(slug, (votes.get(slug) ?? 0) + weight);

  for (const q of questions) {
    const picked = [answers[q.id]].flat().filter(Boolean);
    for (const v of picked) {
      const slug = q.options?.find((o) => o.value === v)?.recommends;
      if (slug) vote(slug, 2);
    }
  }
  Object.entries(areas)
    .filter(([, score]) => score < 60)
    .sort((a, b) => a[1] - b[1])
    .forEach(([area, score]) =>
      (AREA_RECOMMENDATIONS[area as keyof typeof AREA_RECOMMENDATIONS] ?? []).forEach((slug) => vote(slug, (60 - score) / 20)),
    );

  return [...votes.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([slug]) => slug);
}

/* ─── Use case ───────────────────────────────────────────────────────── */

type Submission = {
  answers: Answers;
  contact: { name: string; email: string; phone: string; company: string };
  sourcePage: string;
};

export async function submitHealthCheckup({ answers, contact, sourcePage }: Submission, meta: RequestMeta) {
  const score = scoreAnswers(answers);
  const recommendations = recommend(answers, score.areas);

  const lead = await HealthCheckupLead.create({
    ...contact,
    answers,
    score,
    recommendations,
    sourcePage,
    userAgent: meta.userAgent,
  });

  notifyTeamInBackground(
    `New Health Checkup: ${contact.name} — score ${score.total}/100`,
    {
      Name: contact.name,
      Email: contact.email,
      Phone: contact.phone,
      Company: contact.company || "—",
      Score: `${score.total}/100 (${Object.entries(score.areas)
        .map(([a, s]) => `${a} ${s}`)
        .join(", ")})`,
      Recommended: recommendations.join(", "),
      Challenges: ((answers.challenges as string[] | undefined) ?? []).join(", "),
      Timeline: (answers.timeline as string | undefined) ?? "—",
    },
    contact.email,
  );

  return { id: lead.id as string, score, recommendations };
}
