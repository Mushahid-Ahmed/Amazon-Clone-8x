import { seed } from "../lib/server/seed";
import { prisma } from "../lib/server/db";

seed()
  .then(async () => {
    const [products, users, orders] = await Promise.all([
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.count(),
    ]);
    console.log(`Seeded: ${products} products, ${users} users, ${orders} orders`);
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
