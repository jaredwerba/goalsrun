// CLI seed script: top up the slots table for the next 180 days.
// Run with `npx tsx --env-file=.env.local scripts/seed-slots.ts`.
//
// Daily auto-seeding happens via /api/cron/seed-slots in production
// (Vercel cron). This script is for local dev + manual gap-filling.

import { seedSlots } from "../lib/seed-slots";

const DAYS_AHEAD = Number(process.env.SEED_DAYS_AHEAD ?? "180");

async function main() {
  console.log(`Seeding slots for the next ${DAYS_AHEAD} days...`);
  const result = await seedSlots(DAYS_AHEAD);
  console.log(
    `✓ Inserted ${result.inserted}, skipped ${result.skipped} (already existed)`,
  );
  console.log(`  Horizon: ${result.horizon?.toISOString() ?? "n/a"}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
