import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { getMarketDataProvider } from "@/server/market-data/provider";
import { backfillMockHistory } from "@/server/market-data/price-service";
import type { AssetLookupResult } from "@/server/market-data/types";
import { assetInputSchema } from "@/validation/assets";

export async function searchAssets(query: string) {
  const local = await prisma.asset.findMany({
    where: {
      OR: [
        { symbol: { contains: query, mode: "insensitive" } },
        { name: { contains: query, mode: "insensitive" } }
      ]
    },
    take: 10,
    orderBy: { symbol: "asc" }
  });

  if (local.length >= 5) {
    return local;
  }

  const provider = getMarketDataProvider();
  const external = await provider.searchAssets(query);
  return [...local, ...external].slice(0, 10);
}

export async function findOrCreateAsset(input: unknown) {
  const parsed = assetInputSchema.parse(input);
  const exchange = parsed.exchange || null;

  const existing = await prisma.asset.findFirst({
    where: {
      symbol: parsed.symbol,
      exchange,
      currency: parsed.currency
    }
  });

  if (existing) {
    return existing;
  }

  const created = await prisma.asset.create({
    data: {
      symbol: parsed.symbol,
      name: parsed.name,
      assetType: parsed.assetType,
      exchange,
      currency: parsed.currency,
      sector: parsed.sector || null,
      country: parsed.country || null
    }
  });

  await backfillMockHistory({
    ...toLookup(created),
    id: created.id
  });

  return created;
}

export function toLookup(asset: {
  symbol: string;
  name: string;
  assetType: AssetLookupResult["assetType"];
  exchange: string | null;
  currency: string;
  sector: string | null;
  country: string | null;
}): AssetLookupResult {
  return {
    symbol: asset.symbol,
    name: asset.name,
    assetType: asset.assetType,
    exchange: asset.exchange,
    currency: asset.currency,
    sector: asset.sector,
    country: asset.country
  };
}

export async function listAssets() {
  return prisma.asset.findMany({
    orderBy: [{ symbol: "asc" }],
    include: {
      prices: {
        orderBy: { timestamp: "desc" },
        take: 1
      }
    }
  });
}

export function decimal(value: Prisma.Decimal.Value) {
  return new Prisma.Decimal(value);
}
