import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { getEnv, isProduction } from "@/config/env";
import { prisma } from "@/server/db/prisma";
import { createRandomToken, hashSessionToken } from "./crypto";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

export async function createSession(input: {
  userId: string;
  userAgent?: string;
  ipHash?: string | null;
}) {
  const env = getEnv();
  const token = createRandomToken(48);
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await prisma.session.create({
    data: {
      userId: input.userId,
      tokenHash,
      expiresAt,
      userAgent: input.userAgent,
      ipHash: input.ipHash
    }
  });

  const cookieStore = await cookies();
  cookieStore.set(env.SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction(),
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS
  });
}

export async function destroyCurrentSession() {
  const env = getEnv();
  const cookieStore = await cookies();
  const token = cookieStore.get(env.SESSION_COOKIE_NAME)?.value;

  if (token) {
    await prisma.session.deleteMany({
      where: { tokenHash: hashSessionToken(token) }
    });
  }

  cookieStore.delete(env.SESSION_COOKIE_NAME);
}

export async function getCurrentSession() {
  const env = getEnv();
  const cookieStore = await cookies();
  const token = cookieStore.get(env.SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    include: { user: true }
  });

  if (!session || session.expiresAt <= new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    cookieStore.delete(env.SESSION_COOKIE_NAME);
    return null;
  }

  await prisma.session.update({
    where: { id: session.id },
    data: { lastSeenAt: new Date() }
  });

  return session;
}

export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user ?? null;
}

export async function requireUser(options: { requireVerified?: boolean } = {}) {
  const user = await getCurrentUser();
  const requireVerified = options.requireVerified ?? true;

  if (!user) {
    redirect("/login");
  }

  if (requireVerified && !user.emailVerified) {
    redirect(`/auth/resend-confirmation?email=${encodeURIComponent(user.email)}`);
  }

  return user;
}

export function decimal(value: Prisma.Decimal.Value) {
  return new Prisma.Decimal(value);
}
