import type { MetadataRoute } from "next";
import {
  listLabs,
  listLearning,
  listObserve,
  listProjects,
  listWriting,
} from "@/lib/content";
import { locales, localizedPath } from "@/lib/i18n";
import { getSiteUrl } from "@/lib/site";

const staticPaths = [
  "/",
  "/projects",
  "/lab",
  "/writing",
  "/learning",
  "/observe",
  "/about",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const path of staticPaths) {
      entries.push({
        url: new URL(localizedPath(locale, path), base).toString(),
        alternates: {
          languages: {
            fr: new URL(localizedPath("fr", path), base).toString(),
            en: new URL(localizedPath("en", path), base).toString(),
          },
        },
      });
    }

    const details = [
      ...listProjects(locale).map((item) => `/projects/${item.content_id}`),
      ...listLabs(locale).map((item) => `/lab/${item.content_id}`),
      ...listWriting(locale).map((item) => `/writing/${item.content_id}`),
      ...listLearning(locale).map((item) => `/learning/${item.content_id}`),
      ...listObserve(locale).map((item) => `/observe/${item.content_id}`),
    ];

    for (const path of details) {
      entries.push({
        url: new URL(localizedPath(locale, path), base).toString(),
        alternates: {
          languages: {
            fr: new URL(localizedPath("fr", path), base).toString(),
            en: new URL(localizedPath("en", path), base).toString(),
          },
        },
      });
    }
  }

  return entries;
}
