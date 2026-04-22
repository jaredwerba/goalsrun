import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookings, slots } from "@/lib/db/schema";
import { formatSlotRange, formatDayHeader } from "@/lib/tz";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Run request" };
export const dynamic = "force-dynamic";

export default async function BookingConfirmedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/book");

  const { id } = await params;

  const [row] = await db
    .select({
      bookingId: bookings.id,
      location: bookings.location,
      notes: bookings.notes,
      status: bookings.status,
      startsAt: slots.startsAt,
      endsAt: slots.endsAt,
    })
    .from(bookings)
    .innerJoin(slots, eq(bookings.slotId, slots.id))
    .where(
      and(
        eq(bookings.id, id),
        eq(bookings.userId, session.user.id),
      ),
    )
    .limit(1);

  if (!row) notFound();

  const isPending = row.status === "pending";
  const startsAt = row.startsAt;
  const endsAt = row.endsAt;

  return (
    <div className="mx-auto max-w-xl px-6 py-24 flex flex-col items-center text-center space-y-8">
      {/* Icon */}
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl ${
          isPending
            ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
            : "bg-foreground text-background"
        }`}
      >
        {isPending ? "⏳" : "✓"}
      </div>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          {isPending ? "Request received" : "Confirmed"}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          {isPending ? "You're on the list." : "See you out there."}
        </h1>
        <p className="text-muted-foreground max-w-xs mx-auto">
          {isPending
            ? "Goals will review and confirm your request. You'll get an email once it's accepted."
            : "Check your email for the calendar invite with the location."}
        </p>
      </div>

      {/* Booking details card */}
      <div className="w-full rounded-xl border bg-card text-left divide-y">
        <div className="px-6 py-4">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-1">
            Date &amp; time
          </p>
          <p className="font-medium">{formatDayHeader(startsAt)}</p>
          <p className="text-muted-foreground text-sm">
            {formatSlotRange(startsAt, endsAt)}
          </p>
        </div>
        <div className="px-6 py-4">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-1">
            Location
          </p>
          <p className="font-medium">{row.location}</p>
          <p className="text-sm text-muted-foreground">South Boston, MA</p>
        </div>
        {row.notes && (
          <div className="px-6 py-4">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-1">
              Your notes
            </p>
            <p className="text-sm">{row.notes}</p>
          </div>
        )}
        <div className="px-6 py-4">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-1">
            Status
          </p>
          {isPending ? (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
              Pending
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
              Confirmed
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        <Button asChild variant="outline">
          <Link href="/book">Back to schedule</Link>
        </Button>
      </div>
    </div>
  );
}
