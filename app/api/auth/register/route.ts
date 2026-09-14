import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/server/db";
import {
  ApiError,
  clientIp,
  ok,
  parseBody,
  rateLimit,
  withApi,
} from "../../../../lib/server/http";
import { createSession, getSession } from "../../../../lib/server/session";
import { mergeGuestCartIntoUser } from "../../../../lib/server/cart";
import { toUser } from "../../../../lib/server/serializers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80),
  email: z.email("Enter a valid email address.").max(200),
  password: z.string().min(8, "Password must be at least 8 characters.").max(72),
});

export const POST = withApi(async (req) => {
  rateLimit(`auth:register:${clientIp(req)}`, 10, 10 * 60 * 1000);
  const input = await parseBody(registerSchema, req);
  const email = input.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ApiError(409, "EMAIL_TAKEN", "An account with this email already exists.");
  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: { name: input.name.trim(), email, passwordHash },
  });
  const guestSession = await getSession();
  await createSession(user.id);
  if (guestSession && !guestSession.userId) {
    await mergeGuestCartIntoUser(guestSession, user.id);
  }
  const full = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    include: { addresses: true },
  });
  return ok({ user: toUser(full) }, { status: 201 });
});
