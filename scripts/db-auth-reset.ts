/**
 * One-off cleanup for the goalsrun → goalslopes.run domain migration.
 *
 * After the rpID switch, all existing passkeys are dead and users with no
 * known password are locked out. This script:
 *
 *   1. Deletes the 3 `test-*@example.invalid` users created during curl-based
 *      diagnostics (cascades their accounts / sessions / bookings).
 *   2. Deletes every row in the `passkey` table (all were bound to the old
 *      rpID `goalsrun.vercel.app`).
 *   3. Deletes every row in the `session` table (any cookies out in the wild
 *      are tied to the old passkeys anyway).
 *   4. Resets the password for the two real users (`werba@protonmail.com`,
 *      `jwerba@gmail.com`) to a known value printed at the end.
 *
 * Run once, after deploying the new SignupGate that accepts typed passwords:
 *
 *     npx tsx scripts/db-auth-reset.ts
 *
 * IMPORTANT: this is destructive. Do not rerun in production after real
 * users sign up — it will wipe their passkeys and reset their passwords.
 */

import { and, eq, inArray, like } from "drizzle-orm";
import { randomBytes } from "node:crypto";
// Uses the EXACT scrypt params better-auth does (N=16384, r=16, p=1, dkLen=64,
// NFKC-normalized password, hex-encoded salt). Same module better-auth loads
// via the "node" export condition.
import { hashPassword } from "@better-auth/utils/password";
import { db } from "@/lib/db";
import { account, passkey, session, user } from "@/lib/db/schema";

const REAL_USER_EMAILS = ["werba@protonmail.com", "jwerba@gmail.com"];
const TEST_USER_EMAIL_PATTERN = "test-%@example.invalid";

function randomReadablePassword(): string {
  // 16 random hex chars = 64 bits of entropy. Short enough to type, long enough
  // to stay out of any dictionary.
  return randomBytes(8).toString("hex");
}

async function main() {
  console.log("Starting auth reset…\n");

  // 1. Delete test users. Cascades to their account/session/bookings rows.
  const testUsers = await db
    .delete(user)
    .where(like(user.email, TEST_USER_EMAIL_PATTERN))
    .returning({ email: user.email });
  console.log(`Deleted ${testUsers.length} test user(s):`);
  for (const u of testUsers) console.log("  -", u.email);

  // 2. Delete all passkeys (all bound to the old rpID).
  const killedPasskeys = await db
    .delete(passkey)
    .returning({ name: passkey.name });
  console.log(`\nDeleted ${killedPasskeys.length} dead passkey(s).`);

  // 3. Delete all sessions.
  const killedSessions = await db.delete(session).returning({ id: session.id });
  console.log(`Deleted ${killedSessions.length} session(s).`);

  // 4. Reset passwords for the 2 real users.
  const reals = await db
    .select()
    .from(user)
    .where(inArray(user.email, REAL_USER_EMAILS));

  console.log(`\nResetting passwords for ${reals.length} real user(s):`);
  const newCreds: { email: string; password: string }[] = [];
  for (const u of reals) {
    const plain = randomReadablePassword();
    const hashed = await hashPassword(plain);
    // Only touch the `credential` provider rows (email/password) — not OAuth.
    const updated = await db
      .update(account)
      .set({ password: hashed, updatedAt: new Date() })
      .where(
        and(
          eq(account.userId, u.id),
          eq(account.providerId, "credential"),
        ),
      )
      .returning({ providerId: account.providerId });
    if (updated.length === 0) {
      console.log(`  ! no credential account for ${u.email} — skipped`);
      continue;
    }
    newCreds.push({ email: u.email, password: plain });
  }

  console.log("\n" + "=".repeat(60));
  console.log("NEW CREDENTIALS — save these somewhere, then delete this log:");
  console.log("=".repeat(60));
  for (const c of newCreds) {
    console.log(`  ${c.email}  ->  ${c.password}`);
  }
  console.log("=".repeat(60));
  console.log(
    "\nSign in once at https://goalslopes.run/book using email + password,",
  );
  console.log("then register a fresh passkey from the post-signin state.");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
