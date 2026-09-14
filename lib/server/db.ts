import { PrismaClient } from "@prisma/client";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// Loads DATABASE_URL from .env for non-Next processes (tsx seed/smoke scripts).
// Next.js loads .env itself; this is a no-op there.
function loadEnvFile(): void {
  if (process.env.DATABASE_URL) return;
  const envPath = join(process.cwd(), ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

loadEnvFile();

function resolveDatabaseUrl(): string | undefined {
  const candidates = [
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
    process.env.DATABASE_URL,
  ];
  const postgres = candidates.find(
    (value) => value && (value.startsWith("postgres://") || value.startsWith("postgresql://")),
  );
  return postgres ?? process.env.DATABASE_URL;
}

export function isPostgres(): boolean {
  const url = resolveDatabaseUrl();
  return Boolean(url && (url.startsWith("postgres://") || url.startsWith("postgresql://")));
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: resolveDatabaseUrl() } },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
