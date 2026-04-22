// One-shot: add status column to bookings.
// Existing rows were auto-accepted in the old flow → mark them accepted.
import { db } from "../lib/db";
import { sql } from "drizzle-orm";

async function main() {
  await db.execute(
    sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending'`,
  );
  // All previously-created bookings were already confirmed; backfill to accepted.
  const { rowCount } = await db.execute(
    sql`UPDATE bookings SET status = 'accepted' WHERE status = 'pending'`,
  );
  console.log(`✓ status column ensured, ${rowCount ?? 0} existing rows set to accepted`);
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
