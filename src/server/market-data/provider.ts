import { getEnv } from "@/config/env";
import { MockMarketDataProvider } from "./mock-provider";
import type { MarketDataProvider } from "./types";

let provider: MarketDataProvider | null = null;

export function getMarketDataProvider() {
  if (provider) {
    return provider;
  }

  const env = getEnv();

  switch (env.MARKET_DATA_PROVIDER) {
    case "mock":
    default:
      provider = new MockMarketDataProvider();
      return provider;
  }
}
