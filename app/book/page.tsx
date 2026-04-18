import { and, eq, gt, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { slots } from "@/lib/db/schema";
import { SlotGrid } from "@/components/schedule/slot-grid";
import { BOOKING_BLURB, BOOKING_LOCATION, RUNNER_NAME } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a run",
  description: `Join ${RUNNER_NAME} for a loop around ${BOOKING_LOCATION}.`,
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

export default async function BookPage() {
  const openSlots = await getOpenSlots();
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">
        Book a Castle Island run
      </h1>
      <p className="mt-4 text-lg text-muted-foreground max-w-prose">
        {BOOKING_BLURB}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Sign-in is passkey‑based — no passwords. Times shown in Boston (ET).
      </p>
      <div className="mt-10">
        <SlotGrid openSlots={openSlots} />
      </div>
    </section>
  );
}
