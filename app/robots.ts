import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/fr/admin", "/fr/admin/", "/en/admin", "/en/admin/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
