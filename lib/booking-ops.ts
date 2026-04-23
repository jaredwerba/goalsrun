// Shared accept/cancel DB operations — used by both admin server actions
// and the email-action route handler (which has no session context).
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookings, slots, user } from "@/lib/db/schema";
import { sendBookingAcceptedEmail } from "@/lib/email";

export async function acceptBookingById(
  bookingId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const [row] = await db
      .select({
        bookingId: bookings.id,
        location: bookings.location,
        notes: bookings.notes,
        status: bookings.status,
        startsAt: slots.startsAt,
        endsAt: slots.endsAt,
        userName: user.name,
        userEmail: user.email,
      })
      .from(bookings)
      .innerJoin(slots, eq(bookings.slotId, slots.id))
      .innerJoin(user, eq(bookings.userId, user.id))
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!row) return { ok: false, error: "Booking not found." };
    if (row.status === "accepted") return { ok: true }; // idempotent

    await db
      .update(bookings)
      .set({ status: "accepted" })
      .where(eq(bookings.id, bookingId));

    try {
      await sendBookingAcceptedEmail({
        bookingId: row.bookingId,
        userName: row.userName,
        userEmail: row.userEmail,
        startsAt: row.startsAt,
        endsAt: row.endsAt,
        location: row.location,
        notes: row.notes,
      });
    } catch (err) {
      console.error("[acceptBookingById] email failed:", err);
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed." };
  }
}

export async function cancelBookingById(
  bookingId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await db.transaction(async (tx) => {
      const [b] = await tx
        .select({ slotId: bookings.slotId })
        .from(bookings)
        .where(eq(bookings.id, bookingId))
        .limit(1);
      if (!b) throw new Error("Booking not found.");
      await tx.delete(bookings).where(eq(bookings.id, bookingId));
      await tx
        .update(slots)
        .set({ status: "open", bookedByUserId: null })
        .where(and(eq(slots.id, b.slotId)));
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed." };
  }
}
