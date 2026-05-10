// Slot seeding logic — extracted from scripts/seed-slots.ts so it can
// be called from both the CLI script AND the Vercel cron route.
//
// Idempotent by design: re-running it skips any (startsAt, endsAt) pair
// that already exists. This means the cron can run daily without ever
// double-inserting slots.

import { and, eq, gt, sql } from "drizzle-orm";
import { db } from "./db";
import { slots } from "./db/schema";

type DailySlotConfig = {
  startHourET: number;
  startMinET: number;
  lenMin: number;
};

/**
 * 5:30 AM through 8:30 PM window. Back-to-back 45-min slots starting at
 * 5:30. 20 slots per day. Last one ends at 8:30 PM (within the 9 PM
 * ceiling). Edit this array to change the host's daily availability.
 */
const DAILY_SLOTS: DailySlotConfig[] = [
  { startHourET: 5,  startMinET: 30, lenMin: 45 },
  { startHourET: 6,  startMinET: 15, lenMin: 45 },
  { startHourET: 7,  startMinET: 0,  lenMin: 45 },
  { startHourET: 7,  startMinET: 45, lenMin: 45 },
  { startHourET: 8,  startMinET: 30, lenMin: 45 },
  { startHourET: 9,  startMinET: 15, lenMin: 45 },
  { startHourET: 10, startMinET: 0,  lenMin: 45 },
  { startHourET: 10, startMinET: 45, lenMin: 45 },
  { startHourET: 11, startMinET: 30, lenMin: 45 },
  { startHourET: 12, startMinET: 15, lenMin: 45 },
  { startHourET: 13, startMinET: 0,  lenMin: 45 },
  { startHourET: 13, startMinET: 45, lenMin: 45 },
  { startHourET: 14, startMinET: 30, lenMin: 45 },
  { startHourET: 15, startMinET: 15, lenMin: 45 },
  { startHourET: 16, startMinET: 0,  lenMin: 45 },
  { startHourET: 16, startMinET: 45, lenMin: 45 },
  { startHourET: 17, startMinET: 30, lenMin: 45 },
  { startHourET: 18, startMinET: 15, lenMin: 45 },
  { startHourET: 19, startMinET: 0,  lenMin: 45 },
  { startHourET: 19, startMinET: 45, lenMin: 45 },
];

const DEFAULT_LOCATION = "Sullivans at Castle Island";

/**
 * Convert a target "this Y-M-D at H:M in America/New_York" to the
 * matching UTC Date. Handles DST transparently — we measure the offset
 * by rendering the candidate UTC moment in ET and comparing.
 */
function etToUtc(daysFromNow: number, hourET: number, minuteET = 0): Date {
  const now = new Date();
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(now.getTime() + daysFromNow * 86400000));
  const y = Number(ymd.find((p) => p.type === "year")?.value);
  const m = Number(ymd.find((p) => p.type === "month")?.value);
  const d = Number(ymd.find((p) => p.type === "day")?.value);

  const asUtc = new Date(Date.UTC(y, m - 1, d, hourET, minuteET));
  const etParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(asUtc);
  const etH = Number(etParts.find((p) => p.type === "hour")?.value);
  const etM = Number(etParts.find((p) => p.type === "minute")?.value);
  const offsetMin = (hourET - etH) * 60 + (minuteET - etM);
  return new Date(asUtc.getTime() + offsetMin * 60000);
}

export type SeedResult = {
  inserted: number;
  skipped: number;
  /** Latest slot start date seeded (inclusive) */
  horizon: Date | null;
};

/**
 * Top up the slots table so that slot inventory exists for the next
 * `daysAhead` days. Idempotent — slots that already exist (matched on
 * starts_at) are skipped, not duplicated.
 *
 * Default of 180 days = ~6 months of bookable inventory. The daily
 * Vercel cron calls this with the same value, which means at any
 * moment there's at minimum 6 months of forward inventory.
 */
export async function seedSlots(daysAhead = 180): Promise<SeedResult> {
  // Pre-compute all the (startsAt, endsAt) pairs we want to exist.
  const desired: Array<{ startsAt: Date; endsAt: Date }> = [];
  for (let offset = 1; offset <= daysAhead; offset++) {
    for (const s of DAILY_SLOTS) {
      const startsAt = etToUtc(offset, s.startHourET, s.startMinET);
      const endsAt = new Date(startsAt.getTime() + s.lenMin * 60000);
      desired.push({ startsAt, endsAt });
    }
  }

  if (desired.length === 0) {
    return { inserted: 0, skipped: 0, horizon: null };
  }

  // One round-trip: ask Postgres which of these starts_at we already
  // have. Anything missing is what we insert.
  const startKeys = desired.map((d) => d.startsAt);
  const existingResult = await db.execute<{ starts_at: Date }>(sql`
    SELECT starts_at
    FROM slots
    WHERE starts_at = ANY(${sql.raw(
      "ARRAY[" +
        startKeys.map((d) => `'${d.toISOString()}'::timestamptz`).join(",") +
        "]",
    )})
  `);
  const existing = new Set(
    existingResult.rows.map((r) => new Date(r.starts_at).toISOString()),
  );

  const toInsert = desired
    .filter((d) => !existing.has(d.startsAt.toISOString()))
    .map((d) => ({
      startsAt: d.startsAt,
      endsAt: d.endsAt,
      location: DEFAULT_LOCATION,
      status: "open" as const,
    }));

  if (toInsert.length > 0) {
    // Chunk the insert — Postgres has a parameter cap (~65k), so for
    // big seeds we batch into groups of 500 rows.
    const CHUNK = 500;
    for (let i = 0; i < toInsert.length; i += CHUNK) {
      await db.insert(slots).values(toInsert.slice(i, i + CHUNK));
    }
  }

  const horizon = desired.reduce(
    (latest, d) => (latest && latest > d.startsAt ? latest : d.startsAt),
    desired[0].startsAt,
  );

  return {
    inserted: toInsert.length,
    skipped: desired.length - toInsert.length,
    horizon,
  };
}
