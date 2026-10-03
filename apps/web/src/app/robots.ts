import type { MetadataRoute } from "next";
import { resolveBaseUrl } from "@/lib/env/url";

export default function robots(): MetadataRoute.Robots {
  const base = resolveBaseUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
