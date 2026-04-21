// Living-proof Strava panel. Renders real training data pulled from the
// Strava API. If credentials aren't set, the component returns null so
// /partners degrades gracefully to the static audience section.

import Link from "next/link";
import { AUDIENCE } from "@/lib/content";
import {
  formatHoursMinutes,
  formatMiles,
  formatPace,
  formatRelativeDate,
  getAthleteStats,
  getRecentActivities,
  hasStravaCredentials,
  metersToMiles,
} from "@/lib/strava";

export async function StravaProof() {
  if (!hasStravaCredentials()) return null;

  const [stats, activities] = await Promise.all([
    getAthleteStats(),
    getRecentActivities(6),
  ]);

  // If both endpoints failed (network, revoked token, etc.), hide the
  // whole section rather than ship an empty shell.
  if (!stats && !activities) return null;

  const recentMiles = stats
    ? metersToMiles(stats.recent_run_totals.distance)
    : 0;
  const ytdMiles = stats ? metersToMiles(stats.ytd_run_totals.distance) : 0;
  const allMiles = stats ? metersToMiles(stats.all_run_totals.distance) : 0;
  const allRuns = stats ? stats.all_run_totals.count : 0;

  return (
    <section id="strava" className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Living proof
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">
            Pulled live from Strava.
          </h2>
          <p className="text-muted-foreground max-w-prose">
            Every mile on this page came out of the API ten minutes ago.
            Training is public; nothing is staged.
          </p>
        </div>
        <Link
          href={AUDIENCE.strava.url}
          target="_blank"
          rel="noreferrer"
          className="text-sm underline underline-offset-4 hover:no-underline"
        >
          Follow on Strava →
        </Link>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-6 border-y py-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Last 4 weeks
            </p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">
              {recentMiles.toFixed(0)}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                mi
              </span>
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Year to date
            </p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">
              {ytdMiles.toFixed(0)}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                mi
              </span>
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              All-time runs
            </p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">
              {allRuns.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              All-time miles
            </p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">
              {allMiles >= 1000
                ? `${(allMiles / 1000).toFixed(1)}k`
                : allMiles.toFixed(0)}
            </p>
          </div>
        </div>
      )}

      {activities && activities.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Recent runs
          </p>
          <ul className="divide-y border-y">
            {activities.map((a) => (
              <li
                key={a.id}
                className="py-3 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 items-baseline"
              >
                <a
                  href={`https://www.strava.com/activities/${a.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium hover:underline underline-offset-4 truncate"
                >
                  {a.name}
                </a>
                <p className="font-mono tabular-nums text-sm">
                  {formatMiles(a.distance)} mi
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatRelativeDate(a.start_date_local)} ·{" "}
                  {a.sport_type === "TrailRun" ? "Trail" : "Run"}
                </p>
                <p className="font-mono tabular-nums text-sm text-muted-foreground">
                  {formatPace(a.average_speed)}/mi ·{" "}
                  {formatHoursMinutes(a.moving_time)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
