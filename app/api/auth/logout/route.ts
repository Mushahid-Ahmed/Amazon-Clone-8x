import { ok, withApi } from "../../../../lib/server/http";
import { destroySession } from "../../../../lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withApi(async () => {
  await destroySession();
  return ok({ success: true });
});
