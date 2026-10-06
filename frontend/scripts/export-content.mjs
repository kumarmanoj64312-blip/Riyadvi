/**
 * Exports the typed content in src/data/*.ts to JSON for the backend seed.
 * The frontend data files stay the single source of truth.
 *
 *   npm run export:content   (→ ../backend/src/seed/data/*.json)
 *
 * Uses Node's built-in TypeScript type-stripping, so no build step is needed.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { services } from "../src/data/services.ts";
import { projects } from "../src/data/projects.ts";
import { posts } from "../src/data/posts.ts";
import { jobs } from "../src/data/jobs.ts";
import { checkupSteps, AREA_RECOMMENDATIONS } from "../src/data/healthCheckup.ts";

const outDir = fileURLToPath(new URL("../../backend/src/seed/data/", import.meta.url));
await mkdir(outDir, { recursive: true });

const collections = {
  services: services.map((s, order) => ({ ...s, order })),
  projects: projects.map((p, order) => ({ ...p, order })),
  posts: posts.map((p, order) => ({ ...p, order })),
  jobs: jobs.map((j, order) => ({ ...j, order })),
};

for (const [name, docs] of Object.entries(collections)) {
  await writeFile(`${outDir}${name}.json`, JSON.stringify(docs, null, 2) + "\n");
  console.log(`✓ ${name}: ${docs.length} documents → backend/src/seed/data/${name}.json`);
}

// Health checkup questionnaire: the backend validates & scores from this.
const checkup = { steps: checkupSteps, areaRecommendations: AREA_RECOMMENDATIONS };
await writeFile(`${outDir}healthCheckup.json`, JSON.stringify(checkup, null, 2) + "\n");
console.log(`✓ healthCheckup: ${checkupSteps.length} steps → backend/src/seed/data/healthCheckup.json`);
