import "server-only";

import { listLabs, listLearning, listObserve, listWriting } from "@/lib/content";
import {
  extractedSchema,
  type Extracted,
  type IngestJob,
} from "@/lib/ingest/schema";

const SYSTEM = `You draft bilingual lab notes for Guillaume Verbiguié's public AI Research & Engineering Lab (Paris).
Rules:
- French and English are independent editorial versions, not literal translations.
- Never invent professional experience, clients, metrics, or skill percentages.
- If the source is thin, say so. Mark uncertainty explicitly.
- Do not claim MCP, ROS2, robotics jobs, or private repos as public evidence.
- Return JSON only.`;

export function canRunDraftModel(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export async function generateDrafts(job: IngestJob): Promise<{
  extracted: Extracted;
  draft_fr: string;
  draft_en: string;
  model_used: string;
}> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const topics = knownTopics();
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: [
            `Input type: ${job.input_type}`,
            `Source: ${job.source?.url ?? job.input_ref}`,
            `Known Lab topic ids: ${topics.join(", ") || "(none)"}`,
            "Extract and draft. JSON keys:",
            "title_fr, title_en, summary_fr, summary_en, why_it_matters_fr, why_it_matters_en,",
            "key_concepts[], technologies[], people[], companies[], tags[], related_topic_ids[],",
            "lab_idea_fr, lab_idea_en, article_idea_fr, article_idea_en, draft_fr, draft_en.",
            "draft_* must be markdown with: source, why it matters, concepts, limits, next Lab/Writing idea.",
            "Source text:",
            job.source_text.slice(0, 10_000),
          ].join("\n"),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Draft model failed (${response.status})`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const raw = payload.choices?.[0]?.message?.content;
  if (!raw) throw new Error("Draft model returned an empty response");

  const parsed = JSON.parse(raw) as Record<string, unknown>;
  const extracted = extractedSchema.parse({
    ...parsed,
    related_topic_ids: filterKnownIds(
      asStringArray(parsed.related_topic_ids),
      topics,
    ),
  });

  return {
    extracted,
    draft_fr: String(parsed.draft_fr ?? assembleDraft("fr", extracted, job)),
    draft_en: String(parsed.draft_en ?? assembleDraft("en", extracted, job)),
    model_used: model,
  };
}

export function assembleDraft(
  locale: "fr" | "en",
  extracted: Extracted,
  job: IngestJob,
): string {
  const fr = locale === "fr";
  return [
    `# ${fr ? extracted.title_fr : extracted.title_en}`.trim(),
    "",
    `## ${fr ? "Source" : "Source"}`,
    job.source?.url ?? job.input_ref,
    "",
    `## ${fr ? "Résumé" : "Summary"}`,
    fr ? extracted.summary_fr : extracted.summary_en,
    "",
    `## ${fr ? "Pourquoi ça compte" : "Why it matters"}`,
    fr ? extracted.why_it_matters_fr : extracted.why_it_matters_en,
    "",
    `## ${fr ? "Idée de lab" : "Lab idea"}`,
    fr ? extracted.lab_idea_fr : extracted.lab_idea_en,
    "",
    `## ${fr ? "Idée d’article" : "Article idea"}`,
    fr ? extracted.article_idea_fr : extracted.article_idea_en,
    "",
    `_${fr ? "Brouillon IA — revue humaine obligatoire, non publié." : "AI draft — human review required, not published."}_`,
  ].join("\n");
}

function knownTopics(): string[] {
  const locale = "fr" as const;
  return [
    ...listLabs(locale),
    ...listLearning(locale),
    ...listWriting(locale),
    ...listObserve(locale),
  ].map((item) => item.content_id);
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item)).filter(Boolean);
}

function filterKnownIds(ids: string[], known: string[]): string[] {
  const set = new Set(known);
  return ids.filter((id) => set.has(id));
}
