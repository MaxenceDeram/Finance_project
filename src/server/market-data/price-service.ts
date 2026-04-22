import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { getMarketDataProvider } from "./provider";
import type {
  AssetLookupResult,
  HistoricalPrice,
  MarketNewsItem,
  PriceRange
} from "./types";

export async function getLatestPriceForAsset(asset: AssetLookupResult & { id?: string }) {
  const provider = getMarketDataProvider();
  const quote = await provider.getLatestQuote(asset);

  if (asset.id) {
    await prisma.assetPrice.upsert({
      where: {
        assetId_timestamp: {
          assetId: asset.id,
          timestamp: quote.timestamp
        }
      },
      update: {
        close: new Prisma.Decimal(quote.price)
      },
      create: {
        assetId: asset.id,
        timestamp: quote.timestamp,
        open: quote.open == null ? null : new Prisma.Decimal(quote.open),
        high: quote.high == null ? null : new Prisma.Decimal(quote.high),
        low: quote.low == null ? null : new Prisma.Decimal(quote.low),
        close: new Prisma.Decimal(quote.price)
      }
    });
  }

  return quote;
}

export async function getHistoricalPricesForAsset(
  asset: AssetLookupResult & { id?: string },
  days = 90,
  range?: PriceRange
) {
  const provider = getMarketDataProvider();
  const rows = await provider.getHistoricalPrices(asset, days, range);

  if (asset.id) {
    await persistHistoricalPrices(asset.id, rows);
  }

  return rows;
}

export async function backfillMockHistory(
  asset: AssetLookupResult & { id: string },
  days = 90
) {
  const rows = await getHistoricalPricesForAsset(asset, days);
  return rows;
}

export async function persistHistoricalPrices(assetId: string, rows: HistoricalPrice[]) {
  for (const row of rows) {
    await prisma.assetPrice.upsert({
      where: {
        assetId_timestamp: {
          assetId,
          timestamp: row.timestamp
        }
      },
      update: {
        open: row.open == null ? null : new Prisma.Decimal(row.open),
        high: row.high == null ? null : new Prisma.Decimal(row.high),
        low: row.low == null ? null : new Prisma.Decimal(row.low),
        close: new Prisma.Decimal(row.close),
        volume: row.volume == null ? null : new Prisma.Decimal(row.volume)
      },
      create: {
        assetId,
        timestamp: row.timestamp,
        open: row.open == null ? null : new Prisma.Decimal(row.open),
        high: row.high == null ? null : new Prisma.Decimal(row.high),
        low: row.low == null ? null : new Prisma.Decimal(row.low),
        close: new Prisma.Decimal(row.close),
        volume: row.volume == null ? null : new Prisma.Decimal(row.volume)
      }
    });
  }
}

export async function getAssetProfileFromMarket(asset: AssetLookupResult) {
  const provider = getMarketDataProvider();
  return provider.getAssetProfile?.(asset) ?? null;
}

export async function getMarketNews(input?: {
  asset?: AssetLookupResult & { id?: string };
  limit?: number;
}) {
  const provider = getMarketDataProvider();
  const limit = input?.limit ?? 12;
  const news = provider.getNews ? await provider.getNews(input?.asset, limit) : [];

  if (news.length > 0) {
    await persistMarketNews(news, input?.asset?.id);
    return news;
  }

  return readPersistedMarketNews(input?.asset?.id, input?.asset?.symbol, limit);
}

async function persistMarketNews(news: MarketNewsItem[], assetId?: string) {
  for (const item of news) {
    await prisma.marketNews.upsert({
      where: {
        provider_externalId: {
          provider: item.provider,
          externalId: item.id
        }
      },
      update: {
        assetId: assetId ?? null,
        symbol: item.symbol ?? null,
        title: item.title,
        summary: item.summary ?? null,
        source: item.source ?? null,
        url: item.url ?? null,
        imageUrl: item.imageUrl ?? null,
        sentiment: item.sentiment ?? null,
        publishedAt: item.publishedAt,
        fetchedAt: new Date()
      },
      create: {
        assetId: assetId ?? null,
        symbol: item.symbol ?? null,
        provider: item.provider,
        externalId: item.id,
        title: item.title,
        summary: item.summary ?? null,
        source: item.source ?? null,
        url: item.url ?? null,
        imageUrl: item.imageUrl ?? null,
        sentiment: item.sentiment ?? null,
        publishedAt: item.publishedAt
      }
    });
  }
}

async function readPersistedMarketNews(
  assetId?: string,
  symbol?: string | null,
  limit = 12
): Promise<MarketNewsItem[]> {
  const rows = await prisma.marketNews.findMany({
    where: assetId
      ? { assetId }
      : symbol
        ? {
            OR: [{ symbol }, { symbol: null }]
          }
        : undefined,
    orderBy: { publishedAt: "desc" },
    take: limit
  });

  return rows.map((row) => ({
    id: row.externalId ?? row.id,
    provider: row.provider,
    symbol: row.symbol,
    title: row.title,
    summary: row.summary,
    source: row.source,
    url: row.url,
    imageUrl: row.imageUrl,
    sentiment: row.sentiment,
    publishedAt: row.publishedAt
  }));
}
