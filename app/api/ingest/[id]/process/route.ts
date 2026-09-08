import { NextRequest, NextResponse } from "next/server";
import { isAdminSession } from "@/lib/ingest/auth";
import { processIngestJob } from "@/lib/ingest/pipeline";
import { isLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

type Context = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: Context) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const form = await request.formData().catch(() => null);
  const locale = isLocale(String(form?.get("locale") ?? ""))
    ? String(form?.get("locale"))
    : "fr";

  try {
    await processIngestJob(id);
    return NextResponse.redirect(new URL(`/${locale}/admin/${id}`, request.url), 303);
  } catch (error) {
    const message = error instanceof Error ? error.message : "process failed";
    return NextResponse.redirect(
      new URL(`/${locale}/admin/${id}?error=${encodeURIComponent(message)}`, request.url),
      303,
    );
  }
}
