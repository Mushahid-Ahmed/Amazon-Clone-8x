import { prisma } from "../../../../../lib/server/db";
import { ApiError, ok, withApi } from "../../../../../lib/server/http";
import { cartScope, findCartItem } from "../../../../../lib/server/cart";
import { getOrCreateSession } from "../../../../../lib/server/session";
import { toCartItem } from "../../../../../lib/server/serializers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withApi(async (_req, ctx) => {
  const { productId } = await ctx.params;
  const session = await getOrCreateSession();
  const scope = cartScope(session);
  const existing = await findCartItem(scope, productId);
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Item not found in saved for later.");
  const row = await prisma.cartItem.update({
    where: { id: existing.id },
    data: { savedForLater: false, quantity: Math.max(1, existing.quantity) },
    include: { product: true },
  });
  return ok({ item: toCartItem(row) });
});
