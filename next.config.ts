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
};

export default nextConfig;
