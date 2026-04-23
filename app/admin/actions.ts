"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { ADMIN_LOGIN_EMAIL } from "@/lib/content";
import { acceptBookingById, cancelBookingById } from "@/lib/booking-ops";

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
    const result = await acceptBookingById(bookingId);
    if (result.ok) revalidateAll(bookingId);
    return result;
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed." };
  }
}

export async function adminCancelBooking(
  bookingId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdmin();
    const result = await cancelBookingById(bookingId);
    if (result.ok) revalidateAll(bookingId);
    return result;
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed." };
  }
}
