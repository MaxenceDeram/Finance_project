import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";

export async function getCachedMarketData<T>(key: string): Promise<T | null> {
  const cached = await prisma.marketDataCache.findUnique({
    where: { key }
  });

  if (!cached || cached.expiresAt <= new Date()) {
    return null;
  }

  return cached.payload as T;
}

export async function setCachedMarketData<T>(input: {
  key: string;
  provider: string;
  ttlSeconds: number;
  payload: T;
}) {
  const expiresAt = new Date(Date.now() + input.ttlSeconds * 1000);

  await prisma.marketDataCache.upsert({
    where: { key: input.key },
    update: {
      provider: input.provider,
      payload: input.payload as Prisma.InputJsonValue,
      expiresAt
    },
    create: {
      key: input.key,
      provider: input.provider,
      payload: input.payload as Prisma.InputJsonValue,
      expiresAt
    }
  });

  return input.payload;
}

export async function cachedMarketData<T>(input: {
  key: string;
  provider: string;
  ttlSeconds: number;
  fetcher: () => Promise<T>;
}) {
  const cached = await getCachedMarketData<T>(input.key);
  if (cached) {
    return cached;
  }

  const payload = await input.fetcher();
  await setCachedMarketData({
    key: input.key,
    provider: input.provider,
    ttlSeconds: input.ttlSeconds,
    payload
  });
  return payload;
}
