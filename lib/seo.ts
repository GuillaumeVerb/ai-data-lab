import type { Metadata } from "next";
import { getDictionary } from "@/lib/dictionary";
import { getSiteUrl, site } from "@/lib/site";
import {
  localeOpenGraph,
  localizedPath,
  type Locale,
} from "@/lib/i18n";

type PageMetaInput = {
  locale: Locale;
  path?: string;
  title?: string;
  description?: string;
};

export function buildPageMetadata({
  locale,
  path = "/",
  title,
  description,
}: PageMetaInput): Metadata {
  const dict = getDictionary(locale);
  const url = new URL(localizedPath(locale, path), getSiteUrl()).toString();
  const pageTitle = title ?? dict.meta.title;
  const pageDescription = description ?? dict.meta.description;
  const fullTitle =
    pageTitle === dict.meta.title
      ? pageTitle
      : `${pageTitle} · ${site.shortName}`;

  return {
    metadataBase: new URL(getSiteUrl()),
    title: fullTitle,
    description: pageDescription,
    alternates: {
      canonical: url,
      languages: {
        fr: localizedPath("fr", path),
        en: localizedPath("en", path),
        "x-default": localizedPath("fr", path),
      },
    },
    openGraph: {
      type: "website",
      locale: localeOpenGraph(locale),
      alternateLocale: locale === "fr" ? ["en_US"] : ["fr_FR"],
      url,
      siteName: site.name,
      title: fullTitle,
      description: pageDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: pageDescription,
    },
  };
}
