import { readFileSync } from "node:fs";
import { z } from "zod";
import { HealthCheckupLead } from "../models/HealthCheckupLead.js";
import { notifyTeamInBackground } from "./notification.service.js";

/*
 * Business Health Checkup engine.
 *
 * The questionnaire is DATA (exported from frontend/src/data/healthCheckup.ts),
 * so validation, scoring and recommendations are all derived from it — the
 * frontend form and this server can never disagree about the questions.
 */
const config = JSON.parse(readFileSync(new URL("../seed/data/healthCheckup.json", import.meta.url), "utf8"));
const questions = config.steps.flatMap((s) => s.questions);

/* ─── Validation built from the config ───────────────────────────────── */

function ruleFor(q) {
  const values = (q.options ?? []).map((o) => o.value);
  let rule;
  switch (q.type) {
    case "single":
    case "select":
      rule = z.enum(values, { error: "Please choose an option." });
      break;
    case "multi":
      rule = z
        .array(z.enum(values))
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
function points(q, answer) {
  const opts = q.options ?? [];
  if (q.type === "rating") return { got: answer ? (answer - 1) * 2.5 : 0, max: 10 };
  if (q.type === "multi") {
    const max = Math.min(10, opts.reduce((s, o) => s + (o.score ?? 0), 0));
    const got = (answer ?? []).reduce((s, v) => s + (opts.find((o) => o.value === v)?.score ?? 0), 0);
    return { got: Math.min(got, max), max };
  }
  const max = Math.max(0, ...opts.map((o) => o.score ?? 0));
  return { got: opts.find((o) => o.value === answer)?.score ?? 0, max };
}

/** Per-area 0–100 scores + overall average. */
export function scoreAnswers(answers) {
  const totals = {};
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
export function recommend(answers, areas) {
  const votes = new Map();
  const vote = (slug, weight) => votes.set(slug, (votes.get(slug) ?? 0) + weight);

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
    .forEach(([area, score]) => (config.areaRecommendations[area] ?? []).forEach((slug) => vote(slug, (60 - score) / 20)));

  return [...votes.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([slug]) => slug);
}

/* ─── Use case ───────────────────────────────────────────────────────── */

export async function submitHealthCheckup({ answers, contact, sourcePage }, meta) {
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
      Score: `${score.total}/100 (${Object.entries(score.areas).map(([a, s]) => `${a} ${s}`).join(", ")})`,
      Recommended: recommendations.join(", "),
      Challenges: (answers.challenges ?? []).join(", "),
      Timeline: answers.timeline ?? "—",
    },
    contact.email,
  );

  return { id: lead.id, score, recommendations };
}
