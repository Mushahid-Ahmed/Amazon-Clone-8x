import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../../lib/server/db";
import { ok, parseQuery, withApi } from "../../../lib/server/http";
import { ensureSeeded } from "../../../lib/server/seed";
import { toProduct } from "../../../lib/server/serializers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const flag = z
  .enum(["true", "false"])
  .optional()
  .transform((value) => (value === undefined ? undefined : value === "true"));

const listSchema = z.object({
  q: z.string().trim().max(120).optional(),
  category: z.string().trim().max(60).optional(),
  priceTier: z.enum(["budget", "mid-range", "premium"]).optional(),
  isPrime: flag,
  isDeal: flag,
  isBestSeller: flag,
  isNew: flag,
  minPrice: z.coerce.number().min(0).max(100000).optional(),
  maxPrice: z.coerce.number().min(0).max(100000).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  sort: z.enum(["featured", "price-asc", "price-desc", "rating", "reviews", "newest"]).default("featured"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(24),
});

export const GET = withApi(async (req) => {
  await ensureSeeded();
  const query = parseQuery(listSchema, req.url);

  const where: Prisma.ProductWhereInput = {};
  if (query.category) where.category = query.category;
  if (query.priceTier) where.priceTier = query.priceTier;
  if (query.isPrime !== undefined) where.isPrime = query.isPrime;
  if (query.isDeal !== undefined) where.isDeal = query.isDeal;
  if (query.isBestSeller !== undefined) where.isBestSeller = query.isBestSeller;
  if (query.isNew !== undefined) where.isNew = query.isNew;
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.price = {};
    if (query.minPrice !== undefined) where.price.gte = query.minPrice;
    if (query.maxPrice !== undefined) where.price.lte = query.maxPrice;
  }

  const rows = await prisma.product.findMany({ where, orderBy: { id: "asc" } });
  let products = rows.map(toProduct);

  if (query.q) {
    const needle = query.q.toLowerCase();
    products = products.filter((product) =>
      [product.title, product.brand, product.description, product.category]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(needle)),
    );
  }
  if (query.minRating !== undefined) {
    products = products.filter((product) => product.rating >= query.minRating!);
  }

  switch (query.sort) {
    case "price-asc":
      products.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      products.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      products.sort((a, b) => b.rating - a.rating);
      break;
    case "reviews":
      products.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    case "newest":
      products.sort((a, b) => Number(b.isNew) - Number(a.isNew) || b.id.localeCompare(a.id));
      break;
    default:
      break;
  }

  const total = products.length;
  const pages = Math.max(1, Math.ceil(total / query.limit));
  const page = Math.min(query.page, pages);
  const start = (page - 1) * query.limit;
  return ok({ products: products.slice(start, start + query.limit), total, page, pages });
});
