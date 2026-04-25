// /strava — diagnostic / testing page for the Strava integration.
// Admin-only. Shows credential status, raw athlete stats, and recent
// activities with all fields. Useful for validating that env vars are
// set correctly and the API responds.

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { ADMIN_LOGIN_EMAIL, AUDIENCE } from "@/lib/content";
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
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Strava (test)", robots: { index: false } };
export const dynamic = "force-dynamic";

function StatusPill({
  label,
  ok,
}: {
  label: string;
  ok: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        ok
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      }`}
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${
          ok ? "bg-green-500" : "bg-red-500"
        }`}
      />
      {label}: {ok ? "set" : "missing"}
    </span>
  );
}

export default async function StravaTestPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.email !== ADMIN_LOGIN_EMAIL) {
    redirect("/book");
  }

  const hasClientId = !!process.env.STRAVA_CLIENT_ID;
  const hasClientSecret = !!process.env.STRAVA_CLIENT_SECRET;
  const hasRefreshToken = !!process.env.STRAVA_REFRESH_TOKEN;
  const allSet = hasStravaCredentials();

  const [stats, activities] = allSet
    ? await Promise.all([getAthleteStats(), getRecentActivities(10)])
    : [null, null];

  const statsOk = !!stats;
  const activitiesOk = activities !== null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 space-y-10">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Diagnostic · admin only
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">Strava test page</h1>
        <p className="text-muted-foreground">
          Validates the Strava integration end-to-end. Not linked from the
          public site.
        </p>
      </header>

      {/* Credentials section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">1. Environment variables</h2>
        <div className="flex flex-wrap gap-2">
          <StatusPill label="STRAVA_CLIENT_ID" ok={hasClientId} />
          <StatusPill label="STRAVA_CLIENT_SECRET" ok={hasClientSecret} />
          <StatusPill label="STRAVA_REFRESH_TOKEN" ok={hasRefreshToken} />
        </div>
        {!allSet && (
          <div className="rounded-xl border bg-amber-50 dark:bg-amber-950/30 p-5 space-y-3">
            <p className="font-medium text-amber-900 dark:text-amber-200">
              Setup required
            </p>
            <ol className="text-sm text-amber-900 dark:text-amber-200 list-decimal pl-5 space-y-1">
              <li>
                Register an app at{" "}
                <a
                  href="https://www.strava.com/settings/api"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  strava.com/settings/api
                </a>{" "}
                — set Authorization Callback Domain to{" "}
                <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">
                  goalslopes.run
                </code>
              </li>
              <li>
                Add <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">STRAVA_CLIENT_ID</code>{" "}
                and{" "}
                <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">STRAVA_CLIENT_SECRET</code>{" "}
                to Vercel env (Production) and redeploy
              </li>
              <li>
                Visit{" "}
                <Link href="/api/strava/auth" className="underline font-medium">
                  /api/strava/auth
                </Link>{" "}
                to complete OAuth — Strava will redirect back with the refresh token
              </li>
              <li>
                Add{" "}
                <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">
                  STRAVA_REFRESH_TOKEN
                </code>{" "}
                to Vercel and redeploy one final time
              </li>
            </ol>
          </div>
        )}
        {allSet && (
          <div className="flex flex-wrap gap-3 items-center">
            <Link
              href="/api/strava/auth"
              className="text-xs underline underline-offset-4 text-muted-foreground hover:no-underline"
            >
              Re-authorize →
            </Link>
            <Link
              href={AUDIENCE.strava.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs underline underline-offset-4 text-muted-foreground hover:no-underline"
            >
              Strava profile →
            </Link>
          </div>
        )}
      </section>

      {/* Athlete stats */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">2. Athlete stats</h2>
          <StatusPill label="API call" ok={statsOk} />
        </div>
        {!allSet && (
          <p className="text-sm text-muted-foreground">
            Configure credentials above to test this endpoint.
          </p>
        )}
        {allSet && !statsOk && (
          <p className="text-sm text-red-600 dark:text-red-400">
            getAthleteStats() returned null — check server logs for [strava] warnings.
          </p>
        )}
        {stats && (
          <div className="rounded-xl border divide-y">
            <StatRow
              label="Recent (last 4 weeks)"
              count={stats.recent_run_totals.count}
              meters={stats.recent_run_totals.distance}
              seconds={stats.recent_run_totals.moving_time}
              elev={stats.recent_run_totals.elevation_gain}
            />
            <StatRow
              label="Year to date"
              count={stats.ytd_run_totals.count}
              meters={stats.ytd_run_totals.distance}
              seconds={stats.ytd_run_totals.moving_time}
              elev={stats.ytd_run_totals.elevation_gain}
            />
            <StatRow
              label="All time"
              count={stats.all_run_totals.count}
              meters={stats.all_run_totals.distance}
              seconds={stats.all_run_totals.moving_time}
              elev={stats.all_run_totals.elevation_gain}
            />
          </div>
        )}
      </section>

      {/* Recent activities */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">3. Recent activities</h2>
          <StatusPill label="API call" ok={activitiesOk} />
        </div>
        {!allSet && (
          <p className="text-sm text-muted-foreground">
            Configure credentials above to test this endpoint.
          </p>
        )}
        {allSet && !activitiesOk && (
          <p className="text-sm text-red-600 dark:text-red-400">
            getRecentActivities() returned null — check server logs.
          </p>
        )}
        {activities && activities.length === 0 && (
          <p className="text-sm text-muted-foreground">
            API returned 0 activities. Either no recent runs, or all recent activities
            were filtered out (only Run / TrailRun pass through).
          </p>
        )}
        {activities && activities.length > 0 && (
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2">Activity</th>
                  <th className="text-right px-4 py-2">Distance</th>
                  <th className="text-right px-4 py-2">Pace</th>
                  <th className="text-right px-4 py-2">Duration</th>
                  <th className="text-right px-4 py-2">Elev</th>
                  <th className="text-right px-4 py-2">HR</th>
                  <th className="text-right px-4 py-2">When</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {activities.map((a) => (
                  <tr key={a.id}>
                    <td className="px-4 py-2.5">
                      <a
                        href={`https://www.strava.com/activities/${a.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium hover:underline truncate block max-w-[280px]"
                      >
                        {a.name}
                      </a>
                      <span className="text-xs text-muted-foreground">
                        {a.sport_type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                      {formatMiles(a.distance)} mi
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                      {formatPace(a.average_speed)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                      {formatHoursMinutes(a.moving_time)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                      {Math.round(a.total_elevation_gain * 3.28084)} ft
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                      {a.average_heartrate
                        ? Math.round(a.average_heartrate)
                        : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">
                      {formatRelativeDate(a.start_date_local)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Raw JSON dump for debugging */}
      {(stats || activities) && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">4. Raw API response</h2>
          <details className="rounded-xl border">
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium hover:bg-muted/50">
              Show JSON ({stats ? "stats" : ""}{stats && activities ? " + " : ""}
              {activities ? `${activities.length} activities` : ""})
            </summary>
            <pre className="px-4 py-3 text-xs bg-muted/30 overflow-x-auto border-t">
              {JSON.stringify({ stats, activities }, null, 2)}
            </pre>
          </details>
        </section>
      )}

      <footer className="border-t pt-6 text-xs text-muted-foreground">
        <p>
          This page is gated to{" "}
          <code className="bg-muted px-1 rounded">{ADMIN_LOGIN_EMAIL}</code> and
          excluded from search via{" "}
          <code className="bg-muted px-1 rounded">robots: noindex</code>.
        </p>
      </footer>
    </div>
  );
}

function StatRow({
  label,
  count,
  meters,
  seconds,
  elev,
}: {
  label: string;
  count: number;
  meters: number;
  seconds: number;
  elev: number;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 px-5 py-4 items-baseline">
      <p className="text-xs uppercase tracking-wider text-muted-foreground sm:col-span-1">
        {label}
      </p>
      <Stat label="Runs" value={count.toLocaleString()} />
      <Stat label="Miles" value={metersToMiles(meters).toFixed(1)} />
      <Stat label="Time" value={formatHoursMinutes(seconds)} />
      <Stat
        label="Elev (ft)"
        value={Math.round(elev * 3.28084).toLocaleString()}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="font-mono tabular-nums text-base">{value}</p>
    </div>
  );
}
