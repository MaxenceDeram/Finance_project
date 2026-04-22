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

type AlphaSearchResponse = {
  bestMatches?: Array<Record<string, string>>;
  Note?: string;
  Information?: string;
  Error?: string;
};

type AlphaGlobalQuoteResponse = {
  "Global Quote"?: Record<string, string>;
  Note?: string;
  Information?: string;
  Error?: string;
};

type AlphaOverviewResponse = Record<string, string>;

type AlphaNewsResponse = {
  feed?: Array<{
    title?: string;
    url?: string;
    time_published?: string;
    authors?: string[];
    summary?: string;
    banner_image?: string;
    source?: string;
    overall_sentiment_label?: string;
  }>;
  Note?: string;
  Information?: string;
};

type AlphaTimeSeriesResponse = Record<
  string,
  Record<string, Record<string, string>> | string
>;

const alphaBaseUrl = "https://www.alphavantage.co/query";

export class AlphaVantageProvider implements MarketDataProvider {
  readonly name = "alpha-vantage";

  private get apiKey() {
    return getEnv().ALPHA_VANTAGE_API_KEY;
  }

  async searchAssets(query: string): Promise<AssetLookupResult[]> {
    if (!this.apiKey || query.trim().length < 1) {
      return [];
    }

    const normalized = query.trim();
    const response = await this.cached<AlphaSearchResponse>(
      `alpha:search:${normalized.toLowerCase()}`,
      getEnv().MARKET_DATA_HISTORY_CACHE_TTL_SECONDS,
      () =>
        fetchJson<AlphaSearchResponse>(
          buildUrl(alphaBaseUrl, {
            function: "SYMBOL_SEARCH",
            keywords: normalized,
            apikey: this.apiKey
          })
        )
    );

    this.assertUsableResponse(response);

    return (response.bestMatches ?? []).slice(0, 15).map((match) => ({
      symbol: match["1. symbol"] ?? normalized.toUpperCase(),
      name: match["2. name"] ?? match["1. symbol"] ?? normalized.toUpperCase(),
      assetType: classifyAsset(match["3. type"]),
      exchange: match["4. region"] ?? null,
      exchangeName: match["4. region"] ?? null,
      currency: match["8. currency"] || "USD",
      country: match["4. region"] ?? null,
      provider: this.name,
      providerId: match["1. symbol"] ?? normalized.toUpperCase()
    }));
  }

  async getLatestQuote(asset: AssetLookupResult): Promise<MarketQuote> {
    if (!this.apiKey) {
      throw new Error("ALPHA_VANTAGE_API_KEY is not configured.");
    }

    const symbol = asset.providerId || asset.symbol;
    const response = await this.cached<AlphaGlobalQuoteResponse>(
      `alpha:quote:${symbol}`,
      getEnv().MARKET_DATA_CACHE_TTL_SECONDS,
      () =>
        fetchJson<AlphaGlobalQuoteResponse>(
          buildUrl(alphaBaseUrl, {
            function: "GLOBAL_QUOTE",
            symbol,
            apikey: this.apiKey
          })
        )
    );

    this.assertUsableResponse(response);

    const quote = response["Global Quote"];
    if (!quote || Object.keys(quote).length === 0) {
      throw new Error(`No Alpha Vantage quote for ${symbol}.`);
    }

    const price = numberFromString(quote["05. price"]);
    const change = numberFromString(quote["09. change"]);
    const changePercent = numberFromString(quote["10. change percent"]?.replace("%", ""));

    return {
      symbol: asset.symbol,
      price,
      currency: asset.currency || "USD",
      timestamp: new Date(),
      provider: this.name,
      open: numberFromString(quote["02. open"]),
      high: numberFromString(quote["03. high"]),
      low: numberFromString(quote["04. low"]),
      volume: numberFromString(quote["06. volume"]),
      previousClose: numberFromString(quote["08. previous close"]),
      change,
      changePercent,
      isRealtime: true
    };
  }

  async getHistoricalPrices(
    asset: AssetLookupResult,
    days: number,
    range?: PriceRange
  ): Promise<HistoricalPrice[]> {
    if (!this.apiKey) {
      throw new Error("ALPHA_VANTAGE_API_KEY is not configured.");
    }

    const symbol = asset.providerId || asset.symbol;
    const intraday = range === "1D" || range === "1W";
    const response = await this.cached<AlphaTimeSeriesResponse>(
      `alpha:history:${symbol}:${range ?? days}`,
      intraday
        ? getEnv().MARKET_DATA_CACHE_TTL_SECONDS
        : getEnv().MARKET_DATA_HISTORY_CACHE_TTL_SECONDS,
      () =>
        fetchJson<AlphaTimeSeriesResponse>(
          buildUrl(alphaBaseUrl, {
            function: intraday ? "TIME_SERIES_INTRADAY" : "TIME_SERIES_DAILY_ADJUSTED",
            symbol,
            interval: intraday ? "15min" : undefined,
            outputsize: days > 120 ? "full" : "compact",
            apikey: this.apiKey
          })
        )
    );

    this.assertUsableResponse(response);

    const seriesKey = Object.keys(response).find((key) => key.includes("Time Series"));
    const series = seriesKey ? response[seriesKey] : null;
    if (!series || typeof series === "string") {
      throw new Error(`No Alpha Vantage historical prices for ${symbol}.`);
    }

    return Object.entries(series)
      .map(([timestamp, row]) => ({
        timestamp: new Date(timestamp),
        open: numberFromString(row["1. open"]),
        high: numberFromString(row["2. high"]),
        low: numberFromString(row["3. low"]),
        close: numberFromString(row["4. close"]),
        volume: numberFromString(row["6. volume"] ?? row["5. volume"])
      }))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .slice(-Math.max(days, 1));
  }

  async getAssetProfile(asset: AssetLookupResult): Promise<AssetProfile | null> {
    if (!this.apiKey || asset.assetType === AssetType.CRYPTO) {
      return null;
    }

    const symbol = asset.providerId || asset.symbol;
    const response = await this.cached<AlphaOverviewResponse>(
      `alpha:profile:${symbol}`,
      24 * 60 * 60,
      () =>
        fetchJson<AlphaOverviewResponse>(
          buildUrl(alphaBaseUrl, {
            function: "OVERVIEW",
            symbol,
            apikey: this.apiKey
          })
        )
    );

    if (!response.Symbol) {
      return null;
    }

    return {
      ...asset,
      symbol: response.Symbol || asset.symbol,
      name: response.Name || asset.name,
      description: response.Description || asset.description,
      exchange: response.Exchange || asset.exchange,
      currency: response.Currency || asset.currency,
      country: response.Country || asset.country,
      sector: response.Sector || asset.sector,
      industry: response.Industry || asset.industry,
      provider: this.name,
      providerId: response.Symbol || symbol,
      marketCap: numberFromString(response.MarketCapitalization),
      peRatio: numberFromString(response.PERatio),
      dividendYield: numberFromString(response.DividendYield),
      beta: numberFromString(response.Beta),
      yearLow: numberFromString(response["52WeekLow"]),
      yearHigh: numberFromString(response["52WeekHigh"])
    };
  }

  async getNews(asset?: AssetLookupResult, limit = 12): Promise<MarketNewsItem[]> {
    if (!this.apiKey) {
      return [];
    }

    const ticker =
      asset?.assetType === AssetType.CRYPTO
        ? `CRYPTO:${asset.symbol}`
        : asset?.providerId || asset?.symbol;

    const response = await this.cached<AlphaNewsResponse>(
      `alpha:news:${ticker ?? "market"}:${limit}`,
      getEnv().MARKET_NEWS_CACHE_TTL_SECONDS,
      () =>
        fetchJson<AlphaNewsResponse>(
          buildUrl(alphaBaseUrl, {
            function: "NEWS_SENTIMENT",
            tickers: ticker,
            topics: ticker ? undefined : "financial_markets",
            limit,
            apikey: this.apiKey
          })
        )
    );

    this.assertUsableResponse(response);

    return (response.feed ?? []).slice(0, limit).map((item) => ({
      id: item.url || `${this.name}:${item.title}`,
      provider: this.name,
      symbol: asset?.symbol ?? null,
      title: item.title || "Actualité de marché",
      summary: item.summary ?? null,
      source: item.source ?? item.authors?.join(", ") ?? null,
      url: item.url ?? null,
      imageUrl: item.banner_image ?? null,
      sentiment: item.overall_sentiment_label ?? null,
      publishedAt: parseAlphaDate(item.time_published)
    }));
  }

  private cached<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>) {
    return cachedMarketData({
      key,
      provider: this.name,
      ttlSeconds,
      fetcher
    });
  }

  private assertUsableResponse(response: {
    Note?: string;
    Information?: string;
    Error?: string;
  }) {
    if (response.Note || response.Information || response.Error) {
      throw new Error(response.Note || response.Information || response.Error);
    }
  }
}

function classifyAsset(type?: string) {
  const normalized = (type ?? "").toLowerCase();
  if (normalized.includes("etf")) {
    return AssetType.ETF;
  }
  if (normalized.includes("fund")) {
    return AssetType.FUND;
  }
  return AssetType.STOCK;
}

function numberFromString(value?: string | null) {
  if (!value || value === "None" || value === "-") {
    return 0;
  }
  const parsed = Number(value.replaceAll(",", ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseAlphaDate(value?: string) {
  if (!value || value.length < 8) {
    return new Date();
  }

  const year = value.slice(0, 4);
  const month = value.slice(4, 6);
  const day = value.slice(6, 8);
  const hour = value.slice(9, 11) || "00";
  const minute = value.slice(11, 13) || "00";
  const second = value.slice(13, 15) || "00";
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
}
