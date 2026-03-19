import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/app-config";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin-import", "/api/"]
    },
    sitemap: siteUrl ? `${siteUrl.origin}/sitemap.xml` : undefined
  };
}
