"use client";

// Unified admin dashboard — Goals and werba see the exact same thing.
// Optimized for an owner-operator: at-a-glance business metrics
// (with placeholder economics) on top, then operational lists, then
// the runner roster. Stat numbers count up on first paint.

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AnimatedInt,
  AnimatedUsd,
  AnimatedWithUnit,
  AnimatedPercent,
  BookingCard,
  CancellationCard,
  StatusBadge,
  type AdminBookingRow,
  type CancellationRow,
  type RunnerRosterRow,
} from "./admin-shared";
import { formatSlotRange } from "@/lib/tz";
import { SESSION_ECONOMICS } from "@/lib/content";

// ─── Types ─────────────────────────────────────────────────────────────────

export type AdminAnalytics = {
  totalBooked: number;
  totalConfirmed: number;
  totalPending: number;
  totalCancelled: number;
  cancelledByUser: number;
  cancelledByAdmin: number;
  uniqueRunners: number;
  uniqueRunnersWhoCancelled: number;
  openSlotsAhead: number;
};

// ─── Stat card ─────────────────────────────────────────────────────────────

type Accent = "green" | "blue" | "purple" | "amber" | "red" | "muted";

function accentClasses(a: Accent | undefined): string {
  switch (a) {
    case "green":
      return "ring-green-500/30 bg-green-50 dark:bg-green-950/20";
    case "blue":
      return "ring-blue-500/30 bg-blue-50 dark:bg-blue-950/20";
    case "purple":
      return "ring-purple-500/30 bg-purple-50 dark:bg-purple-950/20";
    case "amber":
      return "ring-amber-500/30 bg-amber-50 dark:bg-amber-950/20";
    case "red":
      return "ring-red-500/30 bg-red-50 dark:bg-red-950/20";
    default:
      return "ring-foreground/10 bg-card";
  }
}

function StatCard({
  label,
  children,
  sub,
  accent,
  delay = 0,
}: {
  label: string;
  children: React.ReactNode;
  sub?: string;
  accent?: Accent;
  /** Animation delay in ms — staggers card entry */
  delay?: number;
}) {
  return (
    <div
      className={`rounded-xl ring-1 p-5 ${accentClasses(accent)}
        animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tabular-nums leading-none">
        {children}
      </p>
      {sub && (
        <p className="mt-1.5 text-xs text-muted-foreground">{sub}</p>
      )}
    </div>
  );
}

// ─── Runner roster table ───────────────────────────────────────────────────

function RunnerRoster({ roster }: { roster: RunnerRosterRow[] }) {
  if (roster.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No runners yet — the roster fills in as people book.
      </p>
    );
  }

  const { dollarsPerSession } = SESSION_ECONOMICS;

  function formatDate(iso: string | null): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="overflow-x-auto rounded-xl border animate-in fade-in duration-500">
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
          {roster.map((r, i) => (
            <tr
              key={r.userId}
              className="animate-in fade-in slide-in-from-bottom-1 duration-500 fill-mode-both"
              style={{ animationDelay: `${600 + i * 40}ms` }}
            >
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
                ${(r.confirmedRuns * dollarsPerSession).toLocaleString()}
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

// ─── Main admin dashboard ──────────────────────────────────────────────────

export function AdminDashboard({
  analytics,
  pending,
  upcoming,
  past,
  cancellations,
  roster,
}: {
  analytics: AdminAnalytics;
  pending: AdminBookingRow[];
  upcoming: AdminBookingRow[];
  past: AdminBookingRow[];
  cancellations: CancellationRow[];
  roster: RunnerRosterRow[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function refresh() {
    startTransition(() => router.refresh());
  }

  const { milesPerSession, dollarsPerSession } = SESSION_ECONOMICS;
  const totalDistance = analytics.totalConfirmed * milesPerSession;
  const projectedRevenue = analytics.totalConfirmed * dollarsPerSession;

  const totalSeats =
    analytics.totalBooked +
    analytics.totalCancelled +
    analytics.openSlotsAhead;
  const utilization =
    totalSeats > 0
      ? Math.round((analytics.totalBooked / totalSeats) * 100)
      : 0;

  return (
    <div className="space-y-12">
      {/* ─── Headline metrics (animated count-up) ────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          At a glance
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Total runners booked"
            sub={`${analytics.totalBooked} bookings · ${analytics.totalConfirmed} confirmed`}
            accent="blue"
            delay={0}
          >
            <AnimatedInt value={analytics.uniqueRunners} />
          </StatCard>

          <StatCard
            label="Total distance"
            sub={`@ ${milesPerSession} mi/session × confirmed runs`}
            accent="purple"
            delay={80}
          >
            <AnimatedWithUnit value={totalDistance} unit="mi" />
          </StatCard>

          <StatCard
            label="Projected revenue"
            sub={`@ $${dollarsPerSession}/run × confirmed runs`}
            accent="green"
            delay={160}
          >
            <AnimatedUsd value={projectedRevenue} />
          </StatCard>

          <StatCard
            label="Cancellations"
            sub={
              analytics.totalCancelled === 0
                ? "None recorded"
                : `${analytics.cancelledByUser} runner · ${analytics.cancelledByAdmin} admin`
            }
            accent={analytics.totalCancelled > 0 ? "red" : "muted"}
            delay={240}
          >
            <AnimatedInt value={analytics.totalCancelled} />
          </StatCard>
        </div>

        <p className="text-xs text-muted-foreground animate-in fade-in duration-1000">
          Distance and revenue use placeholder constants
          (<code className="px-1 bg-muted rounded">SESSION_ECONOMICS</code> in
          {" "}<code className="px-1 bg-muted rounded">lib/content.ts</code>) —
          swap to real data once billing/Strava are wired.
        </p>
      </section>

      {/* ─── Operational health ──────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Operations
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Pending review"
            sub="Goals hasn't accepted yet"
            accent={analytics.totalPending > 0 ? "amber" : "muted"}
            delay={320}
          >
            <AnimatedInt value={analytics.totalPending} />
          </StatCard>
          <StatCard
            label="Open slots"
            sub="Available next 14 days"
            delay={400}
          >
            <AnimatedInt value={analytics.openSlotsAhead} />
          </StatCard>
          <StatCard
            label="Runners who cancelled"
            sub={
              analytics.uniqueRunners > 0
                ? `${Math.round(
                    (analytics.uniqueRunnersWhoCancelled /
                      analytics.uniqueRunners) *
                      100,
                  )}% of all runners`
                : "—"
            }
            delay={480}
          >
            <AnimatedInt value={analytics.uniqueRunnersWhoCancelled} />
          </StatCard>
          <StatCard
            label="Slot utilization"
            sub="Booked ÷ (booked + cancelled + open)"
            delay={560}
          >
            <AnimatedPercent value={utilization} />
          </StatCard>
        </div>
      </section>

      {/* ─── Pending review (action zone) ────────────────────────────── */}
      {pending.length > 0 && (
        <section className="space-y-4 animate-in fade-in duration-700 fill-mode-both"
          style={{ animationDelay: "640ms" }}>
          <div className="flex items-center gap-3">
            <h2 className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Needs your review
            </h2>
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white animate-pulse">
              {pending.length}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {pending.map((r) => (
              <BookingCard key={r.bookingId} row={r} onAction={refresh} />
            ))}
          </div>
        </section>
      )}

      {/* ─── Upcoming confirmed ─────────────────────────────────────── */}
      {upcoming.length > 0 && (
        <section className="space-y-4 animate-in fade-in duration-700 fill-mode-both"
          style={{ animationDelay: "720ms" }}>
          <h2 className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Upcoming confirmed
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {upcoming.map((r) => (
              <BookingCard key={r.bookingId} row={r} onAction={refresh} />
            ))}
          </div>
        </section>
      )}

      {/* ─── Past runs ──────────────────────────────────────────────── */}
      {past.length > 0 && (
        <section className="space-y-4 animate-in fade-in duration-700 fill-mode-both"
          style={{ animationDelay: "800ms" }}>
          <h2 className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Past runs
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 opacity-60">
            {past.slice(0, 12).map((r) => (
              <div
                key={r.bookingId}
                className="rounded-lg border bg-card p-5 space-y-1"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-semibold">{r.runnerName}</p>
                  <StatusBadge status={r.status} />
                </div>
                <p className="text-sm font-medium">
                  {formatSlotRange(new Date(r.startsAt), new Date(r.endsAt))}
                </p>
                <p className="text-sm text-muted-foreground">{r.location}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── Cancellations log ──────────────────────────────────────── */}
      {cancellations.length > 0 && (
        <section className="space-y-4 animate-in fade-in duration-700 fill-mode-both"
          style={{ animationDelay: "880ms" }}>
          <div className="flex items-baseline justify-between">
            <h2 className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Cancellations log
            </h2>
            <p className="text-xs text-muted-foreground">
              {cancellations.length} total
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {cancellations.slice(0, 20).map((r) => (
              <CancellationCard key={r.bookingId} row={r} />
            ))}
          </div>
          {cancellations.length > 20 && (
            <p className="text-xs text-muted-foreground">
              Showing 20 most recent of {cancellations.length}.
            </p>
          )}
        </section>
      )}

      {/* ─── Runner roster ──────────────────────────────────────────── */}
      <section className="space-y-4 animate-in fade-in duration-700 fill-mode-both"
        style={{ animationDelay: "960ms" }}>
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

      {/* ─── Empty state ────────────────────────────────────────────── */}
      {pending.length === 0 &&
        upcoming.length === 0 &&
        past.length === 0 &&
        cancellations.length === 0 &&
        roster.length === 0 && (
          <p className="text-muted-foreground border-t pt-6">
            No bookings yet. Once runners start scheduling, this dashboard
            will populate.
          </p>
        )}
    </div>
  );
}
