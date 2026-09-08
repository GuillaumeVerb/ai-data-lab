import type { Route } from "next";

export const locales = ["fr", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function asRoute(path: string): Route {
  return path as Route;
}

export function localizedPath(locale: Locale, path = "/"): Route {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === "/") return asRoute(`/${locale}`);
  return asRoute(`/${locale}${normalized}`);
}

export function switchLocalePath(pathname: string, nextLocale: Locale): Route {
  const segments = pathname.split("/");
  if (segments[1] && isLocale(segments[1])) {
    segments[1] = nextLocale;
    const next = segments.join("/");
    return asRoute(next.length > 0 ? next : `/${nextLocale}`);
  }
  return localizedPath(nextLocale, pathname);
}

export function stripLocale(pathname: string): string {
  const segments = pathname.split("/");
  if (segments[1] && isLocale(segments[1])) {
    const rest = `/${segments.slice(2).join("/")}`;
    return rest === "/" ? "/" : rest.replace(/\/$/, "") || "/";
  }
  return pathname;
}

export function localeHtmlLang(locale: Locale): string {
  return locale === "fr" ? "fr" : "en";
}

export function localeOpenGraph(locale: Locale): string {
  return locale === "fr" ? "fr_FR" : "en_US";
}

const months = {
  fr: [
    "janv.",
    "févr.",
    "mars",
    "avr.",
    "mai",
    "juin",
    "juil.",
    "août",
    "sept.",
    "oct.",
    "nov.",
    "déc.",
  ],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
} as const;

export function formatDate(value: string, locale: Locale): string {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return value;
  const year = match[1];
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12) return value;
  return `${day} ${months[locale][month - 1]} ${year}`;
}
