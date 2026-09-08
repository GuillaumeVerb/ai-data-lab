import "server-only";

import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

const observationSchema = z.object({
  topic_id: z.string(),
  observed_at: z.string(),
  source_id: z.string(),
  pipeline_version: z.string(),
  query: z.string(),
  metrics: z.record(z.string(), z.number()),
  sample_urls: z.array(z.string()).default([]),
  assumptions: z.string().optional(),
});

const snapshotSchema = z.object({
  topic_id: z.string(),
  source_id: z.string(),
  pipeline_version: z.string(),
  observations: z.array(observationSchema),
});

export type SignalLabObservation = z.infer<typeof observationSchema>;

const snapshotDir = path.join(process.cwd(), "data", "signallab", "snapshots");

export function getLatestObservation(topicId: string): SignalLabObservation | undefined {
  const file = path.join(snapshotDir, `${topicId}.json`);
  if (!fs.existsSync(file)) return undefined;
  try {
    const snapshot = snapshotSchema.parse(JSON.parse(fs.readFileSync(file, "utf8")));
    return snapshot.observations.at(-1);
  } catch {
    return undefined;
  }
}
