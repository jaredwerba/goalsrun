"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cancelBooking } from "@/app/actions";
import { formatSlotRange } from "@/lib/tz";

export type BookingRow = {
  bookingId: string;
  slotId: string;
  startsAt: string;
  endsAt: string;
  location: string;
  notes: string | null;
  status: "pending" | "accepted";
};

export function MyBookingsList({ rows }: { rows: BookingRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="text-muted-foreground">
        No bookings yet. Head to{" "}
        <a href="/book" className="underline underline-offset-4">
          /book
        </a>{" "}
        to claim a slot.
      </p>
    );
  }

  async function onCancel(id: string) {
    const res = await cancelBooking(id);
    if (res.ok) toast.success("Booking canceled.");
    else toast.error(res.error);
  }

  return (
    <ul className="divide-y divide-border rounded-lg border">
      {rows.map((r) => (
        <li
          key={r.bookingId}
          className="p-4 flex flex-wrap items-start justify-between gap-3"
        >
          <div>
            <p className="font-medium">
              {formatSlotRange(new Date(r.startsAt), new Date(r.endsAt))}
            </p>
            <p className="text-sm text-muted-foreground">{r.location}</p>
            {r.notes && (
              <p className="mt-2 text-sm">
                <span className="text-muted-foreground">Notes: </span>
                {r.notes}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCancel(r.bookingId)}
          >
            Cancel
          </Button>
        </li>
      ))}
    </ul>
  );
}
