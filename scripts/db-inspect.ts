import { db } from "@/lib/db";
import { user, passkey, session, account } from "@/lib/db/schema";
import { bookings } from "@/lib/db/schema";

async function main() {
  const users = await db.select().from(user);
  const passkeys = await db.select().from(passkey);
  const sessions = await db.select().from(session);
  const accounts = await db.select().from(account);
  const bks = await db.select().from(bookings);
  console.log("USERS:", users.length);
  for (const u of users) console.log(" -", u.email, "/", u.name, "/", u.id);
  console.log("PASSKEYS:", passkeys.length);
  for (const p of passkeys)
    console.log(" -", p.name, "/ userId:", p.userId, "/ created:", p.createdAt);
  console.log("SESSIONS:", sessions.length);
  console.log("ACCOUNTS:", accounts.length);
  for (const a of accounts)
    console.log(" -", a.providerId, "/ userId:", a.userId);
  console.log("BOOKINGS:", bks.length);
  for (const b of bks)
    console.log(" - userId:", b.userId, "/ slot:", b.slotId, "/ notes:", b.notes);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
