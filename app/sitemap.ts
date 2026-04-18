import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const host = process.env.NEXT_PUBLIC_SITE_HOST || "goalsrun.vercel.app";
  const base = `https://${host}`;
  return [
    { url: `${base}/`, priority: 1 },
    { url: `${base}/book`, priority: 0.8 },
  ];
}
