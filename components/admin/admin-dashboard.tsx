"use client";

import { useState, useTransition } from "react";
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
        toast.success("Booking canceled, slot freed.");
        onAction();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="rounded-lg border bg-card p-5 space-y-3">
      {/* Runner + status */}
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

      {/* Slot details */}
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

      {/* Actions */}
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

export function AdminDashboard({
  pending: pendingRows,
  upcoming,
  past,
}: {
  pending: AdminBookingRow[];
  upcoming: AdminBookingRow[];
  past: AdminBookingRow[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function refresh() {
    startTransition(() => {
      router.refresh();
    });
  }

  const total = pendingRows.length + upcoming.length + past.length;

  if (total === 0) {
    return (
      <p className="text-muted-foreground mt-8">No bookings yet.</p>
    );
  }

  return (
    <div className="space-y-12">
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
              <div key={r.bookingId} className="rounded-lg border bg-card p-5 space-y-1">
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
    </div>
  );
}
