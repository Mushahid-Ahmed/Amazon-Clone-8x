import { prisma } from "../../../../../lib/server/db";
import { ApiError, ok, withApi } from "../../../../../lib/server/http";
import { requireUser } from "../../../../../lib/server/session";
import { toOrder } from "../../../../../lib/server/serializers";
import { ensureSeeded } from "../../../../../lib/server/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withApi(async (_req, ctx) => {
  await ensureSeeded();
  const { id } = await ctx.params;
  const user = await requireUser();

  const cancelled = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: { id, userId: user.id },
      include: { items: true },
    });
    if (!order) throw new ApiError(404, "NOT_FOUND", "Order not found.");
    if (order.status !== "processing") {
      throw new ApiError(409, "ORDER_NOT_CANCELLABLE", `Order status is "${order.status}".`);
    }
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }
    return tx.order.update({
      where: { id: order.id },
      data: { status: "cancelled" },
      include: { items: true, events: true },
    });
  });

  return ok({ order: toOrder(cancelled) });
});
