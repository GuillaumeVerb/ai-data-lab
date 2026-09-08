import { z } from "zod";

export const ingestInputTypes = [
  "url",
  "paper",
  "github",
  "youtube",
  "note",
  "idea",
] as const;

export const ingestStatuses = [
  "ingested",
  "ai_processed",
  "review_required",
  "approved",
  "published",
  "rejected",
] as const;

export const sourceTypes = [
  "paper",
  "official_docs",
  "serious_media",
  "opinion",
  "sponsored",
  "viral",
  "repo",
  "video",
  "job",
  "note",
] as const;

export const sourceRefSchema = z.object({
  url: z.string().url().optional(),
  source_id: z.string(),
  source_type: z.enum(sourceTypes),
  author_or_org: z.string().optional(),
  published_at: z.string().optional(),
  collected_at: z.string(),
  language: z.string().optional(),
  license_or_access: z.string().optional(),
});

export const extractedSchema = z.object({
  title_fr: z.string().default(""),
  title_en: z.string().default(""),
  summary_fr: z.string().default(""),
  summary_en: z.string().default(""),
  why_it_matters_fr: z.string().default(""),
  why_it_matters_en: z.string().default(""),
  key_concepts: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  people: z.array(z.string()).default([]),
  companies: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  related_topic_ids: z.array(z.string()).default([]),
  lab_idea_fr: z.string().default(""),
  lab_idea_en: z.string().default(""),
  article_idea_fr: z.string().default(""),
  article_idea_en: z.string().default(""),
});

export const ingestJobSchema = z.object({
  id: z.string().uuid(),
  input_type: z.enum(ingestInputTypes),
  input_ref: z.string().min(1),
  status: z.enum(ingestStatuses),
  source: sourceRefSchema.optional(),
  source_text: z.string().default(""),
  model_used: z.string().optional(),
  pipeline_version: z.string(),
  draft_fr: z.string().default(""),
  draft_en: z.string().default(""),
  extracted: extractedSchema.default(() => extractedSchema.parse({})),
  error: z.string().optional(),
  created_at: z.string(),
  reviewed_at: z.string().optional(),
  published_content_id: z.string().optional(),
});

export type IngestInputType = (typeof ingestInputTypes)[number];
export type IngestStatus = (typeof ingestStatuses)[number];
export type SourceRef = z.infer<typeof sourceRefSchema>;
export type Extracted = z.infer<typeof extractedSchema>;
export type IngestJob = z.infer<typeof ingestJobSchema>;

export const PIPELINE_VERSION = "content-engine.v1";
