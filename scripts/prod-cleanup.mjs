// One-shot production cleanup: removes demo/test artifacts left by earlier
// development phases so the live site has no demo user, no orphaned guest
// orders, and full stock. Real registered users (and their data) are preserved.
//
// Usage: PROD_DATABASE_URL=<neon connection string> node scripts/prod-cleanup.mjs
import pg from "pg";

const url = process.env.PROD_DATABASE_URL;
if (!url) {
  console.error("PROD_DATABASE_URL is required (Neon pooled connection string).");
  process.exit(1);
}

const client = new pg.Client({ connectionString: url });

const dry = process.argv.includes("--dry-run");

async function main() {
  await client.connect();
  const queries = [
    // Guest-placed orders from the pre-auth era: no owner, must not exist.
    {
      label: "delete orders with no owner",
      sql: "DELETE FROM \"Order\" WHERE \"userId\" IS NULL",
    },
    // The removed demo account and smoke-test accounts (never real users).
    {
      label: "delete demo/smoke users and their orders",
      sql: `DELETE FROM "User" WHERE email = 'alex@demo.com' OR email LIKE 'smoke.%@example.com'`,
    },
    // Test-run checkouts depleted a few products.
    {
      label: "restore product stock to 50",
      sql: `UPDATE "Product" SET stock = 50 WHERE stock < 50`,
    },
    // Sessions referencing deleted users would dangle otherwise.
    {
      label: "delete sessions of removed users",
      sql: `DELETE FROM "Session" WHERE "userId" IS NOT NULL AND "userId" NOT IN (SELECT id FROM "User")`,
    },
  ];

  for (const { label, sql } of queries) {
    if (dry) {
      console.log(`[dry-run] ${label}: ${sql}`);
      continue;
    }
    const result = await client.query(sql);
    console.log(`[prod-cleanup] ${label}: ${result.rowCount ?? 0} rows`);
  }

  const counts = await client.query(`
    SELECT
      (SELECT COUNT(*) FROM "User") AS users,
      (SELECT COUNT(*) FROM "Order") AS orders,
      (SELECT COUNT(*) FROM "Session") AS sessions,
      (SELECT COUNT(*) FROM "Product" WHERE stock < 50) AS low_stock
  `);
  console.log("[prod-cleanup] final state:", counts.rows[0]);
  const users = await client.query(
    `SELECT email FROM "User" ORDER BY email`,
  );
  console.log("[prod-cleanup] remaining users:", users.rows.map((r) => r.email).join(", "));
  await client.end();
}

main().catch(async (error) => {
  console.error("[prod-cleanup] failed:", error.message);
  await client.end().catch(() => undefined);
  process.exit(1);
});
