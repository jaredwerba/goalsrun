// One-time Strava OAuth initiation — admin only.
// Visit /api/strava/auth while signed in as admin to kick off the
// authorization flow. Strava will redirect back to /api/strava/callback
// with a code that gets exchanged for a refresh token.

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ADMIN_LOGIN_EMAIL } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.email !== ADMIN_LOGIN_EMAIL) {
    redirect("/book");
  }

  const clientId = process.env.STRAVA_CLIENT_ID;
  if (!clientId) {
    return new Response(
      "STRAVA_CLIENT_ID is not set. Add it to your environment variables first.",
      { status: 500 },
    );
  }

  const siteHost =
    process.env.NEXT_PUBLIC_SITE_HOST ?? "goalslopes.run";
  const callbackUrl = `https://${siteHost}/api/strava/callback`;

  const url = new URL("https://www.strava.com/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", callbackUrl);
  url.searchParams.set("scope", "read,activity:read_all");
  url.searchParams.set("approval_prompt", "auto");

  redirect(url.toString());
}
