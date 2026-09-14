import { z } from "zod";
import { prisma } from "../../../lib/server/db";
import {
  ApiError,
  ok,
  parseBody,
  withApi,
} from "../../../lib/server/http";
import {
  cartScope,
  findCartItem,
  scopeWhere,
  upsertCartItem,
} from "../../../lib/server/cart";
import { getOrCreateSession } from "../../../lib/server/session";
import { toCartItem, toProduct } from "../../../lib/server/serializers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const addSchema = z.object({
  productId: z.string().trim().min(1).max(40),
  quantity: z.coerce.number().int().min(1).max(10).default(1),
});

export const GET = withApi(async () => {
  const session = await getOrCreateSession();
  const scope = cartScope(session);
  const rows = await prisma.cartItem.findMany({
    where: scopeWhere(scope),
    include: { product: true },
    orderBy: { createdAt: "asc" },
  });
  return ok({
    items: rows.filter((row) => !row.savedForLater).map(toCartItem),
    savedItems: rows.filter((row) => row.savedForLater).map((row) => toProduct(row.product)),
  });
});

export const POST = withApi(async (req) => {
  const input = await parseBody(addSchema, req);
  const session = await getOrCreateSession();
  const scope = cartScope(session);

  const product = await prisma.product.findUnique({ where: { id: input.productId } });
  if (!product) throw new ApiError(404, "NOT_FOUND", "Product not found.");

  const existing = await findCartItem(scope, input.productId);
  const nextQuantity = Math.min(10, (existing?.quantity ?? 0) + input.quantity);
  if (nextQuantity > product.stock) {
    throw new ApiError(
      400,
      "INSUFFICIENT_STOCK",
      `Only ${product.stock} left in stock.`,
      { stock: product.stock },
    );
  }
  const item = await upsertCartItem(scope, input.productId, nextQuantity, existing?.savedForLater ?? false);
  return ok({ item: toCartItem(item) }, { status: 201 });
});
