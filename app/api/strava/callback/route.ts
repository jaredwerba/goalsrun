// Strava OAuth callback — exchanges the one-time code for tokens and
// displays the refresh token so it can be added to Vercel env vars.
// This route is called by Strava after the admin authorizes the app.

import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const STRAVA_TOKEN_URL = "https://www.strava.com/api/v3/oauth/token";

function page(title: string, body: string) {
  return new NextResponse(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${title}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#fafafa;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px}
    .card{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:40px 48px;max-width:640px;width:100%;box-shadow:0 1px 4px rgba(0,0,0,.06)}
    h1{font-size:20px;font-weight:700;color:#111;margin-bottom:16px}
    p{color:#374151;font-size:15px;line-height:1.6;margin-bottom:12px}
    .token{background:#111;color:#f9fafb;font-family:monospace;font-size:13px;padding:16px 20px;border-radius:10px;word-break:break-all;margin:16px 0;position:relative}
    .steps{background:#f3f4f6;border-radius:10px;padding:20px 24px;margin:16px 0}
    .steps ol{padding-left:20px}
    .steps li{margin-bottom:8px;font-size:14px;color:#374151}
    code{background:#e5e7eb;border-radius:4px;padding:1px 5px;font-family:monospace;font-size:13px}
    .warn{color:#dc2626;font-size:13px}
    a{color:#111;font-weight:600}
  </style>
</head>
<body>
  <div class="card">${body}</div>
</body>
</html>`,
    {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    },
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const error = searchParams.get("error");
  const code = searchParams.get("code");

  if (error) {
    return page(
      "Strava auth error",
      `<h1>Authorization declined</h1>
       <p>Strava returned: <strong>${error}</strong></p>
       <p>Go back and try <a href="/api/strava/auth">connecting again</a>.</p>`,
    );
  }

  if (!code) {
    return page(
      "Strava auth error",
      `<h1>Missing code</h1>
       <p>No authorization code in the callback URL. Try <a href="/api/strava/auth">connecting again</a>.</p>`,
    );
  }

  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return page(
      "Strava setup incomplete",
      `<h1>Missing env vars</h1>
       <p>Both <code>STRAVA_CLIENT_ID</code> and <code>STRAVA_CLIENT_SECRET</code> must be set before completing the OAuth flow.</p>`,
    );
  }

  let refreshToken: string;
  let athleteId: number;
  let athleteName: string;

  try {
    const res = await fetch(STRAVA_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return page(
        "Token exchange failed",
        `<h1>Token exchange failed</h1>
         <p>Strava responded with HTTP ${res.status}:</p>
         <div class="token">${text}</div>
         <p>Try <a href="/api/strava/auth">connecting again</a>.</p>`,
      );
    }

    const data = await res.json();
    refreshToken = data.refresh_token as string;
    athleteId = (data.athlete?.id as number) ?? 0;
    athleteName = (data.athlete?.firstname as string) ?? "Unknown";
  } catch (err) {
    return page(
      "Token exchange error",
      `<h1>Token exchange error</h1>
       <p>${err instanceof Error ? err.message : "Unknown error"}</p>`,
    );
  }

  return page(
    "Strava connected!",
    `<h1>✓ Strava connected</h1>
     <p>Authorized as <strong>${athleteName}</strong> (athlete ID: <code>${athleteId}</code>).</p>
     <p>Copy the refresh token below and add it to your Vercel environment variables.</p>

     <div class="token" id="token">${refreshToken}</div>

     <div class="steps">
       <p style="font-weight:600;margin-bottom:12px">Add to Vercel:</p>
       <ol>
         <li>Go to <a href="https://vercel.com" target="_blank">vercel.com</a> → your goalsrun project → <strong>Settings → Environment Variables</strong></li>
         <li>Add <code>STRAVA_REFRESH_TOKEN</code> = the token above (Production scope)</li>
         <li>Also confirm <code>STRAVA_CLIENT_ID</code> and <code>STRAVA_CLIENT_SECRET</code> are set</li>
         <li>Redeploy: <code>vercel --prod --yes</code></li>
       </ol>
     </div>

     <p class="warn">⚠ This page will not show this token again. Save it now.</p>
     <p style="margin-top:16px"><a href="/">Go home</a></p>`,
  );
}
