import { AssetType } from "@prisma/client";
import { getEnv } from "@/config/env";
import { cachedMarketData } from "./cache";
import { buildUrl, fetchJson } from "./http";
import type {
  AssetLookupResult,
  AssetProfile,
  HistoricalPrice,
  MarketDataProvider,
  MarketNewsItem,
  MarketQuote,
  PriceRange
} from "./types";

type CoinGeckoSearchResponse = {
  coins?: Array<{
    id: string;
    name: string;
    symbol: string;
    market_cap_rank?: number | null;
    thumb?: string;
    large?: string;
  }>;
};

type CoinGeckoPriceResponse = Record<
  string,
  {
    [key: string]: number | null | undefined;
    eur?: number;
    eur_market_cap?: number;
    eur_24h_vol?: number;
    eur_24h_change?: number | null;
    last_updated_at?: number;
    usd?: number;
    usd_market_cap?: number;
    usd_24h_vol?: number;
    usd_24h_change?: number | null;
  }
>;

type CoinGeckoMarketChartResponse = {
  prices?: Array<[number, number]>;
  market_caps?: Array<[number, number]>;
  total_volumes?: Array<[number, number]>;
};

type CoinGeckoCoinResponse = {
  id: string;
  symbol: string;
  name: string;
  image?: { thumb?: string; small?: string; large?: string };
  description?: { en?: string };
  links?: { homepage?: string[] };
  market_cap_rank?: number | null;
  market_data?: {
    current_price?: Record<string, number>;
    market_cap?: Record<string, number>;
    high_24h?: Record<string, number>;
    low_24h?: Record<string, number>;
    price_change_24h_in_currency?: Record<string, number>;
    price_change_percentage_24h_in_currency?: Record<string, number>;
    total_volume?: Record<string, number>;
  };
  categories?: string[];
};

export class CoinGeckoProvider implements MarketDataProvider {
  readonly name = "coingecko";

  private get baseUrl() {
    return getEnv().COINGECKO_API_BASE_URL.replace(/\/$/, "");
  }

  async searchAssets(query: string): Promise<AssetLookupResult[]> {
    if (query.trim().length < 1) {
      return this.popularCryptoAssets();
    }

    const response = await this.cached<CoinGeckoSearchResponse>(
      `coingecko:search:${query.trim().toLowerCase()}`,
      getEnv().MARKET_DATA_HISTORY_CACHE_TTL_SECONDS,
      () =>
        fetchJson<CoinGeckoSearchResponse>(
          this.withKey(buildUrl(`${this.baseUrl}/search`, { query }))
        )
    );

    return (response.coins ?? []).slice(0, 15).map((coin) => this.toLookup(coin));
  }

  async getLatestQuote(asset: AssetLookupResult): Promise<MarketQuote> {
    const id = asset.providerId || normalizeCoinId(asset.symbol);
    const currency = normalizeCurrency(asset.currency);
    const response = await this.cached<CoinGeckoPriceResponse>(
      `coingecko:quote:${id}:${currency}`,
      getEnv().MARKET_DATA_CACHE_TTL_SECONDS,
      () =>
        fetchJson<CoinGeckoPriceResponse>(
          this.withKey(
            buildUrl(`${this.baseUrl}/simple/price`, {
              ids: id,
              vs_currencies: currency,
              include_market_cap: true,
              include_24hr_vol: true,
              include_24hr_change: true,
              include_last_updated_at: true
            })
          )
        )
    );

    const row = response[id];
    const price = row?.[currency];
    if (!row || typeof price !== "number") {
      throw new Error(`No CoinGecko quote for ${id}.`);
    }

    return {
      symbol: asset.symbol,
      price,
      currency: currency.toUpperCase(),
      timestamp: row.last_updated_at ? new Date(row.last_updated_at * 1000) : new Date(),
      provider: this.name,
      changePercent: row[`${currency}_24h_change`],
      volume: row[`${currency}_24h_vol`],
      isRealtime: true
    };
  }

  async getHistoricalPrices(
    asset: AssetLookupResult,
    days: number,
    range?: PriceRange
  ): Promise<HistoricalPrice[]> {
    const id = asset.providerId || normalizeCoinId(asset.symbol);
    const currency = normalizeCurrency(asset.currency);
    const response = await this.cached<CoinGeckoMarketChartResponse>(
      `coingecko:history:${id}:${currency}:${range ?? days}`,
      getEnv().MARKET_DATA_HISTORY_CACHE_TTL_SECONDS,
      () =>
        fetchJson<CoinGeckoMarketChartResponse>(
          this.withKey(
            buildUrl(`${this.baseUrl}/coins/${encodeURIComponent(id)}/market_chart`, {
              vs_currency: currency,
              days: mapDaysForRange(range, days),
              interval: days > 90 ? "daily" : undefined
            })
          )
        )
    );

    const volumes = new Map(
      (response.total_volumes ?? []).map(([timestamp, volume]) => [timestamp, volume])
    );

    return (response.prices ?? []).map(([timestamp, price]) => ({
      timestamp: new Date(timestamp),
      close: price,
      volume: volumes.get(timestamp) ?? null
    }));
  }

  async getAssetProfile(asset: AssetLookupResult): Promise<AssetProfile | null> {
    const id = asset.providerId || normalizeCoinId(asset.symbol);
    const response = await this.cached<CoinGeckoCoinResponse>(
      `coingecko:profile:${id}`,
      getEnv().MARKET_DATA_HISTORY_CACHE_TTL_SECONDS,
      () =>
        fetchJson<CoinGeckoCoinResponse>(
          this.withKey(
            buildUrl(`${this.baseUrl}/coins/${encodeURIComponent(id)}`, {
              localization: false,
              tickers: false,
              market_data: true,
              community_data: false,
              developer_data: false,
              sparkline: false
            })
          )
        )
    );

    const currency = normalizeCurrency(asset.currency);
    const market = response.market_data;

    return {
      ...asset,
      symbol: response.symbol?.toUpperCase() || asset.symbol,
      name: response.name || asset.name,
      assetType: AssetType.CRYPTO,
      provider: this.name,
      providerId: response.id,
      exchange: "CRYPTO",
      exchangeName: "Crypto spot",
      sector: response.categories?.[0] ?? "Digital Assets",
      description: stripHtml(response.description?.en ?? asset.description ?? ""),
      logoUrl: response.image?.large ?? response.image?.small ?? asset.logoUrl,
      website: response.links?.homepage?.find(Boolean) ?? asset.website,
      marketCap: market?.market_cap?.[currency] ?? asset.marketCap,
      dayHigh: market?.high_24h?.[currency] ?? null,
      dayLow: market?.low_24h?.[currency] ?? null
    };
  }

  async getNews(): Promise<MarketNewsItem[]> {
    return [];
  }

  private popularCryptoAssets(): AssetLookupResult[] {
    return [
      { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
      { id: "ethereum", symbol: "ETH", name: "Ethereum" },
      { id: "solana", symbol: "SOL", name: "Solana" },
      { id: "chainlink", symbol: "LINK", name: "Chainlink" },
      { id: "cardano", symbol: "ADA", name: "Cardano" }
    ].map((coin) =>
      this.toLookup({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        market_cap_rank: null
      })
    );
  }

  private toLookup(coin: {
    id: string;
    name: string;
    symbol: string;
    market_cap_rank?: number | null;
    thumb?: string;
    large?: string;
  }): AssetLookupResult {
    return {
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      assetType: AssetType.CRYPTO,
      exchange: "CRYPTO",
      exchangeName: "Crypto spot",
      currency: "EUR",
      sector: "Digital Assets",
      country: "Global",
      provider: this.name,
      providerId: coin.id,
      logoUrl: coin.large ?? coin.thumb ?? null
    };
  }

  private cached<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>) {
    return cachedMarketData({
      key,
      provider: this.name,
      ttlSeconds,
      fetcher
    });
  }

  private withKey(url: string) {
    const key = getEnv().COINGECKO_API_KEY;
    if (!key) {
      return url;
    }

    const parsed = new URL(url);
    parsed.searchParams.set(
      parsed.hostname.startsWith("pro-api") ? "x_cg_pro_api_key" : "x_cg_demo_api_key",
      key
    );
    return parsed.toString();
  }
}

function normalizeCurrency(currency: string) {
  return (currency || "EUR").toLowerCase();
}

function normalizeCoinId(symbol: string) {
  const map: Record<string, string> = {
    BTC: "bitcoin",
    ETH: "ethereum",
    SOL: "solana",
    LINK: "chainlink",
    ADA: "cardano",
    XRP: "ripple",
    DOGE: "dogecoin"
  };

  return map[symbol.toUpperCase()] ?? symbol.toLowerCase();
}

function mapDaysForRange(range: PriceRange | undefined, fallback: number) {
  switch (range) {
    case "1D":
      return 1;
    case "1W":
      return 7;
    case "1M":
      return 30;
    case "6M":
      return 180;
    case "1Y":
      return 365;
    case "5Y":
      return 1825;
    case "MAX":
      return "max";
    default:
      return fallback;
  }
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
