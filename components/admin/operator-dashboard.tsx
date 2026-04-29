"use client";

// Operator (Goals') view of /admin. Operational, action-oriented:
// who's on the schedule, who's cancelled. No business analytics —
// that's the owner view in owner-dashboard.tsx.

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  BookingCard,
  CancellationCard,
  StatusBadge,
  type AdminBookingRow,
  type CancellationRow,
} from "./admin-shared";
import { formatSlotRange } from "@/lib/tz";
import { RUNNER_FIRST_NAME } from "@/lib/content";

export function OperatorDashboard({
  pending,
  upcoming,
  past,
  cancellations,
}: {
  pending: AdminBookingRow[];
  upcoming: AdminBookingRow[];
  past: AdminBookingRow[];
  cancellations: CancellationRow[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function refresh() {
    startTransition(() => router.refresh());
  }

  const isEmpty =
    pending.length === 0 &&
    upcoming.length === 0 &&
    past.length === 0 &&
    cancellations.length === 0;

  if (isEmpty) {
    return (
      <p className="text-muted-foreground">
        No bookings yet. Once runners start scheduling, they&apos;ll show up here.
      </p>
    );
  }

  return (
    <div className="space-y-12">
      {/* Pending — needs Goals' action */}
      {pending.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Needs your review
            </h2>
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
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

      {/* Upcoming — already accepted, on the calendar */}
      {upcoming.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Runners scheduled with you
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {upcoming.map((r) => (
              <BookingCard key={r.bookingId} row={r} onAction={refresh} />
            ))}
          </div>
        </section>
      )}

      {/* Past — read-only history */}
      {past.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Past runs
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 opacity-60">
            {past.map((r) => (
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
                <a
                  href={`mailto:${r.runnerEmail}`}
                  className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                  {r.runnerEmail}
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Cancellations — runners who bailed */}
      {cancellations.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Runners who cancelled
            </h2>
            <p className="text-xs text-muted-foreground">
              {cancellations.length} total
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {cancellations.slice(0, 30).map((r) => (
              <CancellationCard key={r.bookingId} row={r} />
            ))}
          </div>
          {cancellations.length > 30 && (
            <p className="text-xs text-muted-foreground">
              Showing 30 most recent of {cancellations.length}.
            </p>
          )}
        </section>
      )}

      {/* Empty-state nudges if Goals has no pending/upcoming */}
      {pending.length === 0 && upcoming.length === 0 && (
        <p className="text-sm text-muted-foreground border-t pt-6">
          Hi {RUNNER_FIRST_NAME} — nothing on the schedule right now.
        </p>
      )}
    </div>
  );
}
