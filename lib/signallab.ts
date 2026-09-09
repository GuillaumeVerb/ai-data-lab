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

export type SignalLabSeries = {
  source_id: string;
  observations: SignalLabObservation[];
};

const snapshotDir = path.join(process.cwd(), "data", "signallab", "snapshots");

export function utcDay(observedAt: string): string | null {
  const match = observedAt.match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1] ?? null;
}

export function lastObservationPerUtcDay(
  observations: SignalLabObservation[],
): SignalLabObservation[] {
  const byDay = new Map<string, SignalLabObservation>();
  for (const item of observations) {
    const day = utcDay(item.observed_at);
    if (!day) continue;
    byDay.set(day, item);
  }
  return [...byDay.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, item]) => item);
}

export function getTopicSeries(topicId: string): SignalLabSeries[] {
  if (!fs.existsSync(snapshotDir)) return [];
  const files = fs
    .readdirSync(snapshotDir)
    .filter(
      (file) =>
        file === `${topicId}.json` ||
        (file.startsWith(`${topicId}.`) && file.endsWith(".json")),
    )
    .sort();

  const series: SignalLabSeries[] = [];
  for (const file of files) {
    try {
      const snapshot = snapshotSchema.parse(
        JSON.parse(fs.readFileSync(path.join(snapshotDir, file), "utf8")),
      );
      const observations = lastObservationPerUtcDay(snapshot.observations);
      if (observations.length) {
        series.push({ source_id: snapshot.source_id, observations });
      }
    } catch {
      continue;
    }
  }
  return series;
}

export function getLatestObservations(topicId: string): SignalLabObservation[] {
  return getTopicSeries(topicId)
    .map((item) => item.observations.at(-1))
    .filter((item): item is SignalLabObservation => Boolean(item));
}
