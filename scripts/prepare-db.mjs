// Deploy-time database preparation (runs as `vercel-build` before `next build`).
//
// When a Postgres URL is present (Vercel Postgres sets POSTGRES_PRISMA_URL, or a
// custom DATABASE_URL), this generates a PostgreSQL-bound Prisma client and pushes
// the schema to the database. Without one, the SQLite-bound client from postinstall
// stays in place and the app runs in documented local/demo mode.

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

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

console.log("[db] Postgres detected — pushing schema and generating PostgreSQL client…");
const env = { ...process.env, DATABASE_URL: pgUrl };
execSync("npx prisma db push --schema=prisma/schema.deploy.prisma --skip-generate", { stdio: "inherit", env });
execSync("npx prisma generate --schema=prisma/schema.deploy.prisma", { stdio: "inherit", env });
console.log("[db] Done.");
