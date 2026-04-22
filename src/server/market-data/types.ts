import type { AssetType } from "@prisma/client";

export type AssetLookupResult = {
  symbol: string;
  name: string;
  assetType: AssetType;
  exchange?: string | null;
  currency: string;
  sector?: string | null;
  country?: string | null;
};

export type MarketQuote = {
  symbol: string;
  price: number;
  currency: string;
  timestamp: Date;
};

export type HistoricalPrice = {
  timestamp: Date;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  close: number;
  volume?: number | null;
};

export interface MarketDataProvider {
  searchAssets(query: string): Promise<AssetLookupResult[]>;
  getLatestQuote(asset: AssetLookupResult): Promise<MarketQuote>;
  getHistoricalPrices(asset: AssetLookupResult, days: number): Promise<HistoricalPrice[]>;
}
