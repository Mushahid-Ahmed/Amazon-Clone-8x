// Test precondition: restore demo stock so the API smoke suite is deterministic
// across repeated runs (checkout + drain loop deplete inventory otherwise).
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const result = await prisma.product.updateMany({ data: { stock: 25 } });
console.log(`[test] reset stock on ${result.count} products`);
await prisma.$disconnect();
