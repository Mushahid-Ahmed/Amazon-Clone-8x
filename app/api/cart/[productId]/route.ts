import { z } from "zod";
import { prisma } from "../../../../lib/server/db";
import {
  ApiError,
  ok,
  parseBody,
  withApi,
} from "../../../../lib/server/http";
import { cartScope, findCartItem, scopeWhere } from "../../../../lib/server/cart";
import { getOrCreateSession } from "../../../../lib/server/session";
import { toCartItem } from "../../../../lib/server/serializers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateSchema = z.object({
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1.").max(10, "Quantity cannot exceed 10."),
});

export const PATCH = withApi(async (req, ctx) => {
  const { productId } = await ctx.params;
  const input = await parseBody(updateSchema, req);
  const session = await getOrCreateSession();
  const scope = cartScope(session);

  const existing = await findCartItem(scope, productId);
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Item not found in cart.");
  if (input.quantity > existing.product.stock) {
    throw new ApiError(
      400,
      "INSUFFICIENT_STOCK",
      `Only ${existing.product.stock} left in stock.`,
      { stock: existing.product.stock },
    );
  }
  const item = await prisma.cartItem.update({
    where: { id: existing.id },
    data: { quantity: input.quantity },
    include: { product: true },
  });
  return ok({ item: toCartItem(item) });
});

export const DELETE = withApi(async (_req, ctx) => {
  const { productId } = await ctx.params;
  const session = await getOrCreateSession();
  const scope = cartScope(session);
  await prisma.cartItem.deleteMany({ where: { ...scopeWhere(scope), productId } });
  return ok({ success: true });
});
