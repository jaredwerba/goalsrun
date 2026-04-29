import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { desc, eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookings, slots, user } from "@/lib/db/schema";
import { OperatorDashboard } from "@/components/admin/operator-dashboard";
import { OwnerDashboard } from "@/components/admin/owner-dashboard";
import type {
  AdminBookingRow,
  CancellationRow,
  RunnerRosterRow,
} from "@/components/admin/admin-shared";
import type { OwnerAnalytics } from "@/components/admin/owner-dashboard";
import { adminViewFor, RUNNER_FIRST_NAME } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — goalslopes.run" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const view = adminViewFor(session?.user?.email);
  if (!session?.user || view === "none") {
    redirect("/book");
  }

  // Bigger queries are run for both views — Postgres handles the volume
  // fine, and it keeps this page-level branching simple. The two
  // components consume different subsets of the same data.

  // ─── Active bookings (pending + accepted) ───────────────────────────
  const activeRows: AdminBookingRow[] = await db
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

  // ─── Cancellations (audit log) ──────────────────────────────────────
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

  // ─── Split active rows into pending / upcoming / past ───────────────
  const now = new Date().toISOString();
  const pending = activeRows.filter(
    (r) => r.status === "pending" && r.startsAt > now,
  );
  const upcoming = activeRows.filter(
    (r) => r.status === "accepted" && r.startsAt > now,
  );
  const past = activeRows
    .filter((r) => r.startsAt <= now)
    .sort(
      (a, b) =>
        new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
    );

  // ─── Goals (operator) — render lean dashboard and stop here ─────────
  if (view === "operator") {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16 space-y-10">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Coach view
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            {RUNNER_FIRST_NAME}&apos;s schedule
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

        <OperatorDashboard
          pending={pending}
          upcoming={upcoming}
          past={past}
          cancellations={cancellations}
        />
      </div>
    );
  }

  // ─── Werba (owner) — fetch analytics + roster, render business view ─
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

  const totalPending = Number(counts?.total_pending ?? 0);
  const totalAccepted = Number(counts?.total_accepted ?? 0);
  const totalCancelled = Number(counts?.total_cancelled ?? 0);

  const analytics: OwnerAnalytics = {
    totalBooked: totalPending + totalAccepted,
    totalConfirmed: totalAccepted,
    totalPending,
    totalCancelled,
    cancelledByUser: Number(counts?.cancelled_by_user ?? 0),
    cancelledByAdmin: Number(counts?.cancelled_by_admin ?? 0),
    uniqueRunners: Number(counts?.unique_runners ?? 0),
    uniqueRunnersWhoCancelled: Number(counts?.unique_runners_cancelled ?? 0),
    openSlotsAhead: Number(openSlots?.open_count ?? 0),
  };

  // Per-runner roster: counts grouped by user
  type RosterRowSql = {
    user_id: string;
    name: string;
    email: string;
    active_runs: string;
    confirmed_runs: string;
    cancelled_runs: string;
    first_booking_at: Date | null;
    last_booking_at: Date | null;
  };
  const rosterResult = await db.execute<RosterRowSql>(sql`
    SELECT
      u.id   AS user_id,
      u.name AS name,
      u.email AS email,
      COUNT(*) FILTER (WHERE b.status IN ('pending', 'accepted')) AS active_runs,
      COUNT(*) FILTER (WHERE b.status = 'accepted')               AS confirmed_runs,
      COUNT(*) FILTER (WHERE b.status = 'cancelled')              AS cancelled_runs,
      MIN(s.starts_at) AS first_booking_at,
      MAX(s.starts_at) AS last_booking_at
    FROM bookings b
    INNER JOIN "user" u ON b.user_id = u.id
    INNER JOIN slots s ON b.slot_id = s.id
    GROUP BY u.id, u.name, u.email
    ORDER BY active_runs DESC, last_booking_at DESC NULLS LAST
  `);

  const roster: RunnerRosterRow[] = rosterResult.rows.map((r) => ({
    userId: r.user_id,
    name: r.name,
    email: r.email,
    activeRuns: Number(r.active_runs),
    confirmedRuns: Number(r.confirmed_runs),
    cancelledRuns: Number(r.cancelled_runs),
    firstBookingAt: r.first_booking_at
      ? new Date(r.first_booking_at).toISOString()
      : null,
    lastBookingAt: r.last_booking_at
      ? new Date(r.last_booking_at).toISOString()
      : null,
  }));

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 space-y-10">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Owner view
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Business dashboard
        </h1>
        <p className="text-muted-foreground">
          Signed in as {session.user.email}
        </p>
      </header>

      <OwnerDashboard analytics={analytics} roster={roster} />
    </div>
  );
}
