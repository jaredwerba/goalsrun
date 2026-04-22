"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookings, slots, user } from "@/lib/db/schema";
import { sendBookingAcceptedEmail } from "@/lib/email";
import { ADMIN_LOGIN_EMAIL } from "@/lib/content";

async function requireAdmin(): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.email !== ADMIN_LOGIN_EMAIL) {
    throw new Error("Unauthorized.");
  }
}

function revalidateAll(bookingId: string) {
  revalidatePath("/admin");
  revalidatePath("/book");
  revalidatePath("/bookings");
  revalidatePath("/booking/" + bookingId);
}

export async function acceptBooking(
  bookingId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdmin();

    // Fetch booking + slot + user in one shot
    const [row] = await db
      .select({
        bookingId: bookings.id,
        slotId: bookings.slotId,
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

    if (!row) throw new Error("Booking not found.");
    if (row.status === "accepted") throw new Error("Already accepted.");

    await db
      .update(bookings)
      .set({ status: "accepted" })
      .where(eq(bookings.id, bookingId));

    // Send confirmation email with .ics to the runner
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
      console.error("[acceptBooking] email failed:", err);
    }

    revalidateAll(bookingId);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed." };
  }
}

export async function adminCancelBooking(
  bookingId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdmin();

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

    revalidateAll(bookingId);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed." };
  }
}
