import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { Session, User } from "@prisma/client";
import { prisma } from "./db";
import { ApiError } from "./http";

export const SESSION_COOKIE = "sid";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function setSessionCookie(token: string, maxAgeMs: number): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(maxAgeMs / 1000),
  });
}

export async function createSession(userId: string | null): Promise<Session> {
  const token = randomBytes(32).toString("hex");
  const session = await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    },
  });
  await setSessionCookie(token, SESSION_TTL_MS);
  return session;
}

export type SessionWithUser = Session & { user: User | null };

export async function getSession(): Promise<SessionWithUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
    store.delete(SESSION_COOKIE);
    return null;
  }
  // Sliding renewal: extend sessions that are past half of their lifetime.
  if (session.expiresAt.getTime() - Date.now() < SESSION_TTL_MS / 2) {
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    await prisma.session.update({ where: { id: session.id }, data: { expiresAt } });
    await setSessionCookie(token, SESSION_TTL_MS);
    session.expiresAt = expiresAt;
  }
  return session;
}

export async function getOrCreateSession(): Promise<SessionWithUser> {
  const existing = await getSession();
  if (existing) return existing;
  const session = await createSession(null);
  const withUser = await prisma.session.findUnique({
    where: { id: session.id },
    include: { user: true },
  });
  return withUser!;
}

export async function getSessionUser(): Promise<User | null> {
  const session = await getSession();
  return session?.user ?? null;
}

export async function requireUser(): Promise<User> {
  const user = await getSessionUser();
  if (!user) throw new ApiError(401, "UNAUTHENTICATED", "Sign in to continue.");
  return user;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  store.delete(SESSION_COOKIE);
}
