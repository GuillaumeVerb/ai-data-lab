import "server-only";

import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

const profileRowSchema = z.object({
  stat: z.string(),
  truth: z.union([z.string(), z.number()]),
  a: z.union([z.string(), z.number()]),
  a_error: z.number(),
  b: z.union([z.string(), z.number()]),
  b_error: z.number(),
});

const profileAbSchema = z.object({
  id: z.string(),
  kind: z.literal("profile-ab"),
  computed_at: z.string(),
  pipeline_version: z.string(),
  method: z.string(),
  n: z.number(),
  sample_size: z.number(),
  seed: z.number(),
  csv: z.string(),
  rows: z.array(profileRowSchema),
  summary: z.object({
    a_mean_error: z.number(),
    b_mean_error: z.number(),
    a_mean_capped_error: z.number(),
    b_mean_capped_error: z.number(),
  }),
});

const visionDigitsSchema = z.object({
  id: z.string(),
  kind: z.literal("vision-digits"),
  computed_at: z.string(),
  pipeline_version: z.string(),
  method: z.string(),
  dataset: z.object({
    name: z.string(),
    url: z.string().optional(),
    n: z.number(),
    shape: z.array(z.number()),
    classes: z.number(),
  }),
  split: z.object({
    seed: z.number(),
    test_ratio: z.number(),
    n_train: z.number(),
    n_test: z.number(),
    majority_class: z.number(),
  }),
  class_balance_train: z.record(z.string(), z.number()),
  metrics: z.object({
    majority_accuracy: z.number(),
    centroid_accuracy: z.number(),
    majority_correct: z.number(),
    centroid_correct: z.number(),
    n_test: z.number(),
  }),
});

const runSchema = z.discriminatedUnion("kind", [
  profileAbSchema,
  visionDigitsSchema,
]);

export type LabRun = z.infer<typeof runSchema>;

const runDir = path.join(process.cwd(), "data", "labeval");

const runFiles: Record<string, string> = {
  "profile-ab.v1": "profile-ab.v1.json",
  "vision-digits.v1": "vision-digits.v1.json",
};

export function getLabRun(runId: string | undefined): LabRun | null {
  if (!runId) return null;
  const file = runFiles[runId];
  if (!file) return null;
  const full = path.join(runDir, file);
  if (!fs.existsSync(full)) return null;
  try {
    return runSchema.parse(JSON.parse(fs.readFileSync(full, "utf8")));
  } catch {
    return null;
  }
}
