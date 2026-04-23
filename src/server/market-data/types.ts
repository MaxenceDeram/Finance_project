import type { AssetType } from "@prisma/client";

export type MarketDataSource =
  | "fmp"
  | "alpha-vantage"
  | "coingecko"
  | "composite"
  | "mock";

export type PriceRange = "1D" | "1W" | "1M" | "6M" | "1Y" | "5Y" | "MAX";

export type AssetLookupResult = {
  symbol: string;
  name: string;
  assetType: AssetType;
  exchange?: string | null;
  currency: string;
  sector?: string | null;
  country?: string | null;
  isin?: string | null;
  provider?: MarketDataSource | string | null;
  providerId?: string | null;
  exchangeName?: string | null;
  industry?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  website?: string | null;
  marketCap?: number | null;
};

export type MarketQuote = {
  symbol: string;
  price: number;
  currency: string;
  timestamp: Date;
  provider: MarketDataSource | string;
  change?: number | null;
  changePercent?: number | null;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  previousClose?: number | null;
  volume?: number | null;
  isRealtime?: boolean;
};

export type HistoricalPrice = {
  timestamp: Date;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  close: number;
  volume?: number | null;
};

export type MarketNewsItem = {
  id: string;
  provider: MarketDataSource | string;
  symbol?: string | null;
  title: string;
  summary?: string | null;
  source?: string | null;
  url?: string | null;
  imageUrl?: string | null;
  sentiment?: string | null;
  publishedAt: Date;
};

export type AssetProfile = AssetLookupResult & {
  marketCap?: number | null;
  peRatio?: number | null;
  dividendYield?: number | null;
  beta?: number | null;
  dayLow?: number | null;
  dayHigh?: number | null;
  yearLow?: number | null;
  yearHigh?: number | null;
  open?: number | null;
  previousClose?: number | null;
  bid?: number | null;
  ask?: number | null;
};

export interface MarketDataProvider {
  readonly name: MarketDataSource | string;
  searchAssets(query: string): Promise<AssetLookupResult[]>;
  getLatestQuote(asset: AssetLookupResult): Promise<MarketQuote>;
  getHistoricalPrices(
    asset: AssetLookupResult,
    days: number,
    range?: PriceRange
  ): Promise<HistoricalPrice[]>;
  getAssetProfile?(asset: AssetLookupResult): Promise<AssetProfile | null>;
  getNews?(asset?: AssetLookupResult, limit?: number): Promise<MarketNewsItem[]>;
}
