// Daily Vercel cron — keeps the slot calendar perpetually full.
//
// Vercel hits this route on the schedule defined in vercel.json. It runs
// seedSlots(180) which is idempotent: if today's run only adds 20 net
// new slots (1 fresh day at 20 slots/day), that's exactly right. If
// somehow the calendar got behind, it back-fills the gap.
//
// Auth: Vercel attaches `Authorization: Bearer ${CRON_SECRET}` when
// CRON_SECRET is set in env. We verify that match. The route returns
// 401 to any unauthenticated caller — so the URL is safe to leave open.

import { type NextRequest, NextResponse } from "next/server";
import { seedSlots } from "@/lib/seed-slots";

export const dynamic = "force-dynamic";

const DAYS_AHEAD = 180;

export async function GET(req: NextRequest) {
  // Vercel cron auth: header looks like "Authorization: Bearer <secret>"
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await seedSlots(DAYS_AHEAD);
    console.log(
      `[cron/seed-slots] inserted=${result.inserted} skipped=${result.skipped} horizon=${result.horizon?.toISOString()}`,
    );
    return NextResponse.json({
      ok: true,
      inserted: result.inserted,
      skipped: result.skipped,
      horizon: result.horizon?.toISOString() ?? null,
    });
  } catch (err) {
    console.error("[cron/seed-slots] failed:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
