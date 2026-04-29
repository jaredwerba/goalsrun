"use client";

// Owner / developer view of /admin. Business analytics: aggregate
// metrics, revenue projection, runner roster. Uses placeholder
// economics from SESSION_ECONOMICS until billing is wired up.

import type { RunnerRosterRow } from "./admin-shared";
import { SESSION_ECONOMICS } from "@/lib/content";

export type OwnerAnalytics = {
  /** Active bookings — pending + accepted */
  totalBooked: number;
  /** Confirmed (status=accepted) — what counts toward revenue */
  totalConfirmed: number;
  totalPending: number;
  /** Lifetime cancellations across all bookings */
  totalCancelled: number;
  cancelledByUser: number;
  cancelledByAdmin: number;
  /** Distinct people who have ever booked anything */
  uniqueRunners: number;
  /** Distinct people whose runs ended cancelled */
  uniqueRunnersWhoCancelled: number;
  /** Future open slots */
  openSlotsAhead: number;
};

function formatUsd(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// ─── Stat card ─────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: number | string;
  sub?: string;
  accent?: "green" | "blue" | "purple" | "amber" | "red" | "muted";
}) {
  const ring =
    accent === "green"
      ? "ring-green-500/30 bg-green-50 dark:bg-green-950/20"
      : accent === "blue"
        ? "ring-blue-500/30 bg-blue-50 dark:bg-blue-950/20"
        : accent === "purple"
          ? "ring-purple-500/30 bg-purple-50 dark:bg-purple-950/20"
          : accent === "amber"
            ? "ring-amber-500/30 bg-amber-50 dark:bg-amber-950/20"
            : accent === "red"
              ? "ring-red-500/30 bg-red-50 dark:bg-red-950/20"
              : "ring-foreground/10 bg-card";
  return (
    <div className={`rounded-xl ring-1 p-5 ${ring}`}>
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tabular-nums leading-none">
        {value}
      </p>
      {sub && (
        <p className="mt-1.5 text-xs text-muted-foreground">{sub}</p>
      )}
    </div>
  );
}

// ─── Roster table ──────────────────────────────────────────────────────────

function RunnerRoster({ roster }: { roster: RunnerRosterRow[] }) {
  if (roster.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No runners yet. The roster will populate once people start booking.
      </p>
    );
  }

  const { dollarsPerSession } = SESSION_ECONOMICS;

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="text-left px-4 py-2.5 font-medium">Runner</th>
            <th className="text-right px-4 py-2.5 font-medium">Active</th>
            <th className="text-right px-4 py-2.5 font-medium">Confirmed</th>
            <th className="text-right px-4 py-2.5 font-medium">Cancelled</th>
            <th className="text-right px-4 py-2.5 font-medium">Revenue</th>
            <th className="text-right px-4 py-2.5 font-medium">First → Last</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {roster.map((r) => (
            <tr key={r.userId}>
              <td className="px-4 py-3">
                <p className="font-medium">{r.name}</p>
                <a
                  href={`mailto:${r.email}`}
                  className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                  {r.email}
                </a>
              </td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">
                {r.activeRuns}
              </td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">
                {r.confirmedRuns}
              </td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">
                {r.cancelledRuns > 0 ? (
                  <span className="text-red-600 dark:text-red-400">
                    {r.cancelledRuns}
                  </span>
                ) : (
                  <span className="text-muted-foreground">0</span>
                )}
              </td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">
                {formatUsd(r.confirmedRuns * dollarsPerSession)}
              </td>
              <td className="px-4 py-3 text-right text-xs text-muted-foreground tabular-nums">
                {formatDate(r.firstBookingAt)} → {formatDate(r.lastBookingAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main owner dashboard ──────────────────────────────────────────────────

export function OwnerDashboard({
  analytics,
  roster,
}: {
  analytics: OwnerAnalytics;
  roster: RunnerRosterRow[];
}) {
  const { milesPerSession, dollarsPerSession } = SESSION_ECONOMICS;

  const totalDistance = analytics.totalConfirmed * milesPerSession;
  const projectedRevenue = analytics.totalConfirmed * dollarsPerSession;
  const totalSeats =
    analytics.totalBooked + analytics.totalCancelled + analytics.openSlotsAhead;
  const utilization =
    totalSeats > 0
      ? Math.round((analytics.totalBooked / totalSeats) * 100)
      : 0;

  return (
    <div className="space-y-12">
      {/* Top row — core business metrics */}
      <section className="space-y-4">
        <h2 className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Business view · placeholder economics
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Total runners booked"
            value={analytics.uniqueRunners}
            sub={`${analytics.totalBooked} bookings · ${analytics.totalConfirmed} confirmed`}
            accent="blue"
          />
          <StatCard
            label="Total distance"
            value={`${totalDistance} mi`}
            sub={`@ ${milesPerSession} mi/session × ${analytics.totalConfirmed} confirmed`}
            accent="purple"
          />
          <StatCard
            label="Projected revenue"
            value={formatUsd(projectedRevenue)}
            sub={`@ ${formatUsd(dollarsPerSession)}/run × ${analytics.totalConfirmed} confirmed`}
            accent="green"
          />
          <StatCard
            label="Cancellations"
            value={analytics.totalCancelled}
            sub={
              analytics.totalCancelled === 0
                ? "None recorded"
                : `${analytics.cancelledByUser} by runner · ${analytics.cancelledByAdmin} by admin`
            }
            accent={analytics.totalCancelled > 0 ? "red" : "muted"}
          />
        </div>

        {/* Footnote about placeholders */}
        <p className="text-xs text-muted-foreground">
          Distance and revenue use placeholder constants
          (<code className="px-1 bg-muted rounded">SESSION_ECONOMICS</code> in{" "}
          <code className="px-1 bg-muted rounded">lib/content.ts</code>).
          Wire to real billing/distance tracking once Goals starts charging.
        </p>
      </section>

      {/* Second row — operational health */}
      <section className="space-y-4">
        <h2 className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Operational
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Pending review"
            value={analytics.totalPending}
            sub="Goals hasn't accepted yet"
            accent={analytics.totalPending > 0 ? "amber" : "muted"}
          />
          <StatCard
            label="Open slots ahead"
            value={analytics.openSlotsAhead}
            sub="Available in the next 14 days"
          />
          <StatCard
            label="Runners who cancelled"
            value={analytics.uniqueRunnersWhoCancelled}
            sub={
              analytics.uniqueRunners > 0
                ? `${Math.round((analytics.uniqueRunnersWhoCancelled / analytics.uniqueRunners) * 100)}% of all runners`
                : "—"
            }
            accent="muted"
          />
          <StatCard
            label="Slot utilization"
            value={`${utilization}%`}
            sub="Booked ÷ (booked + cancelled + open)"
          />
        </div>
      </section>

      {/* Per-runner roster */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Runner roster
          </h2>
          <p className="text-xs text-muted-foreground">
            {roster.length} unique
          </p>
        </div>
        <RunnerRoster roster={roster} />
      </section>
    </div>
  );
}
