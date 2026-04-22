/**
 * One-off: delete the two pre-passkey-only user rows so the new passkey-only
 * signup flow can start them fresh. Cascades to account / session / passkey /
 * booking rows. Slots survive (bookedByUserId set null on FK).
 *
 * Safe to run once after the passkey-only switch. Do not rerun — it will
 * wipe whichever user rows currently match these emails.
 */

import { inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";

const EMAILS = ["werba@protonmail.com", "jwerba@gmail.com"];

async function main() {
  const deleted = await db
    .delete(user)
    .where(inArray(user.email, EMAILS))
    .returning({ email: user.email });
  console.log(`Deleted ${deleted.length} user row(s):`);
  for (const u of deleted) console.log("  -", u.email);
  console.log(
    "\nAll cascades applied (accounts, sessions, passkeys, bookings).",
  );
  console.log(
    "Slot rows untouched (bookedByUserId set to null by FK).",
  );
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
