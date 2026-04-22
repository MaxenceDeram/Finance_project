import { AssetType } from "@prisma/client";
import { addDaysUtc, startOfUtcDay } from "@/lib/dates";
import type { AssetLookupResult, HistoricalPrice, MarketDataProvider } from "./types";

const catalog: AssetLookupResult[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    assetType: AssetType.STOCK,
    exchange: "NASDAQ",
    currency: "USD",
    sector: "Technology",
    country: "United States"
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    assetType: AssetType.STOCK,
    exchange: "NASDAQ",
    currency: "USD",
    sector: "Technology",
    country: "United States"
  },
  {
    symbol: "VUSA",
    name: "Vanguard S&P 500 UCITS ETF",
    assetType: AssetType.ETF,
    exchange: "LSE",
    currency: "EUR",
    sector: "Broad Market",
    country: "Ireland"
  },
  {
    symbol: "CW8",
    name: "Amundi MSCI World UCITS ETF",
    assetType: AssetType.ETF,
    exchange: "EPA",
    currency: "EUR",
    sector: "Broad Market",
    country: "France"
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    assetType: AssetType.CRYPTO,
    exchange: "CRYPTO",
    currency: "USD",
    sector: "Digital Assets",
    country: null
  },
  {
    symbol: "SPY",
    name: "SPDR S&P 500 ETF Trust",
    assetType: AssetType.ETF,
    exchange: "NYSE",
    currency: "USD",
    sector: "Broad Market",
    country: "United States"
  }
];

export class MockMarketDataProvider implements MarketDataProvider {
  async searchAssets(query: string) {
    const normalized = query.trim().toUpperCase();
    const matches = catalog.filter(
      (item) =>
        item.symbol.includes(normalized) || item.name.toUpperCase().includes(normalized)
    );

    if (matches.length > 0) {
      return matches;
    }

    return [
      {
        symbol: normalized,
        name: `${normalized} simulated asset`,
        assetType: AssetType.STOCK,
        exchange: "MOCK",
        currency: "EUR",
        sector: "Simulation",
        country: "Development"
      }
    ];
  }

  async getLatestQuote(asset: AssetLookupResult) {
    return {
      symbol: asset.symbol,
      price: deterministicPrice(asset.symbol, new Date()),
      currency: asset.currency,
      timestamp: new Date()
    };
  }

  async getHistoricalPrices(asset: AssetLookupResult, days: number): Promise<HistoricalPrice[]> {
    const end = startOfUtcDay(new Date());
    const start = addDaysUtc(end, -days + 1);

    return Array.from({ length: days }, (_, index) => {
      const timestamp = addDaysUtc(start, index);
      const close = deterministicPrice(asset.symbol, timestamp);
      return {
        timestamp,
        open: close * 0.992,
        high: close * 1.018,
        low: close * 0.981,
        close,
        volume: 100000 + index * 1300
      };
    });
  }
}

function deterministicPrice(symbol: string, date: Date) {
  const seed = Array.from(symbol).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const day = Math.floor(date.getTime() / 86_400_000);
  const trend = Math.sin((day + seed) / 9) * 4 + Math.cos((day + seed) / 21) * 2;
  const base = 20 + (seed % 420);
  return Number((base + trend + (day % 17) * 0.11).toFixed(2));
}
