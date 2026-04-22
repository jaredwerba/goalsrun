import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookings, slots, user } from "@/lib/db/schema";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import type { AdminBookingRow } from "@/components/admin/admin-dashboard";
import { ADMIN_LOGIN_EMAIL } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — goalslopes.run" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });
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
      location: bookings.location,
      notes: bookings.notes,
      status: bookings.status,
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
        status: r.status as "pending" | "accepted",
        bookedAt: r.bookedAt.toISOString(),
      })),
    );

  const now = new Date().toISOString();
  const pending = rows.filter((r) => r.status === "pending" && r.startsAt > now);
  const upcoming = rows.filter((r) => r.status === "accepted" && r.startsAt > now);
  const past = rows.filter((r) => r.startsAt <= now).sort(
    (a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
  );

  const totalPending = pending.length;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 space-y-10">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Admin
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Dashboard
          {totalPending > 0 && (
            <span className="ml-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-white align-middle">
              {totalPending}
            </span>
          )}
        </h1>
        <p className="text-muted-foreground">
          {pending.length} pending · {upcoming.length} upcoming · {past.length} past
        </p>
      </header>

      <AdminDashboard pending={pending} upcoming={upcoming} past={past} />
    </div>
  );
}
