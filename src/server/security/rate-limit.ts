import { AppError } from "@/lib/errors";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

export function assertRateLimit({ key, limit, windowMs }: RateLimitOptions) {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (existing.count >= limit) {
    throw new AppError(
      "RATE_LIMITED",
      "Trop de tentatives. Reessayez dans quelques minutes.",
      429
    );
  }

  existing.count += 1;
}

export function clearExpiredRateLimitBuckets() {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}
