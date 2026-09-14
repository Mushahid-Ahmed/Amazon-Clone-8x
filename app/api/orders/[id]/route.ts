import { prisma } from "../../../../lib/server/db";
import { ApiError, ok, withApi } from "../../../../lib/server/http";
import { requireUser } from "../../../../lib/server/session";
import { toOrder } from "../../../../lib/server/serializers";
import { ensureSeeded } from "../../../../lib/server/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (_req, ctx) => {
  await ensureSeeded();
  const { id } = await ctx.params;
  const user = await requireUser();
  const order = await prisma.order.findFirst({
    where: { id, userId: user.id },
    include: { items: true, events: true },
  });
  if (!order) throw new ApiError(404, "NOT_FOUND", "Order not found.");
  return ok({ order: toOrder(order) });
});
