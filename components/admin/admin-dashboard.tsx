"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { acceptBooking, adminCancelBooking } from "@/app/admin/actions";
import { formatSlotRange } from "@/lib/tz";

export type AdminBookingRow = {
  bookingId: string;
  runnerName: string;
  runnerEmail: string;
  startsAt: string;
  endsAt: string;
  location: string;
  notes: string | null;
  status: "pending" | "accepted";
  bookedAt: string;
};

export type CancellationRow = {
  bookingId: string;
  runnerName: string;
  runnerEmail: string;
  startsAt: string;
  endsAt: string;
  location: string;
  cancelledAt: string | null;
  cancelledBy: "user" | "admin";
  bookedAt: string;
};

export type Analytics = {
  /** Active bookings (pending + accepted) — runs Goals is committed to */
  totalBooked: number;
  totalPending: number;
  totalAccepted: number;
  /** Cancellations recorded in the audit log */
  totalCancelled: number;
  cancelledByUser: number;
  cancelledByAdmin: number;
  /** Distinct people who have ever submitted a booking (any status) */
  uniqueRunners: number;
  /** Distinct people whose runs ended in cancellation */
  uniqueRunnersWhoCancelled: number;
  /** Open future slots — capacity remaining */
  openSlotsAhead: number;
};

// ──────────────────────────────────────────────────────────────────────────
// Analytics cards
// ──────────────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: number | string;
  sub?: string;
  accent?: "amber" | "green" | "red" | "muted";
}) {
  const ring =
    accent === "amber"
      ? "ring-amber-500/30 bg-amber-50 dark:bg-amber-950/20"
      : accent === "green"
        ? "ring-green-500/30 bg-green-50 dark:bg-green-950/20"
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

function AnalyticsPanel({ a }: { a: Analytics }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
        At a glance
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Runs booked"
          value={a.totalBooked}
          sub={`${a.totalPending} pending · ${a.totalAccepted} confirmed`}
          accent="green"
        />
        <StatCard
          label="Cancellations"
          value={a.totalCancelled}
          sub={
            a.totalCancelled === 0
              ? "None yet"
              : `${a.cancelledByUser} by runner · ${a.cancelledByAdmin} by you`
          }
          accent={a.totalCancelled > 0 ? "red" : "muted"}
        />
        <StatCard
          label="People booked"
          value={a.uniqueRunners}
          sub={
            a.uniqueRunnersWhoCancelled > 0
              ? `${a.uniqueRunnersWhoCancelled} have cancelled at least once`
              : "All-time unique runners"
          }
        />
        <StatCard
          label="Open slots"
          value={a.openSlotsAhead}
          sub="Available in the next 14 days"
          accent="muted"
        />
      </div>

      {a.totalCancelled === 0 && (
        <p className="text-xs text-muted-foreground">
          Cancellation tracking started after the soft-delete migration.
          Earlier cancellations (before this update) were hard-deleted and
          aren&apos;t counted here.
        </p>
      )}
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Booking cards (active rows)
// ──────────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: "pending" | "accepted" }) {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
        Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
      Confirmed
    </span>
  );
}

function BookingCard({
  row,
  onAction,
}: {
  row: AdminBookingRow;
  onAction: () => void;
}) {
  const [pending, startTransition] = useTransition();

  function handleAccept() {
    startTransition(async () => {
      const res = await acceptBooking(row.bookingId);
      if (res.ok) {
        toast.success(`Accepted — confirmation sent to ${row.runnerName}.`);
        onAction();
      } else {
        toast.error(res.error);
      }
    });
  }

  function handleCancel() {
    startTransition(async () => {
      const res = await adminCancelBooking(row.bookingId);
      if (res.ok) {
        toast.success("Booking cancelled, slot freed.");
        onAction();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="rounded-lg border bg-card p-5 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{row.runnerName}</p>
          <a
            href={`mailto:${row.runnerEmail}`}
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            {row.runnerEmail}
          </a>
        </div>
        <StatusBadge status={row.status} />
      </div>

      <div className="text-sm space-y-0.5">
        <p className="font-medium">
          {formatSlotRange(new Date(row.startsAt), new Date(row.endsAt))}
        </p>
        <p className="text-muted-foreground">{row.location}</p>
        {row.notes && (
          <p className="text-muted-foreground">
            <span className="text-foreground/70">Notes:</span> {row.notes}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {row.status === "pending" && (
          <Button size="sm" onClick={handleAccept} disabled={pending}>
            Accept
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
          disabled={pending}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Cancellation list (audit log)
// ──────────────────────────────────────────────────────────────────────────

function CancellationCard({ row }: { row: CancellationRow }) {
  const cancelledWhen = row.cancelledAt
    ? new Date(row.cancelledAt).toLocaleString("en-US", {
        timeZone: "America/New_York",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";

  return (
    <div className="rounded-lg border bg-card p-4 space-y-2 opacity-90">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-sm">{row.runnerName}</p>
          <a
            href={`mailto:${row.runnerEmail}`}
            className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            {row.runnerEmail}
          </a>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
            row.cancelledBy === "user"
              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              : "bg-foreground/10 text-foreground"
          }`}
        >
          {row.cancelledBy === "user" ? "Runner cancelled" : "You cancelled"}
        </span>
      </div>
      <div className="text-xs text-muted-foreground space-y-0.5">
        <p>
          <span className="text-foreground/70">Was:</span>{" "}
          {formatSlotRange(new Date(row.startsAt), new Date(row.endsAt))} ·{" "}
          {row.location}
        </p>
        <p>
          <span className="text-foreground/70">Cancelled:</span> {cancelledWhen}
        </p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Main dashboard
// ──────────────────────────────────────────────────────────────────────────

export function AdminDashboard({
  analytics,
  pending: pendingRows,
  upcoming,
  past,
  cancellations,
}: {
  analytics: Analytics;
  pending: AdminBookingRow[];
  upcoming: AdminBookingRow[];
  past: AdminBookingRow[];
  cancellations: CancellationRow[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function refresh() {
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="space-y-12">
      <AnalyticsPanel a={analytics} />

      {pendingRows.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Pending review
            </h2>
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
              {pendingRows.length}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {pendingRows.map((r) => (
              <BookingCard key={r.bookingId} row={r} onAction={refresh} />
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="space-y-4">
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

      {cancellations.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Cancellations log
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {cancellations.slice(0, 30).map((r) => (
              <CancellationCard key={r.bookingId} row={r} />
            ))}
          </div>
          {cancellations.length > 30 && (
            <p className="text-xs text-muted-foreground">
              Showing 30 most recent of {cancellations.length} total.
            </p>
          )}
        </section>
      )}

      {pendingRows.length === 0 &&
        upcoming.length === 0 &&
        past.length === 0 &&
        cancellations.length === 0 && (
          <p className="text-muted-foreground">No bookings yet.</p>
        )}
    </div>
  );
}
