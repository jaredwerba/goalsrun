import { db } from "../lib/db";
import { slots } from "../lib/db/schema";

type Seed = { startHourET: number; lenMin: number };

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
const WEEKDAY_SLOTS: Seed[] = [
  { startHourET: 6, lenMin: 60 },
  { startHourET: 7, lenMin: 60 },
];
const WEEKEND_SLOTS: Seed[] = [
  { startHourET: 8, lenMin: 60 },
  { startHourET: 9, lenMin: 60 },
  { startHourET: 10, lenMin: 60 },
];

async function main() {
  const rows: Array<typeof slots.$inferInsert> = [];
  for (let offset = 1; offset <= DAYS_AHEAD; offset++) {
    const probe = new Date();
    probe.setDate(probe.getDate() + offset);
    const day = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      weekday: "short",
    }).format(probe);
    const weekend = day === "Sat" || day === "Sun";
    const seeds = weekend ? WEEKEND_SLOTS : WEEKDAY_SLOTS;
    for (const s of seeds) {
      const startsAt = etToUtc(offset, s.startHourET);
      const endsAt = new Date(startsAt.getTime() + s.lenMin * 60000);
      rows.push({
        startsAt,
        endsAt,
        location: "Castle Island, South Boston",
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
