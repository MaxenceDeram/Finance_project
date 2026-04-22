import { getEnv } from "@/config/env";

export class MarketDataHttpError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message);
    this.name = "MarketDataHttpError";
  }
}

export async function fetchJson<T>(
  url: string,
  init?: RequestInit & { timeoutMs?: number }
): Promise<T> {
  const env = getEnv();
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    init?.timeoutMs ?? env.MARKET_DATA_HTTP_TIMEOUT_MS
  );

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "Waren/0.1 personal paper trading",
        ...init?.headers
      },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new MarketDataHttpError(
        `Market data request failed: ${response.status}`,
        response.status
      );
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export function buildUrl(
  baseUrl: string,
  params: Record<string, string | number | boolean | null | undefined>
) {
  const url = new URL(baseUrl);
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}
