import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, asc, eq, gt } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookings, slots } from "@/lib/db/schema";
import {
  MyBookingsList,
  type BookingRow,
} from "@/components/schedule/my-bookings-list";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My bookings" };
export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/book");

  const rows: BookingRow[] = await db
    .select({
      bookingId: bookings.id,
      slotId: slots.id,
      startsAt: slots.startsAt,
      endsAt: slots.endsAt,
      location: bookings.location,
      notes: bookings.notes,
    })
    .from(bookings)
    .innerJoin(slots, eq(bookings.slotId, slots.id))
    .where(
      and(eq(bookings.userId, session.user.id), gt(slots.startsAt, new Date())),
    )
    .orderBy(asc(slots.startsAt))
    .then((rs) =>
      rs.map((r) => ({
        bookingId: r.bookingId,
        slotId: r.slotId,
        startsAt: r.startsAt.toISOString(),
        endsAt: r.endsAt.toISOString(),
        location: r.location,
        notes: r.notes,
      })),
    );

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">My bookings</h1>
      <p className="mt-2 text-muted-foreground">
        Signed in as{" "}
        <span className="font-medium text-foreground">
          {session.user.email}
        </span>
      </p>
      <div className="mt-8">
        <MyBookingsList rows={rows} />
      </div>
    </section>
  );
}
