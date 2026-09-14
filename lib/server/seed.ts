import bcrypt from "bcryptjs";
import { products } from "../../data/products";
import { prisma } from "./db";
import { daysAgo, REVIEW_SEEDS } from "./seed-data";

// Generous enough for repeated e2e checkouts (each suite run buys a few units);
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

  // Review authors are non-loginable display accounts that exist only because
  // a review must reference a user row; they hold no orders or addresses.
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
