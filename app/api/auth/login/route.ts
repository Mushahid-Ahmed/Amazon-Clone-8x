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

const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password.").max(72),
});

export const POST = withApi(async (req) => {
  const input = await parseBody(loginSchema, req);
  const email = input.email.trim().toLowerCase();
  rateLimit(`auth:login:${clientIp(req)}`, 10, 10 * 60 * 1000);
  rateLimit(`auth:login:email:${email}`, 5, 10 * 60 * 1000);
  const user = await prisma.user.findUnique({ where: { email } });
  const valid = user ? await bcrypt.compare(input.password, user.passwordHash) : false;
  if (!user || !valid) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Incorrect email or password.");
  }
  const guestSession = await getSession();
  await createSession(user.id);
  if (guestSession && !guestSession.userId) {
    await mergeGuestCartIntoUser(guestSession, user.id);
  }
  const full = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    include: { addresses: true },
  });
  return ok({ user: toUser(full) });
});
