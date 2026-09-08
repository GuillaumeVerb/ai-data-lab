import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/ingest/auth";
import { isLocale } from "@/lib/i18n";

export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  const locale = isLocale(String(form?.get("locale") ?? ""))
    ? String(form?.get("locale"))
    : "fr";
  const response = NextResponse.redirect(
    new URL(`/${locale}/admin/login`, request.url),
    303,
  );
  response.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
