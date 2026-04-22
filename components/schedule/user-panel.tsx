"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { cancelBooking } from "@/app/actions";
import { formatSlotRange } from "@/lib/tz";
import { Button } from "@/components/ui/button";
import { GOALS_EMAIL } from "@/lib/content";
import type { BookingRow } from "@/components/schedule/my-bookings-list";

type Props = {
  userName: string;
  userEmail: string;
  upcomingRuns: BookingRow[];
  pastRuns: BookingRow[];
};

export function UserPanel({ userName, userEmail, upcomingRuns, pastRuns }: Props) {
  const router = useRouter();

  async function signOut() {
    await authClient.signOut();
    router.refresh();
  }

  async function onCancel(bookingId: string) {
    const res = await cancelBooking(bookingId);
    if (res.ok) {
      toast.success("Booking canceled.");
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  const mailtoHref = `mailto:${GOALS_EMAIL}?subject=${encodeURIComponent(
    "Question from " + userName,
  )}&body=${encodeURIComponent("Hi Goals,\n\n")}`;

  return (
    <div className="space-y-8">
      {/* Account bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Signed in
          </p>
          <p className="mt-0.5 font-medium">{userName}</p>
          <p className="text-sm text-muted-foreground">{userEmail}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={mailtoHref}>Message Goals</a>
          </Button>
          <Button variant="outline" size="sm" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </div>

      {/* Upcoming runs */}
      <div>
        <h3 className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Upcoming runs
        </h3>
        {upcomingRuns.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No upcoming runs booked — pick a slot below.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border rounded-lg border">
            {upcomingRuns.map((r) => (
              <li
                key={r.bookingId}
                className="flex flex-wrap items-start justify-between gap-3 p-4"
              >
                <div>
                  <p className="font-medium">
                    {formatSlotRange(new Date(r.startsAt), new Date(r.endsAt))}
                  </p>
                  <p className="text-sm text-muted-foreground">{r.location}</p>
                  {r.notes && (
                    <p className="mt-1 text-sm">
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
        )}
      </div>

      {/* Past runs */}
      {pastRuns.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Past runs
          </h3>
          <ul className="mt-3 divide-y divide-border rounded-lg border">
            {pastRuns.map((r) => (
              <li key={r.bookingId} className="p-4 opacity-60">
                <p className="font-medium">
                  {formatSlotRange(new Date(r.startsAt), new Date(r.endsAt))}
                </p>
                <p className="text-sm text-muted-foreground">{r.location}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
