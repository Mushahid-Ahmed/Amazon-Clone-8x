import { z } from "zod";
import { prisma } from "../../../lib/server/db";
import { ok, parseBody, withApi } from "../../../lib/server/http";
import { requireUser } from "../../../lib/server/session";
import { toAddress } from "../../../lib/server/serializers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const addressSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  line1: z.string().trim().min(3).max(120),
  line2: z.string().trim().max(120).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(60),
  state: z.string().trim().min(2).max(60),
  postalCode: z.string().trim().min(3).max(12),
  country: z.string().trim().min(2).max(60).default("United States"),
  isDefault: z.boolean().optional(),
});

export const GET = withApi(async () => {
  const user = await requireUser();
  const rows = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
  return ok({ addresses: rows.map(toAddress) });
});

export const POST = withApi(async (req) => {
  const user = await requireUser();
  const input = await parseBody(addressSchema, req);
  const count = await prisma.address.count({ where: { userId: user.id } });
  const isDefault = input.isDefault ?? count === 0;
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    });
  }
  const row = await prisma.address.create({
    data: {
      userId: user.id,
      fullName: input.fullName,
      line1: input.line1,
      line2: input.line2 || null,
      city: input.city,
      state: input.state,
      postalCode: input.postalCode,
      country: input.country,
      isDefault,
    },
  });
  return ok({ address: toAddress(row) }, { status: 201 });
});
