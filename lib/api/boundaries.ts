/**
 * Future API boundaries for SignalLab / Ask My Lab (Python + FastAPI).
 * Do not implement these in V0/V1. The Next.js app reads local Markdown.
 */

export type FutureEndpoints = {
  "GET /v1/signals": {
    query: { since?: string; topic?: string };
    response: { signals: FutureSignal[] };
  };
  "GET /v1/topics/:id": {
    response: { topic: FutureTopic; observations: FutureObservation[] };
  };
  "POST /v1/ask": {
    body: { mode: "about_me" | "ask_the_lab"; question: string; locale: "fr" | "en" };
    response: { answer: string; citations: FutureCitation[]; uncertainty: boolean };
  };
  "POST /v1/ingest": {
    body: { input_type: string; input_ref: string };
    response: { job_id: string; status: "ingested" };
  };
};

export type FutureSignal = {
  topic_id: string;
  scores: Record<string, number>;
  components: Record<string, Record<string, number>>;
  confidence: number;
  computed_at: string;
};

export type FutureTopic = {
  id: string;
  label: string;
  history_start: string;
};

export type FutureObservation = {
  topic_id: string;
  observed_at: string;
  metrics: Record<string, number>;
};

export type FutureCitation = {
  content_id?: string;
  url?: string;
  title: string;
};
