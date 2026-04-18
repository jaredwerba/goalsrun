"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { slots, bookings } from "@/lib/db/schema";
import { sendBookingEmails } from "@/lib/email";

async function requireUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("You must be signed in.");
  return session.user.id;
}

type SlotInfo = {
  startsAt: Date;
  endsAt: Date;
  location: string;
};

export async function bookSlot(
  slotId: string,
  notes?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) throw new Error("You must be signed in.");
    const userId = session.user.id;
    const userName = session.user.name || session.user.email || "Runner";
    const userEmail = session.user.email;

    const { bookingId, slotInfo } = await db.transaction(async (tx) => {
      const locked = await tx
        .select({
          id: slots.id,
          status: slots.status,
          startsAt: slots.startsAt,
          endsAt: slots.endsAt,
          location: slots.location,
        })
        .from(slots)
        .where(eq(slots.id, slotId))
        .for("update");
      const row = locked[0];
      if (!row) throw new Error("Slot not found.");
      if (row.status !== "open") throw new Error("Slot already booked.");

      const [inserted] = await tx
        .insert(bookings)
        .values({ slotId, userId, notes: notes || null })
        .returning({ id: bookings.id });
      await tx
        .update(slots)
        .set({ status: "booked", bookedByUserId: userId })
        .where(eq(slots.id, slotId));

      const info: SlotInfo = {
        startsAt: row.startsAt,
        endsAt: row.endsAt,
        location: row.location,
      };
      return { bookingId: inserted.id, slotInfo: info };
    });

    if (userEmail) {
      try {
        await sendBookingEmails({
          bookingId,
          userName,
          userEmail,
          startsAt: slotInfo.startsAt,
          endsAt: slotInfo.endsAt,
          location: slotInfo.location,
          notes: notes || null,
        });
      } catch (err) {
        console.error("[bookSlot] email dispatch failed:", err);
      }
    }

    revalidatePath("/book");
    revalidatePath("/bookings");
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Booking failed.";
    return { ok: false, error: msg };
  }
}

export async function cancelBooking(
  bookingId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const userId = await requireUserId();

    await db.transaction(async (tx) => {
      const [b] = await tx
        .select()
        .from(bookings)
        .where(and(eq(bookings.id, bookingId), eq(bookings.userId, userId)))
        .limit(1);
      if (!b) throw new Error("Booking not found.");
      await tx.delete(bookings).where(eq(bookings.id, bookingId));
      await tx
        .update(slots)
        .set({ status: "open", bookedByUserId: null })
        .where(eq(slots.id, b.slotId));
    });

    revalidatePath("/book");
    revalidatePath("/bookings");
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Cancel failed.";
    return { ok: false, error: msg };
  }
}
