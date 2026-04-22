import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookings, slots, user } from "@/lib/db/schema";
import { RunnersTable } from "@/components/admin/runners-table";
import type { AdminBookingRow } from "@/components/admin/runners-table";
import { ADMIN_LOGIN_EMAIL } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — goalslopes.run" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  // Gate: must be signed in as the admin account.
  if (!session?.user || session.user.email !== ADMIN_LOGIN_EMAIL) {
    redirect("/book");
  }

  const rows: AdminBookingRow[] = await db
    .select({
      bookingId: bookings.id,
      runnerName: user.name,
      runnerEmail: user.email,
      startsAt: slots.startsAt,
      endsAt: slots.endsAt,
      location: slots.location,
      notes: bookings.notes,
      bookedAt: bookings.createdAt,
    })
    .from(bookings)
    .innerJoin(slots, eq(bookings.slotId, slots.id))
    .innerJoin(user, eq(bookings.userId, user.id))
    .orderBy(desc(slots.startsAt))
    .then((rs) =>
      rs.map((r) => ({
        bookingId: r.bookingId,
        runnerName: r.runnerName,
        runnerEmail: r.runnerEmail,
        startsAt: r.startsAt.toISOString(),
        endsAt: r.endsAt.toISOString(),
        location: r.location,
        notes: r.notes,
        bookedAt: r.bookedAt.toISOString(),
      })),
    );

  const upcoming = rows.filter((r) => new Date(r.startsAt) >= new Date());
  const past = rows.filter((r) => new Date(r.startsAt) < new Date());

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 space-y-12">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Admin
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">Runners</h1>
        <p className="text-muted-foreground">
          {upcoming.length} upcoming · {past.length} past
        </p>
      </header>

      {upcoming.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Upcoming
          </h2>
          <RunnersTable rows={upcoming} />
        </section>
      )}

      {past.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Past
          </h2>
          <RunnersTable rows={past} />
        </section>
      )}

      {rows.length === 0 && (
        <p className="text-muted-foreground">No bookings yet.</p>
      )}
    </div>
  );
}
