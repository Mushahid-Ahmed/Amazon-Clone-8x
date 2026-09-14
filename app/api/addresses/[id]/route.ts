import { prisma } from "../../../../lib/server/db";
import { ApiError, ok, parseBody, withApi } from "../../../../lib/server/http";
import { requireUser } from "../../../../lib/server/session";
import { toAddress } from "../../../../lib/server/serializers";
import { addressSchema } from "../../../../lib/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function findOwnedAddress(id: string, userId: string) {
  const row = await prisma.address.findFirst({ where: { id, userId } });
  if (!row) throw new ApiError(404, "NOT_FOUND", "Address not found.");
  return row;
}

export const PATCH = withApi(async (req, ctx) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  await findOwnedAddress(id, user.id);
  const input = await parseBody(addressSchema.partial(), req);
  if (input.isDefault) {
    await prisma.address.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    });
  }
  const row = await prisma.address.update({
    where: { id },
    data: {
      ...(input.fullName !== undefined ? { fullName: input.fullName } : {}),
      ...(input.line1 !== undefined ? { line1: input.line1 } : {}),
      ...(input.line2 !== undefined ? { line2: input.line2 || null } : {}),
      ...(input.city !== undefined ? { city: input.city } : {}),
      ...(input.state !== undefined ? { state: input.state } : {}),
      ...(input.postalCode !== undefined ? { postalCode: input.postalCode } : {}),
      ...(input.country !== undefined ? { country: input.country } : {}),
      ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
    },
  });
  return ok({ address: toAddress(row) });
});

export const DELETE = withApi(async (_req, ctx) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  const row = await findOwnedAddress(id, user.id);
  await prisma.address.delete({ where: { id } });
  if (row.isDefault) {
    const next = await prisma.address.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });
    if (next) {
      await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
    }
  }
  return ok({ success: true });
});
