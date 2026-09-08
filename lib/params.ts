import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/lib/i18n";

export function parseLocale(value: string): Locale {
  if (!isLocale(value)) notFound();
  return value;
}

export function localeStaticParams() {
  return locales.map((locale) => ({ locale }));
}
