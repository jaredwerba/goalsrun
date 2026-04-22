import { db } from "../lib/db";
import { slots } from "../lib/db/schema";

type Seed = { startHourET: number; startMinET: number; lenMin: number };

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

const DAYS_AHEAD = 14;

// 9 AM–1 PM window: 5 × 45-min slots (last ends 12:45 ET)
// 4 PM–7 PM window: 4 × 45-min slots (last ends 7:00 ET)
// Same schedule every day — Goals runs mornings and evenings.
const DAILY_SLOTS: Seed[] = [
  { startHourET: 9,  startMinET: 0,  lenMin: 45 },
  { startHourET: 9,  startMinET: 45, lenMin: 45 },
  { startHourET: 10, startMinET: 30, lenMin: 45 },
  { startHourET: 11, startMinET: 15, lenMin: 45 },
  { startHourET: 12, startMinET: 0,  lenMin: 45 },
  { startHourET: 16, startMinET: 0,  lenMin: 45 },
  { startHourET: 16, startMinET: 45, lenMin: 45 },
  { startHourET: 17, startMinET: 30, lenMin: 45 },
  { startHourET: 18, startMinET: 15, lenMin: 45 },
];

async function main() {
  const rows: Array<typeof slots.$inferInsert> = [];
  for (let offset = 1; offset <= DAYS_AHEAD; offset++) {
    for (const s of DAILY_SLOTS) {
      const startsAt = etToUtc(offset, s.startHourET, s.startMinET);
      const endsAt = new Date(startsAt.getTime() + s.lenMin * 60000);
      rows.push({
        startsAt,
        endsAt,
        location: "Sullivans at Castle Island",
        status: "open",
      });
    }
  }

  const inserted = await db.insert(slots).values(rows).returning({ id: slots.id });
  console.log(`Seeded ${inserted.length} slots.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
