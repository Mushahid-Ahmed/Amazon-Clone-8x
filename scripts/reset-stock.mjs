// Test precondition: restore demo stock so the API smoke suite and Playwright
// e2e suite are deterministic across repeated runs (checkouts deplete inventory).
import { PrismaClient } from "@prisma/client";

const SEED_STOCK = 50;

const prisma = new PrismaClient();
const result = await prisma.product.updateMany({ data: { stock: SEED_STOCK } });
console.log(`[test] reset stock to ${SEED_STOCK} on ${result.count} products`);
await prisma.$disconnect();
