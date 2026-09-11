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

export const signalSourceOrder = [
  "github-search",
  "arxiv",
  "hacker-news",
  "huggingface",
] as const;

export type SignalLabCoverage = {
  sourceCount: number;
  dayCount: number;
  latestDay: string | null;
};

export type SignalLabVolumeGrid = {
  days: string[];
  sources: string[];
  values: Array<Array<number | null>>;
};

const snapshotDir = path.join(process.cwd(), "data", "signallab", "snapshots");

function sourceRank(sourceId: string): number {
  const index = signalSourceOrder.indexOf(
    sourceId as (typeof signalSourceOrder)[number],
  );
  return index === -1 ? signalSourceOrder.length : index;
}

export function utcDaysInSeries(series: SignalLabSeries[]): string[] {
  const days = new Set<string>();
  for (const item of series) {
    for (const observation of item.observations) {
      const day = utcDay(observation.observed_at);
      if (day) days.add(day);
    }
  }
  return [...days].sort();
}

export function seriesCoverage(series: SignalLabSeries[]): SignalLabCoverage {
  const days = utcDaysInSeries(series);
  return {
    sourceCount: series.length,
    dayCount: days.length,
    latestDay: days.at(-1) ?? null,
  };
}

export function observationOnUtcDay(
  series: SignalLabSeries,
  day: string,
): SignalLabObservation | undefined {
  return series.observations.find((item) => utcDay(item.observed_at) === day);
}

export function volumeGrid(series: SignalLabSeries[]): SignalLabVolumeGrid {
  const ordered = [...series].sort(
    (left, right) => sourceRank(left.source_id) - sourceRank(right.source_id),
  );
  const days = utcDaysInSeries(ordered);
  return {
    days,
    sources: ordered.map((item) => item.source_id),
    values: ordered.map((item) =>
      days.map((day) => {
        const observation = observationOnUtcDay(item, day);
        return observation?.metrics.total_count ?? null;
      }),
    ),
  };
}

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
  return series.sort(
    (left, right) => sourceRank(left.source_id) - sourceRank(right.source_id),
  );
}

export function getLatestObservations(topicId: string): SignalLabObservation[] {
  return getTopicSeries(topicId)
    .map((item) => item.observations.at(-1))
    .filter((item): item is SignalLabObservation => Boolean(item));
}
