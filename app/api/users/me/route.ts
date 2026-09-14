import { z } from "zod";
import { prisma } from "../../../../lib/server/db";
import { ok, parseBody, withApi } from "../../../../lib/server/http";
import { requireUser } from "../../../../lib/server/session";
import { toUser, type UserWithAddresses } from "../../../../lib/server/serializers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    isPrime: z.boolean().optional(),
  })
  .refine((value) => value.name !== undefined || value.isPrime !== undefined, {
    message: "Nothing to update.",
  });

export const GET = withApi(async () => {
  const user = await requireUser();
  const row = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    include: { addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] } },
  });
  return ok({ user: toUser(row as UserWithAddresses) });
});

export const PATCH = withApi(async (req) => {
  const user = await requireUser();
  const input = await parseBody(patchSchema, req);
  const row = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.isPrime !== undefined ? { isPrime: input.isPrime } : {}),
    },
    include: { addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] } },
  });
  return ok({ user: toUser(row as UserWithAddresses) });
});
