import { NextRequest, NextResponse } from "next/server";
import { isAdminSession } from "@/lib/ingest/auth";
import { createIngestJob } from "@/lib/ingest/pipeline";
import { listJobs } from "@/lib/ingest/store";
import { isLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ jobs: listJobs() });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const input = String(form.get("input") ?? "").trim();
  const locale = isLocale(String(form.get("locale")))
    ? String(form.get("locale"))
    : "fr";

  if (!input) {
    return NextResponse.redirect(new URL(`/${locale}/admin?error=empty`, request.url), 303);
  }

  try {
    const job = await createIngestJob(input);
    return NextResponse.redirect(new URL(`/${locale}/admin/${job.id}`, request.url), 303);
  } catch (error) {
    const message = error instanceof Error ? error.message : "ingest failed";
    return NextResponse.redirect(
      new URL(`/${locale}/admin?error=${encodeURIComponent(message)}`, request.url),
      303,
    );
  }
}
