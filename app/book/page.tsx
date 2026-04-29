import { headers } from "next/headers";
import { and, asc, desc, eq, gt, lt, ne, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { slots, bookings, user } from "@/lib/db/schema";
import { SlotCalendar } from "@/components/schedule/slot-calendar";
import { SignupGate } from "@/components/schedule/signup-gate";
import { RecoveryBanner } from "@/components/schedule/recovery-banner";
import { UserPanel } from "@/components/schedule/user-panel";
import {
  AdminDashboard,
  type AdminAnalytics,
} from "@/components/admin/admin-dashboard";
import type {
  AdminBookingRow,
  CancellationRow,
  RunnerRosterRow,
} from "@/components/admin/admin-shared";
import { Badge } from "@/components/ui/badge";
import {
  BOOKING_LOCATION,
  RUNNER_FIRST_NAME,
  RUNNER_NAME,
  SESSION_TYPES,
  isAdminEmail,
} from "@/lib/content";
import type { BookingRow } from "@/components/schedule/my-bookings-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a run with Goals",
  description: `Coached 1:1 sessions with ${RUNNER_NAME} at ${BOOKING_LOCATION}. First run free.`,
};

export const dynamic = "force-dynamic";

// ─── User-side queries (slot picker + their own bookings) ──────────────────

async function getOpenSlots() {
  try {
    return await db
      .select()
      .from(slots)
      .where(and(eq(slots.status, "open"), gt(slots.startsAt, new Date())))
      .orderBy(asc(slots.startsAt));
  } catch {
    return [];
  }
}

async function getUserBookings(userId: string) {
  const now = new Date();
  const [upcoming, past] = await Promise.all([
    db
      .select({
        bookingId: bookings.id,
        slotId: slots.id,
        startsAt: slots.startsAt,
        endsAt: slots.endsAt,
        location: bookings.location,
        notes: bookings.notes,
        status: bookings.status,
      })
      .from(bookings)
      .innerJoin(slots, eq(bookings.slotId, slots.id))
      .where(and(
        eq(bookings.userId, userId),
        gt(slots.startsAt, now),
        ne(bookings.status, "cancelled"),
      ))
      .orderBy(asc(slots.startsAt)),
    db
      .select({
        bookingId: bookings.id,
        slotId: slots.id,
        startsAt: slots.startsAt,
        endsAt: slots.endsAt,
        location: bookings.location,
        notes: bookings.notes,
        status: bookings.status,
      })
      .from(bookings)
      .innerJoin(slots, eq(bookings.slotId, slots.id))
      .where(and(
        eq(bookings.userId, userId),
        lt(slots.startsAt, now),
        ne(bookings.status, "cancelled"),
      ))
      .orderBy(desc(slots.startsAt))
      .limit(10),
  ]);

  const toRow = (r: typeof upcoming[0]): BookingRow => ({
    bookingId: r.bookingId,
    slotId: r.slotId,
    startsAt: r.startsAt.toISOString(),
    endsAt: r.endsAt.toISOString(),
    location: r.location,
    notes: r.notes,
    status: (r.status ?? "pending") as "pending" | "accepted",
  });

  return {
    upcomingRuns: upcoming.map(toRow),
    pastRuns: past.map(toRow),
  };
}

// ─── Admin-side queries (analytics, cancellations, roster, all bookings) ────

async function getAdminData() {
  // Active bookings (pending + accepted), joined with slot + user
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

  // Cancellations (audit log)
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

  // Counts rollup (one query)
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

  const analytics: AdminAnalytics = {
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

  // Per-runner roster
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

  // Split active rows for operational sections
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

  return { analytics, pending, upcoming, past, cancellations, roster };
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const isSignedIn = !!session?.user;
  const isAdmin = isSignedIn && isAdminEmail(session.user.email);
  const params = await searchParams;

  // ─── Admin: render the dashboard, skip everything else ────────────────
  if (isAdmin) {
    const { analytics, pending, upcoming, past, cancellations, roster } =
      await getAdminData();

    return (
      <div className="mx-auto max-w-5xl px-6 py-16 space-y-10">
        <header className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-500">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Admin
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            {RUNNER_FIRST_NAME}&apos;s dashboard
            {pending.length > 0 && (
              <span className="ml-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-white align-middle animate-pulse">
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
          roster={roster}
        />
      </div>
    );
  }

  // ─── Signed-out / regular user from here on ───────────────────────────
  // better-auth's magic-link plugin redirects to errorCallbackURL with
  // ?error=<CODE> on any failure — treat any truthy ?error= as the signal.
  const recoveryMode =
    typeof params.error === "string" && params.error.length > 0
      ? ("error" as const)
      : params.recovered === "1" && isSignedIn
        ? ("recovered" as const)
        : null;

  const openSlots = isSignedIn ? await getOpenSlots() : [];
  const { upcomingRuns, pastRuns } = isSignedIn
    ? await getUserBookings(session.user.id)
    : { upcomingRuns: [], pastRuns: [] };

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 space-y-16">
      {recoveryMode && <RecoveryBanner mode={recoveryMode} />}

      <header className="space-y-5">
        <Badge variant="secondary" className="w-fit">
          First run is free
        </Badge>
        <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight leading-[1.05]">
          Run with {RUNNER_FIRST_NAME}.
        </h1>
        <p className="text-lg text-muted-foreground max-w-prose">
          1:1 coaching sessions at Sullivans, Castle Island, South Boston. Elite
          marathoner. Real mechanics, real intervals, real feedback — on the
          move.
        </p>
      </header>

      <dl className="grid sm:grid-cols-2 gap-x-10 gap-y-8">
        <div>
          <dt className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Where
          </dt>
          <dd className="mt-2 text-lg font-medium">Sullivans at Castle Island</dd>
          <dd className="text-sm text-muted-foreground">South Boston, MA</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Who
          </dt>
          <dd className="mt-2 text-lg font-medium">Masters marathoner</dd>
          <dd className="text-sm text-muted-foreground">
            2:42 at Boston 2026. Sub‑2:50 across Berlin &amp; Chicago.
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Why
          </dt>
          <dd className="mt-2 text-lg font-medium">
            Running coach &amp; mechanics
          </dd>
          <dd className="text-sm text-muted-foreground">
            Fix form, dial pace, train smarter.
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            When
          </dt>
          <dd className="mt-2 text-lg font-medium">5:30 AM–9 PM</dd>
          <dd className="text-sm text-muted-foreground">
            45-minute sessions. First run free.
          </dd>
        </div>
      </dl>

      <section>
        <h2 className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          What we run
        </h2>
        <ul className="mt-4 divide-y border-y">
          {SESSION_TYPES.map((s) => (
            <li key={s.name} className="py-4">
              <p className="font-medium">{s.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      {isSignedIn ? (
        <>
          <section>
            <UserPanel
              userName={session.user.name || session.user.email || "Runner"}
              userEmail={session.user.email || ""}
              upcomingRuns={upcomingRuns}
              pastRuns={pastRuns}
            />
          </section>

          <section>
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-3xl font-semibold tracking-tight">
                Pick a slot
              </h2>
              <p className="text-sm text-muted-foreground">Boston time</p>
            </div>
            <div className="mt-8">
              <SlotCalendar openSlots={openSlots} />
            </div>
          </section>
        </>
      ) : (
        <section>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-3xl font-semibold tracking-tight">
              See the schedule
            </h2>
            <p className="text-sm text-muted-foreground">
              No passwords · ten seconds
            </p>
          </div>
          <div className="mt-8">
            <SignupGate />
          </div>
        </section>
      )}
    </div>
  );
}
