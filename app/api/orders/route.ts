import { z } from "zod";
import { prisma } from "../../../lib/server/db";
import { ApiError, ok, withApi } from "../../../lib/server/http";
import { addressSchema } from "../../../lib/server/validation";
import { chargePayment } from "../../../lib/server/payment";
import { requireUser } from "../../../lib/server/session";
import { toOrder } from "../../../lib/server/serializers";
import { ensureSeeded } from "../../../lib/server/seed";
import { generateOrderId } from "../../../lib/utils";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const placeOrderSchema = z
  .object({
    addressId: z.string().min(1).optional(),
    address: addressSchema.optional(),
    paymentMethod: z.string().min(2).max(80),
  })
  .refine((value) => value.addressId || value.address, {
    message: "Provide addressId or an inline address object.",
    path: ["addressId"],
  });

const TRACKING_STEPS: Array<{ label: string; description: string }> = [
  { label: "Order placed", description: "We've received your order." },
  { label: "Preparing for shipment", description: "Items are being picked and packed." },
  { label: "Shipped", description: "Your package is on the way." },
  { label: "Delivered", description: "Package delivered." },
];

export const GET = withApi(async () => {
  await ensureSeeded();
  const user = await requireUser();
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: true, events: true },
    orderBy: { placedAt: "desc" },
  });
  return ok({ orders: orders.map(toOrder) });
});

export const POST = withApi(async (req) => {
  await ensureSeeded();
  const user = await requireUser();
  const input = placeOrderSchema.parse(await req.json().catch(() => ({})));

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: user.id, savedForLater: false },
    include: { product: true },
  });
  if (cartItems.length === 0) {
    throw new ApiError(400, "CART_EMPTY", "Add items to your cart before checkout.");
  }

  let shippingAddress: Prisma.InputJsonValue;
  if (input.addressId) {
    const address = await prisma.address.findFirst({ where: { id: input.addressId, userId: user.id } });
    if (!address) throw new ApiError(404, "NOT_FOUND", "Address not found.");
    shippingAddress = {
      fullName: address.fullName,
      line1: address.line1,
      line2: address.line2 ?? undefined,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
    };
  } else if (input.address) {
    shippingAddress = { ...input.address, line2: input.address.line2 ?? undefined };
  } else {
    throw new ApiError(400, "VALIDATION_ERROR", "addressId or address is required.");
  }

  const subtotal = Math.round(cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0) * 100) / 100;
  const shipping = calculateShippingForOrder(subtotal, user.isPrime);
  const tax = Math.round(subtotal * 0.085 * 100) / 100;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;

  const digits = resolvePaymentMethodDigits(input.paymentMethod);
  const charge = await chargePayment({ method: digits, amount: total, email: user.email });

  const orderId = generateOrderId();
  const order = await prisma.$transaction(async (tx) => {
      for (const item of cartItems) {
        const result = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (result.count === 0) {
          throw new ApiError(409, "INSUFFICIENT_STOCK", `Not enough stock for "${item.product.title}".`);
        }
      }
      const created = await tx.order.create({
        data: {
          id: orderId,
          userId: user.id,
          status: "processing",
          paymentMethod: input.paymentMethod,
          paymentStatus: charge.status,
          subtotal,
          shipping,
          tax,
          total,
          shippingAddress: JSON.stringify(shippingAddress),
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              title: item.product.title,
              image: (JSON.parse(item.product.images) as string[])[0] ?? "",
              price: item.product.price,
              quantity: item.quantity,
            })),
          },
          events: {
            create: TRACKING_STEPS.map((step, index) => ({
              ...step,
              completed: index === 0,
              timestamp: index === 0 ? new Date() : null,
              sortIndex: index,
            })),
          },
        },
        include: { items: true, events: true },
      });
      await tx.cartItem.deleteMany({ where: { userId: user.id, savedForLater: false } });
      return created;
    });
    return ok({ order: toOrder(order) }, { status: 201 });
  });

function calculateShippingForOrder(subtotal: number, isPrime: boolean): number {
  if (isPrime || subtotal >= 25) return 0;
  return 5.99;
}

function resolvePaymentMethodDigits(method: string): string {
  const match = method.match(/\d{4}$/);
  if (match) return match[0];
  if (/cash|cod/i.test(method)) return "cod";
  return method;
}
