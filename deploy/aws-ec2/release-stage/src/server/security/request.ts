import { headers } from "next/headers";
import { AppError } from "@/lib/errors";
import { hashIp } from "./crypto";

export async function getRequestMetadata() {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() ?? headerStore.get("x-real-ip");

  return {
    ip,
    ipHash: hashIp(ip),
    userAgent: headerStore.get("user-agent") ?? undefined
  };
}

export async function assertSameOrigin() {
  const headerStore = await headers();
  const origin = headerStore.get("origin");
  const host = headerStore.get("host");

  if (!origin || !host) {
    return;
  }

  const originHost = new URL(origin).host;

  if (originHost !== host) {
    throw new AppError("FORBIDDEN", "Requete refusee.", 403);
  }
}
