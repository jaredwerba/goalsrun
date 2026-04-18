"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { slots, bookings } from "@/lib/db/schema";

async function requireUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("You must be signed in.");
  return session.user.id;
}

export async function bookSlot(
  slotId: string,
  notes?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const userId = await requireUserId();

    await db.transaction(async (tx) => {
      const locked = await tx
        .select({ id: slots.id, status: slots.status })
        .from(slots)
        .where(eq(slots.id, slotId))
        .for("update");
      const row = locked[0];
      if (!row) throw new Error("Slot not found.");
      if (row.status !== "open") throw new Error("Slot already booked.");

      await tx.insert(bookings).values({ slotId, userId, notes: notes || null });
      await tx
        .update(slots)
        .set({ status: "booked", bookedByUserId: userId })
        .where(eq(slots.id, slotId));
    });

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
