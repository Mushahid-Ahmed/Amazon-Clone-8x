import { prisma } from "../../../../lib/server/db";
import { ApiError, ok, withApi } from "../../../../lib/server/http";
import { ensureSeeded } from "../../../../lib/server/seed";
import { toProduct } from "../../../../lib/server/serializers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (_req, ctx) => {
  await ensureSeeded();
  const { id } = await ctx.params;
  const row = await prisma.product.findUnique({ where: { id } });
  if (!row) throw new ApiError(404, "NOT_FOUND", "Product not found.");
  return ok({ product: toProduct(row) });
});
