import { AGE, AUDIENCE, PHYSIOLOGY } from "@/lib/content";
import {
  formatMiles,
  formatPace,
  formatRelativeDate,
  formatHoursMinutes,
  getAthleteStats,
  getRecentActivities,
  hasStravaCredentials,
  metersToMiles,
} from "@/lib/strava";
import Link from "next/link";

type Stat = { label: string; value: string; suffix?: string; live?: boolean };

export async function PerformancePanel() {
  // Pull live data when Strava credentials are set; fall back to static values.
  const [stats, activities] = hasStravaCredentials()
    ? await Promise.all([getAthleteStats(), getRecentActivities(5)])
    : [null, null];

  const weeklyMiles =
    stats
      ? Math.round(metersToMiles(stats.recent_run_totals.distance) / 4) // 4-week avg
      : PHYSIOLOGY.weeklyMileage;

  const liveWeekly = !!stats;

  const STATS: Stat[] = [
    { label: "Age", value: String(AGE) },
    { label: "VO\u2082 max", value: String(PHYSIOLOGY.vo2Max), suffix: "mL/kg·min" },
    { label: "Resting HR", value: String(PHYSIOLOGY.restingHR), suffix: "bpm" },
    {
      label: liveWeekly ? "Weekly avg (live)" : "Weekly mileage",
      value: String(weeklyMiles),
      suffix: "mi",
      live: liveWeekly,
    },
    { label: "Years running", value: String(PHYSIOLOGY.yearsRunning) },
    { label: "Body fat", value: String(PHYSIOLOGY.bodyFatPct), suffix: "%" },
    { label: "Marathon PR", value: PHYSIOLOGY.marathonPR },
    { label: "Masters PR", value: PHYSIOLOGY.mastersPR },
  ];

  return (
    <section className="mx-auto max-w-5xl px-6 py-16 border-t">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Physiology
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            The numbers at 43.
          </h2>
        </div>
        {liveWeekly && (
          <Link
            href={AUDIENCE.strava.url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
            Live from Strava
          </Link>
        )}
      </div>

      <dl className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-10">
        {STATS.map((s) => (
          <div key={s.label}>
            <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
              {s.label}
              {s.live && (
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
              )}
            </dt>
            <dd className="mt-2 flex items-baseline gap-1.5">
              <span className="text-5xl sm:text-6xl font-semibold tabular-nums leading-none">
                {s.value}
              </span>
              {s.suffix && (
                <span className="text-xs text-muted-foreground">{s.suffix}</span>
              )}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-10 text-sm text-muted-foreground max-w-2xl">
        VO<sub>2</sub> max measured under a treadmill protocol. Weekly volume
        during marathon build{liveWeekly ? " — averaged from the past 4 weeks on Strava" : ""}. Masters division: 40+.
      </p>

      {/* Recent runs feed — only when live Strava data is available */}
      {activities && activities.length > 0 && (
        <div className="mt-12 border-t pt-10">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Recent runs
            </p>
            <Link
              href={AUDIENCE.strava.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs underline underline-offset-4 hover:no-underline text-muted-foreground"
            >
              All runs on Strava →
            </Link>
          </div>
          <ul className="divide-y">
            {activities.map((a) => (
              <li
                key={a.id}
                className="py-3 grid grid-cols-[1fr_auto] gap-x-6 gap-y-0.5 items-baseline"
              >
                <a
                  href={`https://www.strava.com/activities/${a.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium hover:underline underline-offset-4 truncate text-sm"
                >
                  {a.name}
                </a>
                <p className="font-mono tabular-nums text-sm text-right">
                  {formatMiles(a.distance)} mi
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatRelativeDate(a.start_date_local)}
                  {a.sport_type === "TrailRun" ? " · Trail" : ""}
                </p>
                <p className="font-mono tabular-nums text-xs text-muted-foreground text-right">
                  {formatPace(a.average_speed)}/mi · {formatHoursMinutes(a.moving_time)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
