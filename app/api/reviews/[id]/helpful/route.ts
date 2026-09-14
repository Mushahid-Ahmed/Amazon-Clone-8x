import { prisma } from "../../../../../lib/server/db";
import { ApiError, clientIp, ok, rateLimit, withApi } from "../../../../../lib/server/http";
import { toReview } from "../../../../../lib/server/serializers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withApi(async (req, ctx) => {
  rateLimit(`helpful:${clientIp(req)}`, 60, 60 * 1000);
  const { id } = await ctx.params;
  try {
    const review = await prisma.review.update({
      where: { id },
      data: { helpful: { increment: 1 } },
    });
    return ok({ review: toReview(review) });
  } catch (error) {
    if (typeof error === "object" && error !== null && (error as { code?: string }).code === "P2025") {
      throw new ApiError(404, "NOT_FOUND", "Review not found.");
    }
    throw error;
  }
});
