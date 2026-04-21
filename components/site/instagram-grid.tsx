// Instagram post grid. Uses Instagram's official `/embed` iframe — no API
// keys, no app review, no account conversion. Just public post URLs.
//
// To feature a post:
//   1. On Instagram, open the post and copy its URL
//      (e.g. https://www.instagram.com/p/ABC123xyz/).
//   2. Add `{ url: "...", alt: "short description" }` to FEATURED_POSTS.
//   3. Redeploy — the post renders automatically.
//
// Supports regular posts (/p/), reels (/reel/), and tv (/tv/).

import { AUDIENCE } from "@/lib/content";

type FeaturedPost = {
  /** Public Instagram post URL. Accepts /p/, /reel/, or /tv/ paths. */
  url: string;
  /** Short alt text for accessibility (not visible on screen). */
  alt: string;
};

// Edit this list to curate which posts appear on /partners. Leave empty
// to hide the whole section (graceful no-op).
const FEATURED_POSTS: FeaturedPost[] = [
  // { url: "https://www.instagram.com/p/XXXXXXXXXXX/", alt: "Boston 2026 finish line" },
  // { url: "https://www.instagram.com/p/XXXXXXXXXXX/", alt: "Castle Island long run" },
  // { url: "https://www.instagram.com/reel/XXXXXXXXXXX/", alt: "Tuesday intervals" },
];

// Normalize a post URL into Instagram's embed URL.
// Accepts https://www.instagram.com/p/SHORTCODE/ (trailing slash or not,
// query string or not) and returns the iframe-embed form.
function toEmbedUrl(url: string): string | null {
  const match = url.match(
    /instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/,
  );
  if (!match) return null;
  const [, kind, shortcode] = match;
  return `https://www.instagram.com/${kind}/${shortcode}/embed/captioned/`;
}

export function InstagramGrid() {
  if (FEATURED_POSTS.length === 0) return null;

  return (
    <section id="instagram" className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            On Instagram
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">
            The feed, in Goals' voice.
          </h2>
          <p className="text-muted-foreground max-w-prose">
            Training, race-day, Castle Island mornings. What a brand
            partnership would actually look like.
          </p>
        </div>
        <a
          href={AUDIENCE.instagram.url}
          target="_blank"
          rel="noreferrer"
          className="text-sm underline underline-offset-4 hover:no-underline"
        >
          Follow {AUDIENCE.instagram.handle} →
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURED_POSTS.map((post) => {
          const embedUrl = toEmbedUrl(post.url);
          if (!embedUrl) return null;
          return (
            <div
              key={post.url}
              className="overflow-hidden rounded-xl border bg-card"
            >
              {/* Instagram's embed iframe is self-contained and
                  responsive. Fixed min height avoids layout shift while
                  the embed scripts hydrate. */}
              <iframe
                src={embedUrl}
                title={post.alt}
                loading="lazy"
                scrolling="no"
                allowTransparency
                allow="encrypted-media"
                className="w-full block border-0"
                style={{ minHeight: 720 }}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
