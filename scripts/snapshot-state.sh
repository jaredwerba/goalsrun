#!/usr/bin/env bash
# snapshot-state.sh — capture current project state to a timestamped folder.
# Use this BEFORE risky changes so you can compare/restore later.
#
# Captures:
#   - Current git SHA, tag, and branch
#   - Vercel env var names (not values; values are encrypted)
#   - Vercel current production deployment ID
#   - Database row counts per table (proves DB shape)
#   - .env.local contents (LOCAL ONLY — has secrets, never commit)
#
# Usage: bash scripts/snapshot-state.sh

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$ROOT/.snapshots/$STAMP"
mkdir -p "$OUT"

cd "$ROOT"

echo "📸 Snapshotting to $OUT"

# Git state
echo "→ git"
{
  echo "sha:    $(git rev-parse HEAD)"
  echo "branch: $(git rev-parse --abbrev-ref HEAD)"
  echo "tag:    $(git describe --tags --exact-match 2>/dev/null || echo '<none>')"
  echo "status:"
  git status --short || true
} > "$OUT/git.txt"

# Vercel env var names (production)
echo "→ vercel env"
vercel env ls production > "$OUT/vercel-env.txt" 2>&1 || echo "vercel CLI failed" > "$OUT/vercel-env.txt"

# Current production deployment
echo "→ vercel deploy"
vercel ls --prod 2>&1 | head -10 > "$OUT/vercel-deploy.txt" || true

# Local .env.local — DO NOT COMMIT (.snapshots is gitignored)
echo "→ .env.local"
cp .env.local "$OUT/env.local.backup" 2>/dev/null || echo "no .env.local" > "$OUT/env.local.backup"

# DB row counts (sanity check that data is there)
echo "→ db row counts"
npx tsx --env-file=.env.local -e '
import { db } from "./lib/db";
import { sql } from "drizzle-orm";
(async () => {
  const tables = ["user", "session", "account", "passkey", "verification", "slots", "bookings"];
  for (const t of tables) {
    try {
      const r = await db.execute(sql.raw(`SELECT COUNT(*)::int AS n FROM "${t}"`));
      console.log(`${t.padEnd(15)} ${(r.rows[0] as { n: number }).n}`);
    } catch (e) {
      console.log(`${t.padEnd(15)} <error: ${(e as Error).message}>`);
    }
  }
  process.exit(0);
})();
' > "$OUT/db-counts.txt" 2>&1 || echo "db query failed" >> "$OUT/db-counts.txt"

echo "✅ Snapshot saved: $OUT"
echo ""
echo "To restore code:    git reset --hard $(git rev-parse HEAD)"
echo "To restore .env:    cp $OUT/env.local.backup .env.local"
echo "To inspect DB:      cat $OUT/db-counts.txt"
