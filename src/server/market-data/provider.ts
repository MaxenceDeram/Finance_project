import { getEnv } from "@/config/env";
import { AlphaVantageProvider } from "./alpha-vantage-provider";
import { CoinGeckoProvider } from "./coingecko-provider";
import { CompositeMarketDataProvider } from "./composite-provider";
import { MockMarketDataProvider } from "./mock-provider";
import type { MarketDataProvider } from "./types";

let provider: MarketDataProvider | null = null;

export function getMarketDataProvider() {
  if (provider) {
    return provider;
  }

  const env = getEnv();

  switch (env.MARKET_DATA_PROVIDER) {
    case "alpha-vantage":
      provider = new AlphaVantageProvider();
      return provider;
    case "coingecko":
      provider = new CoinGeckoProvider();
      return provider;
    case "composite":
      provider = new CompositeMarketDataProvider();
      return provider;
    case "mock":
    default:
      provider = new MockMarketDataProvider();
      return provider;
  }
}
