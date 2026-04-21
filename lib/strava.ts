// Strava API integration — pulls Goals' live training data as proof for
// brand partners. Auth flow:
//
//   1. Register an app at https://www.strava.com/settings/api
//      (gives STRAVA_CLIENT_ID + STRAVA_CLIENT_SECRET)
//   2. One-time OAuth: Goals authorizes the app with scope
//      "read,activity:read_all" and exchanges the code for a refresh token.
//   3. STRAVA_REFRESH_TOKEN is stored as a Vercel env var. It's long-lived
//      (doesn't expire unless manually revoked).
//   4. At request time we exchange the refresh token for a short-lived
//      access token (~6h) and call the API with it.
//
// If any of the three env vars is missing the integration is OFF — every
// helper returns null so the UI can hide cleanly.

import { AUDIENCE } from "@/lib/content";

const STRAVA_API = "https://www.strava.com/api/v3";

type TokenResponse = {
  access_token: string;
  expires_at: number;
  refresh_token: string;
};

export type StravaActivity = {
  id: number;
  name: string;
  type: string;
  sport_type: string;
  distance: number; // meters
  moving_time: number; // seconds
  elapsed_time: number; // seconds
  total_elevation_gain: number; // meters
  start_date_local: string; // ISO
  average_speed: number; // m/s
  average_heartrate?: number;
};

export type StravaStatsTotals = {
  count: number;
  distance: number; // meters
  moving_time: number; // seconds
  elevation_gain: number; // meters
};

export type StravaStats = {
  recent_run_totals: StravaStatsTotals;
  ytd_run_totals: StravaStatsTotals;
  all_run_totals: StravaStatsTotals;
};

export function hasStravaCredentials(): boolean {
  return (
    !!process.env.STRAVA_CLIENT_ID &&
    !!process.env.STRAVA_CLIENT_SECRET &&
    !!process.env.STRAVA_REFRESH_TOKEN
  );
}

// Module-level token cache. Persists across requests on a warm serverless
// instance and is discarded on cold start — either way we never call the
// refresh endpoint more than once per ~6 hours per instance.
let cachedToken: { accessToken: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string | null> {
  if (!hasStravaCredentials()) return null;
  const now = Math.floor(Date.now() / 1000);
  // Refresh with 5-minute safety margin before the declared expiry.
  if (cachedToken && cachedToken.expiresAt - now > 300) {
    return cachedToken.accessToken;
  }
  try {
    const res = await fetch(`${STRAVA_API}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: process.env.STRAVA_REFRESH_TOKEN,
      }),
      // POST responses aren't cached by Next's data cache; module-level
      // cache above handles deduplication within an instance.
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn("[strava] token refresh failed", res.status);
      return null;
    }
    const data = (await res.json()) as TokenResponse;
    cachedToken = {
      accessToken: data.access_token,
      expiresAt: data.expires_at,
    };
    return data.access_token;
  } catch (err) {
    console.warn("[strava] token refresh error", err);
    return null;
  }
}

async function stravaGet<T>(
  path: string,
  revalidateSeconds: number,
): Promise<T | null> {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    const res = await fetch(`${STRAVA_API}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: revalidateSeconds },
    });
    if (!res.ok) {
      console.warn(`[strava] GET ${path} failed`, res.status);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[strava] GET ${path} error`, err);
    return null;
  }
}

export async function getAthleteStats(): Promise<StravaStats | null> {
  const id = process.env.STRAVA_ATHLETE_ID || AUDIENCE.strava.athleteId;
  return stravaGet<StravaStats>(`/athletes/${id}/stats`, 3600);
}

export async function getRecentActivities(
  limit = 5,
): Promise<StravaActivity[] | null> {
  const list = await stravaGet<StravaActivity[]>(
    `/athlete/activities?per_page=${limit}`,
    1800,
  );
  if (!list) return null;
  // Only running activities for the "living proof" panel — rides and
  // swims aren't the pitch.
  return list.filter(
    (a) => a.sport_type === "Run" || a.sport_type === "TrailRun",
  );
}

// ---------- formatters ----------

const METERS_PER_MILE = 1609.344;

export function metersToMiles(m: number): number {
  return m / METERS_PER_MILE;
}

export function formatMiles(m: number, decimals = 1): string {
  return metersToMiles(m).toFixed(decimals);
}

/** Pace in min:sec per mile, from average speed in m/s. */
export function formatPace(averageSpeedMs: number): string {
  if (averageSpeedMs <= 0) return "—";
  const secondsPerMile = METERS_PER_MILE / averageSpeedMs;
  const minutes = Math.floor(secondsPerMile / 60);
  const seconds = Math.round(secondsPerMile - minutes * 60);
  // Handle rollover (e.g. 6:60 → 7:00)
  if (seconds === 60) return `${minutes + 1}:00`;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function formatHoursMinutes(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds - h * 3600) / 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

export function formatRelativeDate(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const days = Math.round((now - then) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.round(days / 7)}w ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
