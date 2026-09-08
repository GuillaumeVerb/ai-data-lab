import "server-only";

import { randomUUID } from "node:crypto";
import { assembleDraft, canRunDraftModel, generateDrafts } from "@/lib/ingest/draft";
import { detectInputType } from "@/lib/ingest/detect";
import {
  PIPELINE_VERSION,
  extractedSchema,
  type IngestJob,
  type IngestStatus,
} from "@/lib/ingest/schema";
import { fetchSource } from "@/lib/ingest/source";
import { getJob, saveJob } from "@/lib/ingest/store";

const humanStatuses = new Set<IngestStatus>([
  "review_required",
  "approved",
  "rejected",
]);

export async function createIngestJob(input: string): Promise<IngestJob> {
  const input_ref = input.trim();
  if (!input_ref) throw new Error("Empty input");

  const created_at = new Date().toISOString();
  let job: IngestJob = {
    id: randomUUID(),
    input_type: detectInputType(input_ref),
    input_ref,
    status: "ingested",
    pipeline_version: PIPELINE_VERSION,
    draft_fr: "",
    draft_en: "",
    extracted: extractedSchema.parse({}),
    source_text: "",
    created_at,
  };

  try {
    const fetched = await fetchSource(input_ref);
    job = {
      ...job,
      input_type: fetched.input_type,
      source: fetched.source,
      source_text: fetched.text,
    };
  } catch (error) {
    job.error = error instanceof Error ? error.message : "Source fetch failed";
  }

  return saveJob(job);
}

export async function processIngestJob(id: string): Promise<IngestJob> {
  const current = getJob(id);
  if (!current) throw new Error("Job not found");
  if (humanStatuses.has(current.status) && current.status !== "review_required") {
    throw new Error("This job is no longer processable");
  }

  if (!canRunDraftModel()) {
    return saveJob({
      ...current,
      status: "ingested",
      error: "No OPENAI_API_KEY — source stored, drafts stay empty until a model runs or you write them.",
    });
  }

  try {
    const drafted = await generateDrafts(current);
    return saveJob({
      ...current,
      ...drafted,
      status: "review_required",
      error: undefined,
    });
  } catch (error) {
    return saveJob({
      ...current,
      status: "ai_processed",
      error: error instanceof Error ? error.message : "Draft generation failed",
    });
  }
}

export function updateIngestJob(
  id: string,
  patch: {
    draft_fr?: string;
    draft_en?: string;
    status?: Extract<IngestStatus, "review_required" | "approved" | "rejected">;
  },
): IngestJob {
  const current = getJob(id);
  if (!current) throw new Error("Job not found");
  if (current.status === "published") {
    throw new Error("Published jobs are frozen");
  }

  const nextStatus = patch.status ?? current.status;

  const extracted = current.extracted;
  const draft_fr = patch.draft_fr ?? current.draft_fr;
  const draft_en = patch.draft_en ?? current.draft_en;

  return saveJob({
    ...current,
    draft_fr: draft_fr || assembleDraft("fr", extracted, current),
    draft_en: draft_en || assembleDraft("en", extracted, current),
    status: nextStatus,
    reviewed_at:
      nextStatus === "approved" || nextStatus === "rejected"
        ? new Date().toISOString()
        : current.reviewed_at,
    error: undefined,
  });
}
