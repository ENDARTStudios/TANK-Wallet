import type { MetadataRoute } from "next";
import { resolveBaseUrl } from "@/lib/env/url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = resolveBaseUrl();
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/#security`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];
}
