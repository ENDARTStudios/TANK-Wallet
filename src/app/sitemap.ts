import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXTAUTH_URL ?? "https://tankwallet.dev";
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/#security`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];
}
