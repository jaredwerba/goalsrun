import type { MetadataRoute } from "next";
import { BRAND_PITCHES } from "@/lib/brand-pitches";

export default function sitemap(): MetadataRoute.Sitemap {
  const host = process.env.NEXT_PUBLIC_SITE_HOST || "goalslopes.run";
  const base = `https://${host}`;
  return [
    { url: `${base}/`, priority: 1 },
    { url: `${base}/partners`, priority: 0.9 },
    { url: `${base}/book`, priority: 0.8 },
    ...BRAND_PITCHES.map((p) => ({
      url: `${base}/partners/${p.slug}`,
      priority: 0.7,
    })),
  ];
}
