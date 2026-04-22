import { headers } from "next/headers";
import { and, asc, desc, eq, gt, lt } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { slots, bookings } from "@/lib/db/schema";
import { SlotCalendar } from "@/components/schedule/slot-calendar";
import { SignupGate } from "@/components/schedule/signup-gate";
import { RecoveryBanner } from "@/components/schedule/recovery-banner";
import { UserPanel } from "@/components/schedule/user-panel";
import { Badge } from "@/components/ui/badge";
import {
  BOOKING_LOCATION,
  RUNNER_FIRST_NAME,
  RUNNER_NAME,
  SESSION_TYPES,
} from "@/lib/content";
import type { BookingRow } from "@/components/schedule/my-bookings-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a run with Goals",
  description: `Coached 1:1 sessions with ${RUNNER_NAME} at ${BOOKING_LOCATION}. First run free.`,
};

export const dynamic = "force-dynamic";

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
      .where(and(eq(bookings.userId, userId), gt(slots.startsAt, now)))
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
      .where(and(eq(bookings.userId, userId), lt(slots.startsAt, now)))
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

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const isSignedIn = !!session?.user;
  const params = await searchParams;

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
          <dd className="mt-2 text-lg font-medium">9 AM–1 PM · 4 PM–7 PM</dd>
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
