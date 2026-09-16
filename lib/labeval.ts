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

const profileLlmSchema = z.object({
  id: z.string(),
  kind: z.literal("profile-llm"),
  computed_at: z.string(),
  pipeline_version: z.string(),
  method: z.string(),
  n: z.number(),
  sample_size: z.number(),
  seed: z.number(),
  csv: z.string(),
  llm: z.object({
    provider: z.string(),
    model: z.string(),
    live: z.boolean(),
    prompt_version: z.string(),
  }),
  rows: z.array(
    profileRowSchema.extend({
      c: z.union([z.string(), z.number()]).nullable(),
      c_error: z.number(),
    }),
  ),
  summary: z.object({
    a_mean_error: z.number(),
    b_mean_error: z.number(),
    c_mean_error: z.number(),
    a_mean_capped_error: z.number(),
    b_mean_capped_error: z.number(),
    c_mean_capped_error: z.number(),
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

const hitlAgentSchema = z.object({
  id: z.string(),
  kind: z.literal("hitl-agent"),
  computed_at: z.string(),
  pipeline_version: z.string(),
  method: z.string(),
  source_repo: z.string(),
  source_commit: z.string(),
  n: z.number(),
  cases: z.string(),
  rows: z.array(
    z.object({
      id: z.string(),
      gold_category: z.string(),
      pred_category: z.string(),
      category_ok: z.boolean(),
      confidence: z.number(),
      signals: z.array(z.string()),
      gold_output_type: z.string(),
      pred_output_type: z.string(),
      tool_choice_ok: z.boolean(),
      gold_max_autonomy: z.string(),
      pred_autonomy: z.string(),
      false_autonomy: z.boolean(),
      human_review: z.boolean(),
      schema_ok: z.boolean(),
      extraction_hits: z.record(z.string(), z.boolean()),
      extraction_ok: z.boolean(),
      priority: z.string(),
      action_requested: z.string(),
      tone: z.string(),
      channel: z.string(),
      global_score: z.number(),
      risk_level: z.string(),
      strategy: z.array(z.string()),
    }),
  ),
  summary: z.object({
    n: z.number(),
    classification_accuracy: z.number(),
    extraction_accuracy: z.number(),
    tool_choice_accuracy: z.number(),
    schema_validity: z.number(),
    false_autonomy_rate: z.number(),
    human_review_rate: z.number(),
  }),
});

const runSchema = z.discriminatedUnion("kind", [
  profileAbSchema,
  profileLlmSchema,
  visionDigitsSchema,
  hitlAgentSchema,
]);

export type LabRun = z.infer<typeof runSchema>;

const runDir = path.join(process.cwd(), "data", "labeval");

const runFiles: Record<string, string> = {
  "profile-ab.v1": "profile-ab.v1.json",
  "profile-llm.v1": "profile-llm.v1.json",
  "vision-digits.v1": "vision-digits.v1.json",
  "hitl-agent.v1": "hitl-agent.v1.json",
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
