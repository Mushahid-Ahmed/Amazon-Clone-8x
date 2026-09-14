import { isPostgres, prisma } from "../../../lib/server/db";
import { ensureSeeded } from "../../../lib/server/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureSeeded();
    const products = await prisma.product.count();
    const users = await prisma.user.count();
    return Response.json({
      status: "ok",
      database: "up",
      provider: isPostgres() ? "postgresql" : "sqlite",
      products,
      users,
      time: new Date().toISOString(),
    });
  } catch {
    return Response.json(
      { status: "degraded", database: "down", message: "Database is not configured or unreachable." },
      { status: 503 },
    );
  }
}
