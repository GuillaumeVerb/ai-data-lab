import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";

const COOKIE = "NEXT_LOCALE";

function preferredLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get(COOKIE)?.value;
  if (cookie && isLocale(cookie)) return cookie;

  const header = request.headers.get("accept-language")?.toLowerCase() ?? "";
  const tokens = header.split(",").map((part) => {
    const [tag, q] = part.trim().split(";q=");
    return { tag: tag.split("-")[0], q: q ? Number(q) : 1 };
  });

  const en = tokens.find((token) => token.tag === "en");
  const fr = tokens.find((token) => token.tag === "fr");
  if (en && (!fr || en.q > fr.q || (en.q === fr.q && header.indexOf("en") < header.indexOf("fr")))) {
    return "en";
  }
  if (fr) return "fr";
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1];

  if (isLocale(first)) {
    const response = NextResponse.next();
    response.cookies.set(COOKIE, first, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return response;
  }

  const locale = preferredLocale(request);
  request.nextUrl.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
  const response = NextResponse.redirect(request.nextUrl);
  response.cookies.set(COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
