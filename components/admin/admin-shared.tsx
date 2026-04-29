"use client";

// Types and small UI atoms shared between the operator (Goals) and owner
// (developer) admin dashboards.

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { acceptBooking, adminCancelBooking } from "@/app/admin/actions";
import { formatSlotRange } from "@/lib/tz";

// ─── Shared types ──────────────────────────────────────────────────────────

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

export type RunnerRosterRow = {
  userId: string;
  name: string;
  email: string;
  /** Bookings with status pending or accepted */
  activeRuns: number;
  /** Bookings with status accepted (counts toward revenue) */
  confirmedRuns: number;
  cancelledRuns: number;
  firstBookingAt: string | null;
  lastBookingAt: string | null;
};

// ─── Status badge ──────────────────────────────────────────────────────────

export function StatusBadge({
  status,
}: {
  status: "pending" | "accepted";
}) {
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

// ─── Booking card with accept/cancel actions ───────────────────────────────

export function BookingCard({
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

// ─── Cancellation card (audit log row) ─────────────────────────────────────

export function CancellationCard({ row }: { row: CancellationRow }) {
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
          {row.cancelledBy === "user" ? "Runner cancelled" : "Admin cancelled"}
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
