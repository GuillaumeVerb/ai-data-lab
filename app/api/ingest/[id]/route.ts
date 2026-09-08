import { NextRequest, NextResponse } from "next/server";
import { isAdminSession } from "@/lib/ingest/auth";
import { updateIngestJob } from "@/lib/ingest/pipeline";
import { getJob } from "@/lib/ingest/store";
import { isLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Context) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const job = getJob(id);
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ job });
}

export async function POST(request: NextRequest, context: Context) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const form = await request.formData();
  const locale = isLocale(String(form.get("locale")))
    ? String(form.get("locale"))
    : "fr";
  const intent = String(form.get("intent") ?? "save");

  try {
    updateIngestJob(id, {
      draft_fr: String(form.get("draft_fr") ?? ""),
      draft_en: String(form.get("draft_en") ?? ""),
      status:
        intent === "approve"
          ? "approved"
          : intent === "reject"
            ? "rejected"
            : "review_required",
    });
    return NextResponse.redirect(new URL(`/${locale}/admin/${id}`, request.url), 303);
  } catch (error) {
    const message = error instanceof Error ? error.message : "update failed";
    return NextResponse.redirect(
      new URL(`/${locale}/admin/${id}?error=${encodeURIComponent(message)}`, request.url),
      303,
    );
  }
}
