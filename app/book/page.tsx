import { headers } from "next/headers";
import { and, eq, gt, asc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { slots } from "@/lib/db/schema";
import { SlotCalendar } from "@/components/schedule/slot-calendar";
import { SignupGate } from "@/components/schedule/signup-gate";
import { RecoveryBanner } from "@/components/schedule/recovery-banner";
import { Badge } from "@/components/ui/badge";
import {
  BOOKING_LOCATION,
  RUNNER_FIRST_NAME,
  RUNNER_NAME,
  SESSION_TYPES,
} from "@/lib/content";
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

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const isSignedIn = !!session?.user;
  const openSlots = isSignedIn ? await getOpenSlots() : [];
  const params = await searchParams;
  const recoveryMode =
    params.error === "magic"
      ? ("error" as const)
      : params.recovered === "1" && isSignedIn
        ? ("recovered" as const)
        : null;

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
          1:1 coaching sessions at Castle Island in South Boston. Elite
          marathoner. Real mechanics, real intervals, real feedback — on the
          move.
        </p>
      </header>

      <dl className="grid sm:grid-cols-2 gap-x-10 gap-y-8">
        <div>
          <dt className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Where
          </dt>
          <dd className="mt-2 text-lg font-medium">Castle Island</dd>
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
            Cost
          </dt>
          <dd className="mt-2 text-lg font-medium">First run free</dd>
          <dd className="text-sm text-muted-foreground">
            No card required. Show up and run.
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

      <section>
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-3xl font-semibold tracking-tight">
            {isSignedIn ? "Pick a slot" : "See the schedule"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isSignedIn ? "Boston time" : "No passwords · ten seconds"}
          </p>
        </div>
        <div className="mt-8">
          {isSignedIn ? (
            <SlotCalendar openSlots={openSlots} />
          ) : (
            <SignupGate />
          )}
        </div>
      </section>
    </div>
  );
}
