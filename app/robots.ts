import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const host = process.env.NEXT_PUBLIC_SITE_HOST || "goalsrun.vercel.app";
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/bookings", "/api/"] }],
    sitemap: `https://${host}/sitemap.xml`,
  };
}
