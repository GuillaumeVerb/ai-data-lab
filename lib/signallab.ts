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

export function getLatestObservations(topicId: string): SignalLabObservation[] {
  if (!fs.existsSync(snapshotDir)) return [];
  const files = fs
    .readdirSync(snapshotDir)
    .filter(
      (file) =>
        file === `${topicId}.json` ||
        (file.startsWith(`${topicId}.`) && file.endsWith(".json")),
    )
    .sort();

  const latest: SignalLabObservation[] = [];
  for (const file of files) {
    try {
      const snapshot = snapshotSchema.parse(
        JSON.parse(fs.readFileSync(path.join(snapshotDir, file), "utf8")),
      );
      const observation = snapshot.observations.at(-1);
      if (observation) latest.push(observation);
    } catch {
      continue;
    }
  }
  return latest;
}
