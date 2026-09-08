import "server-only";

import fs from "node:fs";
import path from "node:path";
import { ingestJobSchema, type IngestJob } from "@/lib/ingest/schema";

const jobsDir = path.join(process.cwd(), "data", "ingest", "jobs");

function ensureDir() {
  fs.mkdirSync(jobsDir, { recursive: true });
}

function jobPath(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    throw new Error("Invalid job id");
  }
  return path.join(jobsDir, `${id}.json`);
}

export function listJobs(): IngestJob[] {
  ensureDir();
  return fs
    .readdirSync(jobsDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) =>
      ingestJobSchema.parse(
        JSON.parse(fs.readFileSync(path.join(jobsDir, file), "utf8")),
      ),
    )
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getJob(id: string): IngestJob | undefined {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return undefined;
  const file = jobPath(id);
  if (!fs.existsSync(file)) return undefined;
  return ingestJobSchema.parse(JSON.parse(fs.readFileSync(file, "utf8")));
}

export function saveJob(job: IngestJob): IngestJob {
  ensureDir();
  const parsed = ingestJobSchema.parse(job);
  fs.writeFileSync(jobPath(parsed.id), `${JSON.stringify(parsed, null, 2)}\n`);
  return parsed;
}
