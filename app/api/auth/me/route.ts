import { prisma } from "../../../../lib/server/db";
import { ok, withApi } from "../../../../lib/server/http";
import { getSession } from "../../../../lib/server/session";
import { toUser } from "../../../../lib/server/serializers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async () => {
  const session = await getSession();
  if (!session?.user) return ok({ user: null });
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { addresses: true },
  });
  return ok({ user: user ? toUser(user) : null });
});
