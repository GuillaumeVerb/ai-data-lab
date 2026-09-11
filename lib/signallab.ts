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

export type SignalLabTopicBoard = {
  day: string;
  sources: string[];
  rows: Array<{ topicId: string; values: Array<number | null> }>;
};

export function topicBoard(topicIds: string[]): SignalLabTopicBoard | null {
  const byTopic = topicIds.map((topicId) => ({
    topicId,
    series: getTopicSeries(topicId),
  }));
  const days = new Set<string>();
  for (const item of byTopic) {
    for (const day of utcDaysInSeries(item.series)) days.add(day);
  }
  const day = [...days].sort().at(-1);
  if (!day) return null;

  const sources = [...signalSourceOrder];
  return {
    day,
    sources,
    rows: byTopic.map(({ topicId, series }) => ({
      topicId,
      values: sources.map((sourceId) => {
        const source = series.find((item) => item.source_id === sourceId);
        if (!source) return null;
        return observationOnUtcDay(source, day)?.metrics.total_count ?? null;
      }),
    })),
  };
}

const lexiconPath = path.join(process.cwd(), "data", "signallab", "lexicon.json");

const termWeightSchema = z.object({
  term: z.string(),
  weight: z.number(),
});

const topicNeighborSchema = z.object({
  topic_id: z.string(),
  cosine: z.number(),
});

const lexiconClusterSchema = z.object({
  label: z.string(),
  size: z.number(),
});

const topicLexiconSchema = z.object({
  topic_id: z.string(),
  document_count: z.number(),
  terms: z.array(termWeightSchema).default([]),
  shared: z.array(z.string()).default([]),
  nearest: z.array(topicNeighborSchema).default([]),
  clusters: z.array(lexiconClusterSchema).default([]),
});

const lexiconDaySchema = z.object({
  computed_at: z.string(),
  day: z.string(),
  pipeline_version: z.string(),
  method: z.string(),
  topics: z.record(z.string(), topicLexiconSchema),
});

const lexiconStoreSchema = z.object({
  pipeline_version: z.string(),
  method: z.string(),
  days: z.array(lexiconDaySchema).default([]),
});

export type SignalLabTopicLexicon = z.infer<typeof topicLexiconSchema>;

export type SignalLabLexicon = {
  day: string;
  computedAt: string;
  method: string;
  pipelineVersion: string;
  topic: SignalLabTopicLexicon;
};

export function getTopicLexicon(topicId: string): SignalLabLexicon | null {
  if (!fs.existsSync(lexiconPath)) return null;
  try {
    const store = lexiconStoreSchema.parse(
      JSON.parse(fs.readFileSync(lexiconPath, "utf8")),
    );
    const latest = store.days.at(-1);
    const topic = latest?.topics[topicId];
    if (!latest || !topic) return null;
    return {
      day: latest.day,
      computedAt: latest.computed_at,
      method: latest.method,
      pipelineVersion: latest.pipeline_version,
      topic,
    };
  } catch {
    return null;
  }
}
