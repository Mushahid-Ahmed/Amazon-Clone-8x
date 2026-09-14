import bcrypt from "bcryptjs";
import { products } from "../../data/products";
import { prisma } from "./db";
import { daysAgo, REVIEW_SEEDS } from "./seed-data";

export const DEMO_EMAIL = "alex@demo.com";
export const DEMO_PASSWORD = "password123";

// Generous enough for repeated demo checkouts (e2e suite buys 2 units per run);
// the low-stock UX still emerges naturally as orders deplete it.
export const SEED_STOCK = 50;

export async function seed(): Promise<void> {
  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        title: product.title,
        brand: product.brand ?? null,
        category: product.category,
        description: product.description,
        images: JSON.stringify(product.images),
        price: product.price,
        rating: product.rating,
        reviewCount: product.reviewCount,
        isPrime: product.isPrime,
        isBestSeller: product.isBestSeller,
        isDeal: product.isDeal,
        isNew: product.isNew,
        priceTier: product.priceTier,
        discountPercent: product.discount?.percent ?? null,
        originalPrice: product.discount?.originalPrice ?? null,
        discountRequirement: product.discount?.requirement ?? null,
        features: JSON.stringify(product.features),
        specifications: JSON.stringify(product.specifications),
        stock: SEED_STOCK,
      },
      create: {
        id: product.id,
        title: product.title,
        brand: product.brand ?? null,
        category: product.category,
        description: product.description,
        images: JSON.stringify(product.images),
        price: product.price,
        rating: product.rating,
        reviewCount: product.reviewCount,
        isPrime: product.isPrime,
        isBestSeller: product.isBestSeller,
        isDeal: product.isDeal,
        isNew: product.isNew,
        priceTier: product.priceTier,
        discountPercent: product.discount?.percent ?? null,
        originalPrice: product.discount?.originalPrice ?? null,
        discountRequirement: product.discount?.requirement ?? null,
        features: JSON.stringify(product.features),
        specifications: JSON.stringify(product.specifications),
        stock: SEED_STOCK,
      },
    });
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const demoUser = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: {
      name: "Alex Rivera",
      email: DEMO_EMAIL,
      passwordHash,
      isPrime: true,
      addresses: {
        create: {
          fullName: "Alex Rivera",
          line1: "2101 4th Avenue",
          city: "Seattle",
          state: "WA",
          postalCode: "98121",
          country: "United States",
          isDefault: true,
        },
      },
    },
  });

  const authorCache = new Map<string, string>();
  for (const review of REVIEW_SEEDS) {
    let authorId = authorCache.get(review.author);
    if (!authorId) {
      const slug = review.author.toLowerCase().replace(/[^a-z]+/g, ".");
      const author = await prisma.user.upsert({
        where: { email: `${slug}@reviews.demo` },
        update: {},
        create: {
          name: review.author,
          email: `${slug}@reviews.demo`,
          passwordHash: await bcrypt.hash(crypto.randomUUID(), 10),
        },
      });
      authorId = author.id;
      authorCache.set(review.author, authorId);
    }
    const existing = await prisma.review.findUnique({
      where: { productId_userId: { productId: review.productId, userId: authorId } },
    });
    if (!existing) {
      await prisma.review.create({
        data: {
          productId: review.productId,
          userId: authorId,
          authorName: review.author,
          rating: review.rating,
          title: review.title,
          body: review.body,
          helpful: review.helpful,
          createdAt: daysAgo(review.daysAgo),
        },
      });
    }
  }

  const existingOrders = await prisma.order.count({ where: { userId: demoUser.id } });
  if (existingOrders === 0) {
    const product = (id: string) => products.find((item) => item.id === id)!;
    const address = JSON.stringify({
      id: "address-demo",
      fullName: "Alex Rivera",
      line1: "2101 4th Avenue",
      city: "Seattle",
      state: "WA",
      postalCode: "98121",
      country: "United States",
      isDefault: true,
    });

    const deliveredSubtotal = product("prod-01").price * 2 + product("prod-07").price;
    const deliveredTax = Math.round(deliveredSubtotal * 0.085 * 100) / 100;
    await prisma.order.create({
      data: {
        id: "ORDER-DEMO-0001",
        userId: demoUser.id,
        status: "delivered",
        paymentMethod: "Visa ending in 4242",
        subtotal: deliveredSubtotal,
        shipping: 0,
        tax: deliveredTax,
        total: Math.round((deliveredSubtotal + deliveredTax) * 100) / 100,
        placedAt: daysAgo(21),
        shippingAddress: address,
        items: {
          create: [
            { productId: "prod-01", title: product("prod-01").title, image: product("prod-01").images[0], price: product("prod-01").price, quantity: 2 },
            { productId: "prod-07", title: product("prod-07").title, image: product("prod-07").images[0], price: product("prod-07").price, quantity: 1 },
          ],
        },
        events: {
          create: [
            { label: "Order placed", description: "We received your order.", timestamp: daysAgo(21), completed: true, sortIndex: 0 },
            { label: "Preparing for shipment", description: "Your items were packed.", timestamp: daysAgo(20), completed: true, sortIndex: 1 },
            { label: "Shipped", description: "Carrier picked up the package.", timestamp: daysAgo(19), completed: true, sortIndex: 2 },
            { label: "Delivered", description: "Package left near the front door.", timestamp: daysAgo(17), completed: true, sortIndex: 3 },
          ],
        },
      },
    });

    const shippedSubtotal = product("prod-03").price + product("prod-05").price;
    const shippedTax = Math.round(shippedSubtotal * 0.085 * 100) / 100;
    await prisma.order.create({
      data: {
        id: "ORDER-DEMO-0002",
        userId: demoUser.id,
        status: "shipped",
        paymentMethod: "Visa ending in 4242",
        subtotal: shippedSubtotal,
        shipping: 0,
        tax: shippedTax,
        total: Math.round((shippedSubtotal + shippedTax) * 100) / 100,
        placedAt: daysAgo(4),
        shippingAddress: address,
        items: {
          create: [
            { productId: "prod-03", title: product("prod-03").title, image: product("prod-03").images[0], price: product("prod-03").price, quantity: 1 },
            { productId: "prod-05", title: product("prod-05").title, image: product("prod-05").images[0], price: product("prod-05").price, quantity: 1 },
          ],
        },
        events: {
          create: [
            { label: "Order placed", description: "We received your order.", timestamp: daysAgo(4), completed: true, sortIndex: 0 },
            { label: "Preparing for shipment", description: "Your items were packed.", timestamp: daysAgo(3), completed: true, sortIndex: 1 },
            { label: "Shipped", description: "Carrier picked up the package.", timestamp: daysAgo(2), completed: true, sortIndex: 2 },
            { label: "Delivered", description: "Estimated in two more days.", completed: false, sortIndex: 3 },
          ],
        },
      },
    });
  }
}

let inflight: Promise<void> | null = null;

// Idempotent self-seeding used by the API at runtime: guarantees a fresh
// deployment (e.g. a new Vercel Postgres instance) populates itself on first hit.
export function ensureSeeded(): Promise<void> {
  if (!inflight) {
    inflight = (async () => {
      const count = await prisma.product.count();
      if (count === 0) await seed();
    })().catch((error) => {
      inflight = null;
      throw error;
    });
  }
  return inflight;
}
