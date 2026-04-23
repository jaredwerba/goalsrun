import { type NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/admin-tokens";
import { acceptBookingById, cancelBookingById } from "@/lib/booking-ops";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

function html(title: string, heading: string, body: string, color: string) {
  return new NextResponse(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${title}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#fafafa;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px}
    .card{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:40px 48px;max-width:480px;width:100%;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.06)}
    .icon{font-size:48px;margin-bottom:20px}
    h1{font-size:22px;font-weight:700;color:#111;margin-bottom:10px}
    p{color:#6b7280;font-size:15px;line-height:1.6}
    a{display:inline-block;margin-top:24px;padding:10px 22px;background:#111;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600}
    .accent{color:${color}}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${color === "#16a34a" ? "✓" : color === "#dc2626" ? "✕" : "⚠"}</div>
    <h1 class="accent">${heading}</h1>
    <p>${body}</p>
    <a href="/admin">Go to dashboard</a>
  </div>
</body>
</html>`,
    {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    },
  );
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";

  const verified = verifyAdminToken(token);
  if (!verified.ok) {
    return html(
      "Link error",
      "Link invalid or expired",
      verified.reason,
      "#f59e0b",
    );
  }

  const { bookingId, action } = verified;

  if (action === "accept") {
    const result = await acceptBookingById(bookingId);
    if (!result.ok) {
      return html("Error", "Could not accept", result.error, "#dc2626");
    }
    revalidatePath("/admin");
    revalidatePath("/book");
    revalidatePath("/bookings");
    revalidatePath("/booking/" + bookingId);
    return html(
      "Run accepted",
      "Run accepted",
      "The booking has been confirmed and the runner will receive a calendar invite.",
      "#16a34a",
    );
  }

  // action === "cancel"
  const result = await cancelBookingById(bookingId);
  if (!result.ok) {
    return html("Error", "Could not cancel", result.error, "#dc2626");
  }
  revalidatePath("/admin");
  revalidatePath("/book");
  revalidatePath("/bookings");
  revalidatePath("/booking/" + bookingId);
  return html(
    "Request cancelled",
    "Request cancelled",
    "The booking has been removed and the slot is open again.",
    "#dc2626",
  );
}
