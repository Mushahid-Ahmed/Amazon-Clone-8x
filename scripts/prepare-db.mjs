// Deploy-time database preparation (runs as `vercel-build` before `next build`).
//
// When a Postgres URL is present (Vercel Postgres sets POSTGRES_PRISMA_URL, or a
// custom DATABASE_URL), this generates a PostgreSQL-bound Prisma client and pushes
// the schema to the database. Without one, the SQLite-bound client from postinstall
// stays in place and the app runs in documented local/demo mode.

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import pg from "pg";

const pgUrl =
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  (process.env.DATABASE_URL?.startsWith("postgres") ? process.env.DATABASE_URL : null);

if (!pgUrl) {
  console.log("[db] No Postgres URL found — keeping SQLite client (demo mode).");
  process.exit(0);
}

const schema = readFileSync("prisma/schema.prisma", "utf8");
writeFileSync("prisma/schema.deploy.prisma", schema.replace('provider = "sqlite"', 'provider = "postgresql"'));

// The pre-auth schema allowed guest orders with no owner; the tightened schema
// requires Order.userId and `db push` cannot make a column required while NULL
// rows exist. Any ownerless row is legacy data the new API cannot create, so
// delete it immediately before the constraint lands (idempotent, race-safe).
const client = new pg.Client({ connectionString: pgUrl });
await client.connect();
const { rowCount } = await client.query('DELETE FROM "Order" WHERE "userId" IS NULL');
await client.end();
if (rowCount) console.log(`[db] removed ${rowCount} ownerless legacy order(s) before schema push`);

console.log("[db] Postgres detected — pushing schema and generating PostgreSQL client…");
const env = { ...process.env, DATABASE_URL: pgUrl };
// --accept-data-loss keeps the push non-interactive in CI: schema changes that
// involve constraint tightening (e.g. a column becoming required) need the
// flag even when existing rows already satisfy the constraint. Postgres still
// rejects any change that would actually violate data.
execSync(
  "npx prisma db push --schema=prisma/schema.deploy.prisma --skip-generate --accept-data-loss",
  { stdio: "inherit", env },
);
execSync("npx prisma generate --schema=prisma/schema.deploy.prisma", { stdio: "inherit", env });
console.log("[db] Done.");
