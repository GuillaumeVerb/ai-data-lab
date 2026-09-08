import "server-only";

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { isLocale, type Locale } from "@/lib/i18n";

const localeSchema = z.enum(["fr", "en"]);
const translationStatusSchema = z.enum([
  "original",
  "adapted",
  "ai_draft",
  "human_reviewed",
  "missing",
]);

const baseSchema = z.object({
  content_id: z.string().regex(/^[a-z0-9-]+$/),
  locale: localeSchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  translation_status: translationStatusSchema,
  published: z.boolean(),
  published_at: z.string().optional(),
  updated_at: z.string(),
  tags: z.array(z.string()).default([]),
  scaffold: z.boolean().default(false),
});

export const projectSchema = baseSchema.extend({
  type: z.literal("project"),
  problem: z.string().min(1),
  why_it_matters: z.string().min(1),
  stack: z.array(z.string()).default([]),
  github_url: z.string().url().optional(),
  demo_url: z.string().url().optional(),
  related_lab_ids: z.array(z.string()).default([]),
  related_writing_ids: z.array(z.string()).default([]),
  flagship: z.boolean().default(false),
  domain: z.enum(["core", "applied_ai"]),
});

export const labSchema = baseSchema.extend({
  type: z.literal("lab"),
  format: z.enum(["lab", "build_log", "challenge", "failed_experiment"]),
  question: z.string().min(1),
  hypothesis: z.string().optional(),
  related_project_ids: z.array(z.string()).default([]),
});

export const writingSchema = baseSchema.extend({
  type: z.literal("writing"),
  kind: z.enum([
    "explainer",
    "research_note",
    "experiment",
    "tool_review",
    "brief",
    "living_report",
  ]),
  related_lab_ids: z.array(z.string()).default([]),
  related_project_ids: z.array(z.string()).default([]),
});

export const learningSchema = baseSchema.extend({
  type: z.literal("learning"),
  last_reviewed_at: z.string().optional(),
  related_lab_ids: z.array(z.string()).default([]),
  related_project_ids: z.array(z.string()).default([]),
  stage: z.enum(["evidence", "exploring"]).default("exploring"),
});

export const observeSchema = baseSchema.extend({
  type: z.literal("observe"),
  status: z.enum(["watching", "rising", "cooling", "hype_risk", "adopted"]),
  manual: z.boolean().default(true),
});

const schemas = {
  project: projectSchema,
  lab: labSchema,
  writing: writingSchema,
  learning: learningSchema,
  observe: observeSchema,
} as const;

export type ContentType = keyof typeof schemas;
export type Project = z.infer<typeof projectSchema> & { body: string };
export type Lab = z.infer<typeof labSchema> & { body: string };
export type Writing = z.infer<typeof writingSchema> & { body: string };
export type Learning = z.infer<typeof learningSchema> & { body: string };
export type ObserveItem = z.infer<typeof observeSchema> & { body: string };

export type ContentItem = Project | Lab | Writing | Learning | ObserveItem;

const typeDirs: Record<ContentType, string> = {
  project: "projects",
  lab: "labs",
  writing: "writing",
  learning: "learning",
  observe: "observe",
};

const contentRoot = path.join(process.cwd(), "content");

function readType(type: ContentType, locale: Locale): ContentItem[] {
  const dir = path.join(contentRoot, typeDirs[type]);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(`.${locale}.md`))
    .map((file) => loadFile(type, path.join(dir, file), locale))
    .filter((item) => item.published)
    .sort((a, b) => {
      const flag = Number("flagship" in b && b.flagship) - Number("flagship" in a && a.flagship);
      if (flag !== 0) return flag;
      return (b.published_at ?? "").localeCompare(a.published_at ?? "");
    });
}

function loadFile(
  type: ContentType,
  filePath: string,
  expectedLocale: Locale,
): ContentItem {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  const filename = path.basename(filePath);
  const match = filename.match(/^([a-z0-9-]+)\.(fr|en)\.md$/);

  if (!match) {
    throw new Error(`Invalid content filename: ${filename}`);
  }

  const [, contentId, fileLocale] = match;
  if (!isLocale(fileLocale) || fileLocale !== expectedLocale) {
    throw new Error(`Locale mismatch in ${filename}`);
  }

  const data = schemas[type].parse({
    ...parsed.data,
    type,
  });

  if (data.content_id !== contentId) {
    throw new Error(
      `content_id ${data.content_id} does not match filename ${filename}`,
    );
  }

  if (data.locale !== expectedLocale) {
    throw new Error(`Frontmatter locale does not match ${filename}`);
  }

  return { ...data, body: parsed.content.trim() } as ContentItem;
}

export function listProjects(locale: Locale): Project[] {
  return readType("project", locale).filter(
    (item): item is Project => item.type === "project",
  );
}

export function listLabs(locale: Locale): Lab[] {
  return readType("lab", locale).filter((item): item is Lab => item.type === "lab");
}

export function listWriting(locale: Locale): Writing[] {
  return readType("writing", locale).filter(
    (item): item is Writing => item.type === "writing",
  );
}

export function listLearning(locale: Locale): Learning[] {
  return readType("learning", locale)
    .filter((item): item is Learning => item.type === "learning")
    .sort((a, b) => {
      if (a.stage !== b.stage) return a.stage === "evidence" ? -1 : 1;
      return a.title.localeCompare(b.title, locale);
    });
}

export function listObserve(locale: Locale): ObserveItem[] {
  return readType("observe", locale).filter(
    (item): item is ObserveItem => item.type === "observe",
  );
}

export function getProject(
  locale: Locale,
  slug: string,
): Project | undefined {
  return listProjects(locale).find((item) => item.content_id === slug);
}

export function getLab(locale: Locale, slug: string): Lab | undefined {
  return listLabs(locale).find((item) => item.content_id === slug);
}

export function getWriting(
  locale: Locale,
  slug: string,
): Writing | undefined {
  return listWriting(locale).find((item) => item.content_id === slug);
}

export function getLearning(
  locale: Locale,
  slug: string,
): Learning | undefined {
  return listLearning(locale).find((item) => item.content_id === slug);
}

export function getObserve(
  locale: Locale,
  slug: string,
): ObserveItem | undefined {
  return listObserve(locale).find((item) => item.content_id === slug);
}

export function contentPath(
  type: ContentType,
  slug: string,
): string {
  const map: Record<ContentType, string> = {
    project: "/projects",
    lab: "/lab",
    writing: "/writing",
    learning: "/learning",
    observe: "/observe",
  };
  return `${map[type]}/${slug}`;
}
