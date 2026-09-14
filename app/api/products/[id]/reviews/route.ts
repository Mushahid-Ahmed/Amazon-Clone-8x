import { z } from "zod";
import { prisma } from "../../../../../lib/server/db";
import {
  ApiError,
  clientIp,
  ok,
  parseBody,
  parseQuery,
  rateLimit,
  withApi,
} from "../../../../../lib/server/http";
import { requireUser } from "../../../../../lib/server/session";
import { toReview } from "../../../../../lib/server/serializers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const listSchema = z.object({
  sort: z.enum(["recent", "helpful", "rating-high", "rating-low"]).default("recent"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

const createSchema = z.object({
  rating: z.coerce.number().int().min(1, "Rating must be between 1 and 5.").max(5, "Rating must be between 1 and 5."),
  title: z.string().trim().min(3, "Title must be at least 3 characters.").max(120),
  body: z.string().trim().min(10, "Review must be at least 10 characters.").max(2000),
});

const sortMap = {
  recent: { createdAt: "desc" as const },
  helpful: { helpful: "desc" as const },
  "rating-high": { rating: "desc" as const },
  "rating-low": { rating: "asc" as const },
};

export const GET = withApi(async (req, ctx) => {
  const { id } = await ctx.params;
  const product = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!product) throw new ApiError(404, "NOT_FOUND", "Product not found.");
  const query = parseQuery(listSchema, req.url);
  const total = await prisma.review.count({ where: { productId: id } });
  const rows = await prisma.review.findMany({
    where: { productId: id },
    orderBy: [sortMap[query.sort], { createdAt: "desc" }],
    skip: (query.page - 1) * query.limit,
    take: query.limit,
  });
  const pages = Math.max(1, Math.ceil(total / query.limit));
  return ok({ reviews: rows.map(toReview), total, page: Math.min(query.page, pages), pages });
});

export const POST = withApi(async (req, ctx) => {
  rateLimit(`reviews:${clientIp(req)}`, 30, 60 * 1000);
  const user = await requireUser();
  const { id } = await ctx.params;
  const input = await parseBody(createSchema, req);

  const product = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!product) throw new ApiError(404, "NOT_FOUND", "Product not found.");

  const existing = await prisma.review.findUnique({
    where: { productId_userId: { productId: id, userId: user.id } },
  });
  if (existing) throw new ApiError(409, "REVIEW_EXISTS", "You have already reviewed this product.");

  const review = await prisma.review.create({
    data: {
      productId: id,
      userId: user.id,
      authorName: user.name,
      rating: input.rating,
      title: input.title,
      body: input.body,
    },
  });
  const aggregate = await prisma.review.aggregate({
    where: { productId: id },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id },
    data: {
      rating: Math.round((aggregate._avg.rating ?? 0) * 10) / 10,
      reviewCount: aggregate._count,
    },
  });
  return ok({ review: toReview(review) }, { status: 201 });
});
