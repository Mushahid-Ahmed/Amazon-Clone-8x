import { prisma } from "./db";
import type { SessionWithUser } from "./session";

export type CartScope =
  | { userId: string; sessionId?: undefined }
  | { userId?: undefined; sessionId: string };

export function cartScope(session: SessionWithUser): CartScope {
  return session.user ? { userId: session.user.id } : { sessionId: session.id };
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
