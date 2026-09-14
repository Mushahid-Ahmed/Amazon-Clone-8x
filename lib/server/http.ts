import { NextRequest, NextResponse } from "next/server";
import type { ZodType } from "zod";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export function ok(data: unknown, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, init);
}

export function errorBody(status: number, code: string, message: string, details?: unknown) {
  return NextResponse.json({ error: { code, message, details } }, { status });
}

export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof ApiError) return errorBody(error.status, error.code, error.message, error.details);
  if (typeof error === "object" && error !== null && (error as { code?: string }).code === "P2002") {
    return errorBody(409, "CONFLICT", "A record with this value already exists.");
  }
  if (typeof error === "object" && error !== null && (error as { code?: string }).code === "P2025") {
    return errorBody(404, "NOT_FOUND", "Record not found.");
  }
  console.error("[api] Unhandled error:", error);
  return errorBody(500, "INTERNAL", "Something went wrong on our side.");
}

type RouteContext = { params: Promise<Record<string, string>> };

export function withApi(
  handler: (req: NextRequest, ctx: RouteContext) => Promise<NextResponse>,
) {
  return async (req: NextRequest, ctx: RouteContext): Promise<NextResponse> => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

export async function parseBody<T>(schema: ZodType<T>, req: NextRequest): Promise<T> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    throw new ApiError(400, "BAD_REQUEST", "Request body must be valid JSON.");
  }
  const result = schema.safeParse(json);
  if (!result.success) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "Invalid request data.",
      result.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
    );
  }
  return result.data;
}

export function parseQuery<T>(schema: ZodType<T>, url: string): T {
  const { searchParams } = new URL(url);
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  const result = schema.safeParse(params);
  if (!result.success) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "Invalid query parameters.",
      result.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
    );
  }
  return result.data;
}

// Simple fixed-window in-memory rate limiter. Sufficient for a single-region
// serverless demo; swap for Redis/Upstash if multi-instance limits are needed.
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): void {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  bucket.count += 1;
  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) if (v.resetAt < now) buckets.delete(k);
  }
  if (bucket.count > limit) {
    throw new ApiError(429, "RATE_LIMITED", "Too many requests. Please slow down and try again.");
  }
}

export function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}
