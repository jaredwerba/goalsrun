import type { NextConfig } from "next";

// Link header advertises agent-readable resources per RFC 8288.
// - llms.txt: curated site TOC for AI agents (llmstxt.org)
// - sitemap.xml: canonical URL list (already advertised in robots.txt,
//   repeated here for header-based discovery)
const AGENT_LINK_HEADER = [
  '</llms.txt>; rel="describedby"; type="text/markdown"',
  '</sitemap.xml>; rel="sitemap"',
].join(", ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/",
        headers: [{ key: "Link", value: AGENT_LINK_HEADER }],
      },
    ];
  },
  // Canonicalize www → apex. Both hosts resolve to the same Vercel
  // deployment, but apex is the canonical (sitemap, OG, metadataBase,
  // passkey rpID). 308 permanent preserves method/body, so in-flight
  // POSTs (e.g. /api/auth/*) are redirected cleanly.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.goalslopes.run" }],
        permanent: true,
        destination: "https://goalslopes.run/:path*",
      },
    ];
  },
};

export default nextConfig;
