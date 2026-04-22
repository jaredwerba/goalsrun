"use client";

import { formatSlotRange } from "@/lib/tz";

export type AdminBookingRow = {
  bookingId: string;
  runnerName: string;
  runnerEmail: string;
  startsAt: string;
  endsAt: string;
  location: string;
  notes: string | null;
  bookedAt: string;
};

export function RunnersTable({ rows }: { rows: AdminBookingRow[] }) {
  const now = new Date();

  if (rows.length === 0) {
    return (
      <p className="text-muted-foreground">No bookings yet.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
              Runner
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
              Email
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
              Slot
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
              Status
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
              Notes
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => {
            const slotDate = new Date(r.startsAt);
            const isPast = slotDate < now;
            return (
              <tr key={r.bookingId} className={isPast ? "opacity-50" : ""}>
                <td className="px-4 py-3 font-medium whitespace-nowrap">
                  {r.runnerName}
                </td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  <a
                    href={`mailto:${r.runnerEmail}`}
                    className="underline underline-offset-4 hover:text-foreground"
                  >
                    {r.runnerEmail}
                  </a>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {formatSlotRange(new Date(r.startsAt), new Date(r.endsAt))}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {isPast ? (
                    <span className="text-muted-foreground">Done</span>
                  ) : (
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      Upcoming
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                  {r.notes ?? "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
