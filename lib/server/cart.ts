import type { Prisma } from "@prisma/client";
import { prisma } from "./db";
import type { SessionWithUser } from "./session";

export type CartScope =
  | { userId: string; sessionId?: undefined }
  | { userId?: undefined; sessionId: string };

export function cartScope(session: SessionWithUser): CartScope {
  return session.user ? { userId: session.user.id } : { sessionId: session.id };
}

export function scopeWhere(scope: CartScope): Prisma.CartItemWhereInput {
  return scope.userId ? { userId: scope.userId } : { sessionId: scope.sessionId };
}

export async function findCartItem(scope: CartScope, productId: string) {
  const where = scope.userId
    ? { userId_productId: { userId: scope.userId, productId } }
    : { sessionId_productId: { sessionId: scope.sessionId, productId } };
  return prisma.cartItem.findUnique({ where, include: { product: true } });
}

export async function upsertCartItem(
  scope: CartScope,
  productId: string,
  quantity: number,
  savedForLater = false,
) {
  const data = { quantity, savedForLater };
  if (scope.userId) {
    return prisma.cartItem.upsert({
      where: { userId_productId: { userId: scope.userId, productId } },
      create: { userId: scope.userId, productId, ...data },
      update: data,
      include: { product: true },
    });
  }
  return prisma.cartItem.upsert({
    where: { sessionId_productId: { sessionId: scope.sessionId, productId } },
    create: { sessionId: scope.sessionId, productId, ...data },
    update: data,
    include: { product: true },
  });
}

export async function mergeGuestCartIntoUser(session: SessionWithUser, userId: string): Promise<void> {
  if (session.userId === userId) return;
  const guestItems = await prisma.cartItem.findMany({ where: { sessionId: session.id } });
  for (const item of guestItems) {
    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId, productId: item.productId } },
    });
    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: {
          quantity: Math.min(10, existing.quantity + item.quantity),
          savedForLater: existing.savedForLater || item.savedForLater,
        },
      });
      await prisma.cartItem.delete({ where: { id: item.id } });
    } else {
      await prisma.cartItem.update({ where: { id: item.id }, data: { userId, sessionId: null } });
    }
  }
  await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
}
