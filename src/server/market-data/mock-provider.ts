import { AssetType } from "@prisma/client";
import { addDaysUtc, startOfUtcDay } from "@/lib/dates";
import { deterministicMarketPrice } from "@/features/assets/market-simulation";
import type {
  AssetLookupResult,
  AssetProfile,
  HistoricalPrice,
  MarketDataProvider,
  MarketNewsItem,
  PriceRange
} from "./types";

const catalog: AssetLookupResult[] = [
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    assetType: AssetType.STOCK,
    exchange: "NASDAQ",
    currency: "EUR",
    sector: "Electronics",
    country: "United States"
  },
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
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    assetType: AssetType.STOCK,
    exchange: "NASDAQ",
    currency: "EUR",
    sector: "Internet",
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
    symbol: "ETH",
    name: "Ethereum",
    assetType: AssetType.CRYPTO,
    exchange: "CRYPTO",
    currency: "EUR",
    sector: "Digital Assets",
    country: null
  },
  {
    symbol: "SOL",
    name: "Solana",
    assetType: AssetType.CRYPTO,
    exchange: "CRYPTO",
    currency: "EUR",
    sector: "Digital Assets",
    country: null
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
  readonly name = "mock";

  async searchAssets(query: string) {
    const normalized = query.trim().toUpperCase();
    if (!normalized) {
      return catalog.slice(0, 8).map((item) => ({ ...item, provider: this.name }));
    }

    const matches = catalog.filter(
      (item) =>
        item.symbol.includes(normalized) || item.name.toUpperCase().includes(normalized)
    );

    if (matches.length > 0) {
      return matches.map((item) => ({ ...item, provider: this.name }));
    }

    return [
      {
        symbol: normalized,
        name: `${normalized} simulated asset`,
        assetType: AssetType.STOCK,
        exchange: "MOCK",
        currency: "EUR",
        sector: "Simulation",
        country: "Development",
        provider: this.name
      }
    ];
  }

  async getLatestQuote(asset: AssetLookupResult) {
    return {
      symbol: asset.symbol,
      price: deterministicPrice(asset.symbol, new Date()),
      currency: asset.currency,
      timestamp: new Date(),
      provider: this.name,
      change: 0,
      changePercent: 0,
      isRealtime: false
    };
  }

  async getHistoricalPrices(
    asset: AssetLookupResult,
    days: number,
    _range?: PriceRange
  ): Promise<HistoricalPrice[]> {
    void _range;
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

  async getAssetProfile(asset: AssetLookupResult): Promise<AssetProfile> {
    const price = deterministicPrice(asset.symbol, new Date());

    return {
      ...asset,
      provider: this.name,
      providerId: asset.providerId ?? asset.symbol,
      description:
        asset.description ??
        `${asset.name} est affiche via le provider mock de secours. Configurez une API de marche pour obtenir des donnees reelles.`,
      marketCap: price * 1_000_000_000,
      dayLow: price * 0.985,
      dayHigh: price * 1.015,
      yearLow: price * 0.65,
      yearHigh: price * 1.35,
      open: price * 0.995,
      previousClose: price * 0.99,
      bid: price * 0.999,
      ask: price * 1.001
    };
  }

  async getNews(asset?: AssetLookupResult, limit = 6): Promise<MarketNewsItem[]> {
    return Array.from({ length: Math.min(limit, 3) }, (_, index) => ({
      id: `mock-news-${asset?.symbol ?? "market"}-${index}`,
      provider: this.name,
      symbol: asset?.symbol ?? null,
      title:
        index === 0
          ? "Configurez Alpha Vantage pour activer les actualites de marche"
          : "Waren conserve les actualites mockees uniquement en secours",
      summary:
        "Cette carte est un fallback local. Les actualites reelles sont chargees via le provider market data configure.",
      source: "Waren mock",
      url: null,
      imageUrl: null,
      sentiment: "Neutral",
      publishedAt: new Date(Date.now() - index * 60 * 60 * 1000)
    }));
  }
}

function deterministicPrice(symbol: string, date: Date) {
  return deterministicMarketPrice(symbol, date);
}
