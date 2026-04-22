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

export const metadata: Metadata = { title: "Booking confirmed" };
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

  const startsAt = row.startsAt;
  const endsAt = row.endsAt;

  return (
    <div className="mx-auto max-w-xl px-6 py-24 flex flex-col items-center text-center space-y-8">
      {/* Check mark */}
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-foreground text-background text-3xl">
        ✓
      </div>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          You&apos;re booked
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          See you out there.
        </h1>
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
            Calendar invite
          </p>
          <p className="text-sm text-muted-foreground">
            A <code>.ics</code> file with the location was sent to your email —
            tap it to add to your calendar.
          </p>
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
