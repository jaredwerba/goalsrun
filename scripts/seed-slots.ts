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

// 5:30 AM through 9 PM window. Back-to-back 45-min slots starting at 5:30,
// 20 slots per day, last one ends at 8:30 PM (well within the 9 PM ceiling —
// the next 45-min slot would push past 9 PM, so we stop at 19:45→20:30).
// Goals can edit this array if he wants fewer/different windows.
const DAILY_SLOTS: Seed[] = [
  { startHourET: 5,  startMinET: 30, lenMin: 45 }, // 5:30 → 6:15
  { startHourET: 6,  startMinET: 15, lenMin: 45 }, // 6:15 → 7:00
  { startHourET: 7,  startMinET: 0,  lenMin: 45 }, // 7:00 → 7:45
  { startHourET: 7,  startMinET: 45, lenMin: 45 }, // 7:45 → 8:30
  { startHourET: 8,  startMinET: 30, lenMin: 45 }, // 8:30 → 9:15
  { startHourET: 9,  startMinET: 15, lenMin: 45 }, // 9:15 → 10:00
  { startHourET: 10, startMinET: 0,  lenMin: 45 }, // 10:00 → 10:45
  { startHourET: 10, startMinET: 45, lenMin: 45 }, // 10:45 → 11:30
  { startHourET: 11, startMinET: 30, lenMin: 45 }, // 11:30 → 12:15
  { startHourET: 12, startMinET: 15, lenMin: 45 }, // 12:15 → 13:00
  { startHourET: 13, startMinET: 0,  lenMin: 45 }, // 13:00 → 13:45
  { startHourET: 13, startMinET: 45, lenMin: 45 }, // 13:45 → 14:30
  { startHourET: 14, startMinET: 30, lenMin: 45 }, // 14:30 → 15:15
  { startHourET: 15, startMinET: 15, lenMin: 45 }, // 15:15 → 16:00
  { startHourET: 16, startMinET: 0,  lenMin: 45 }, // 16:00 → 16:45
  { startHourET: 16, startMinET: 45, lenMin: 45 }, // 16:45 → 17:30
  { startHourET: 17, startMinET: 30, lenMin: 45 }, // 17:30 → 18:15
  { startHourET: 18, startMinET: 15, lenMin: 45 }, // 18:15 → 19:00
  { startHourET: 19, startMinET: 0,  lenMin: 45 }, // 19:00 → 19:45
  { startHourET: 19, startMinET: 45, lenMin: 45 }, // 19:45 → 20:30
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
