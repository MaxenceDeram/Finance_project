import { AssetType } from "@prisma/client";
import { AlphaVantageProvider } from "./alpha-vantage-provider";
import { CoinGeckoProvider } from "./coingecko-provider";
import { MockMarketDataProvider } from "./mock-provider";
import type {
  AssetLookupResult,
  AssetProfile,
  HistoricalPrice,
  MarketDataProvider,
  MarketNewsItem,
  MarketQuote,
  PriceRange
} from "./types";

export class CompositeMarketDataProvider implements MarketDataProvider {
  readonly name = "composite";

  private readonly alpha = new AlphaVantageProvider();
  private readonly coingecko = new CoinGeckoProvider();
  private readonly fallback = new MockMarketDataProvider();

  async searchAssets(query: string): Promise<AssetLookupResult[]> {
    const providers =
      query.trim().length === 0
        ? [this.coingecko, this.fallback]
        : [this.alpha, this.coingecko, this.fallback];

    const settled = await Promise.allSettled(
      providers.map((provider) => provider.searchAssets(query))
    );

    return dedupeAssets(
      settled.flatMap((result) => (result.status === "fulfilled" ? result.value : []))
    ).slice(0, 40);
  }

  async getLatestQuote(asset: AssetLookupResult): Promise<MarketQuote> {
    return this.withFallback((provider) => provider.getLatestQuote(asset), asset);
  }

  async getHistoricalPrices(
    asset: AssetLookupResult,
    days: number,
    range?: PriceRange
  ): Promise<HistoricalPrice[]> {
    return this.withFallback(
      (provider) => provider.getHistoricalPrices(asset, days, range),
      asset
    );
  }

  async getAssetProfile(asset: AssetLookupResult): Promise<AssetProfile | null> {
    const provider = this.pickProvider(asset);
    if (provider.getAssetProfile) {
      try {
        const profile = await provider.getAssetProfile(asset);
        if (profile) {
          return profile;
        }
      } catch {
        // fall through to mock provider
      }
    }

    return this.fallback.getAssetProfile?.(asset) ?? null;
  }

  async getNews(asset?: AssetLookupResult, limit = 12): Promise<MarketNewsItem[]> {
    const providers = asset?.assetType === AssetType.CRYPTO ? [this.alpha] : [this.alpha];
    const settled = await Promise.allSettled(
      providers.map((provider) => provider.getNews?.(asset, limit) ?? Promise.resolve([]))
    );

    const news = settled
      .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, limit);

    return news.length > 0 ? news : (this.fallback.getNews?.(asset, limit) ?? []);
  }

  private async withFallback<T>(
    operation: (provider: MarketDataProvider) => Promise<T>,
    asset: AssetLookupResult
  ): Promise<T> {
    const provider = this.pickProvider(asset);
    try {
      return await operation(provider);
    } catch {
      return operation(this.fallback);
    }
  }

  private pickProvider(asset: AssetLookupResult): MarketDataProvider {
    if (asset.provider === this.coingecko.name || asset.assetType === AssetType.CRYPTO) {
      return this.coingecko;
    }

    if (asset.provider === this.alpha.name) {
      return this.alpha;
    }

    return this.alpha;
  }
}

function dedupeAssets(assets: AssetLookupResult[]) {
  const byKey = new Map<string, AssetLookupResult>();

  for (const asset of assets) {
    const key = `${asset.symbol}:${asset.exchange ?? ""}:${asset.assetType}`;
    if (!byKey.has(key)) {
      byKey.set(key, asset);
    }
  }

  return Array.from(byKey.values());
}
