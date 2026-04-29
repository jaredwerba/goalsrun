import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { desc, eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookings, slots, user } from "@/lib/db/schema";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import type {
  AdminBookingRow,
  CancellationRow,
  Analytics,
} from "@/components/admin/admin-dashboard";
import { ADMIN_LOGIN_EMAIL } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — goalslopes.run" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.email !== ADMIN_LOGIN_EMAIL) {
    redirect("/book");
  }

  // -------- Active (non-cancelled) bookings, joined with slot + user --------
  const allActive: AdminBookingRow[] = await db
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
      rs
        .filter((r) => r.status !== "cancelled")
        .map((r) => ({
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

  // -------- Cancellations (audit log) --------
  const cancellations: CancellationRow[] = await db
    .select({
      bookingId: bookings.id,
      runnerName: user.name,
      runnerEmail: user.email,
      startsAt: slots.startsAt,
      endsAt: slots.endsAt,
      location: bookings.location,
      cancelledAt: bookings.cancelledAt,
      cancelledBy: bookings.cancelledBy,
      bookedAt: bookings.createdAt,
    })
    .from(bookings)
    .innerJoin(slots, eq(bookings.slotId, slots.id))
    .innerJoin(user, eq(bookings.userId, user.id))
    .where(eq(bookings.status, "cancelled"))
    .orderBy(desc(bookings.cancelledAt))
    .then((rs) =>
      rs.map((r) => ({
        bookingId: r.bookingId,
        runnerName: r.runnerName,
        runnerEmail: r.runnerEmail,
        startsAt: r.startsAt.toISOString(),
        endsAt: r.endsAt.toISOString(),
        location: r.location,
        cancelledAt: r.cancelledAt?.toISOString() ?? null,
        cancelledBy: (r.cancelledBy ?? "admin") as "user" | "admin",
        bookedAt: r.bookedAt.toISOString(),
      })),
    );

  // -------- Analytics rollups (one query each, group-bys) --------
  type CountsRow = {
    total_pending: string;
    total_accepted: string;
    total_cancelled: string;
    cancelled_by_user: string;
    cancelled_by_admin: string;
    unique_runners: string;
    unique_runners_cancelled: string;
  };
  const countsResult = await db.execute<CountsRow>(sql`
    SELECT
      COUNT(*) FILTER (WHERE status = 'pending')   AS total_pending,
      COUNT(*) FILTER (WHERE status = 'accepted')  AS total_accepted,
      COUNT(*) FILTER (WHERE status = 'cancelled') AS total_cancelled,
      COUNT(*) FILTER (WHERE status = 'cancelled' AND cancelled_by = 'user')  AS cancelled_by_user,
      COUNT(*) FILTER (WHERE status = 'cancelled' AND cancelled_by = 'admin') AS cancelled_by_admin,
      COUNT(DISTINCT user_id)                      AS unique_runners,
      COUNT(DISTINCT user_id) FILTER (WHERE status = 'cancelled') AS unique_runners_cancelled
    FROM bookings
  `);
  const counts = countsResult.rows[0];

  const openSlotsResult = await db.execute<{ open_count: string }>(sql`
    SELECT COUNT(*)::text AS open_count
    FROM slots
    WHERE status = 'open' AND starts_at > NOW()
  `);
  const openSlots = openSlotsResult.rows[0];

  const totalBooked =
    Number(counts?.total_pending ?? 0) + Number(counts?.total_accepted ?? 0);

  const analytics: Analytics = {
    totalBooked,
    totalPending: Number(counts?.total_pending ?? 0),
    totalAccepted: Number(counts?.total_accepted ?? 0),
    totalCancelled: Number(counts?.total_cancelled ?? 0),
    cancelledByUser: Number(counts?.cancelled_by_user ?? 0),
    cancelledByAdmin: Number(counts?.cancelled_by_admin ?? 0),
    uniqueRunners: Number(counts?.unique_runners ?? 0),
    uniqueRunnersWhoCancelled: Number(counts?.unique_runners_cancelled ?? 0),
    openSlotsAhead: Number(openSlots?.open_count ?? 0),
  };

  // -------- Split active rows into pending / upcoming / past for the UI --------
  const now = new Date().toISOString();
  const pending = allActive.filter(
    (r) => r.status === "pending" && r.startsAt > now,
  );
  const upcoming = allActive.filter(
    (r) => r.status === "accepted" && r.startsAt > now,
  );
  const past = allActive
    .filter((r) => r.startsAt <= now)
    .sort(
      (a, b) =>
        new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
    );

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 space-y-10">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Admin
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Dashboard
          {pending.length > 0 && (
            <span className="ml-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-white align-middle">
              {pending.length}
            </span>
          )}
        </h1>
        <p className="text-muted-foreground">
          Signed in as {session.user.email}
        </p>
      </header>

      <AdminDashboard
        analytics={analytics}
        pending={pending}
        upcoming={upcoming}
        past={past}
        cancellations={cancellations}
      />
    </div>
  );
}
