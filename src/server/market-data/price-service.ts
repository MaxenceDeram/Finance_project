import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { getMarketDataProvider } from "./provider";
import type { AssetLookupResult } from "./types";

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
        close: new Prisma.Decimal(quote.price)
      }
    });
  }

  return quote;
}

export async function backfillMockHistory(asset: AssetLookupResult & { id: string }, days = 90) {
  const provider = getMarketDataProvider();
  const rows = await provider.getHistoricalPrices(asset, days);

  for (const row of rows) {
    await prisma.assetPrice.upsert({
      where: {
        assetId_timestamp: {
          assetId: asset.id,
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
        assetId: asset.id,
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
