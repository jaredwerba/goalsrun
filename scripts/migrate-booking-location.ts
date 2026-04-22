// One-shot: add location column to bookings + wipe open future slots so we
// can reseed with the correct 45-min schedule.
import { db } from "../lib/db";
import { slots } from "../lib/db/schema";
import { and, eq, gt } from "drizzle-orm";
import { sql } from "drizzle-orm";

async function main() {
  // 1. Add location column (idempotent — fails silently if already exists)
  try {
    await db.execute(
      sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS location text NOT NULL DEFAULT 'Sullivans at Castle Island'`,
    );
    console.log("✓ bookings.location column ensured");
  } catch (err) {
    console.error("Column migration error:", err);
    process.exit(1);
  }

  // 2. Wipe all open future slots so old times are gone
  const deleted = await db
    .delete(slots)
    .where(and(eq(slots.status, "open"), gt(slots.startsAt, new Date())))
    .returning({ id: slots.id });
  console.log(`✓ Deleted ${deleted.length} old open future slots`);

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
