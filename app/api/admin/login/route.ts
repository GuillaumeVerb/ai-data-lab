import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminSecret,
  adminToken,
  passwordMatches,
} from "@/lib/ingest/auth";
import { isLocale } from "@/lib/i18n";

export async function POST(request: NextRequest) {
  const secret = adminSecret();
  if (!secret) {
    return NextResponse.json(
      { error: "ADMIN_SECRET is not configured" },
      { status: 503 },
    );
  }

  const form = await request.formData();
  const password = String(form.get("password") ?? "");
  const locale = isLocale(String(form.get("locale")))
    ? String(form.get("locale"))
    : "fr";

  if (!passwordMatches(password)) {
    return NextResponse.redirect(
      new URL(`/${locale}/admin/login?error=1`, request.url),
      303,
    );
  }

  const response = NextResponse.redirect(new URL(`/${locale}/admin`, request.url), 303);
  response.cookies.set(ADMIN_COOKIE, adminToken(secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
