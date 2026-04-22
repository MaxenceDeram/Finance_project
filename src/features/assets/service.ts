import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { getMarketDataProvider } from "@/server/market-data/provider";
import {
  backfillMockHistory,
  getAssetProfileFromMarket,
  getHistoricalPricesForAsset,
  getLatestPriceForAsset,
  getMarketNews
} from "@/server/market-data/price-service";
import type { AssetLookupResult, PriceRange } from "@/server/market-data/types";
import { assetInputSchema } from "@/validation/assets";

export async function searchAssets(query: string) {
  const local = await prisma.asset.findMany({
    where: {
      OR: [
        { symbol: { contains: query, mode: "insensitive" } },
        { name: { contains: query, mode: "insensitive" } }
      ]
    },
    take: 12,
    orderBy: { symbol: "asc" }
  });

  if (local.length >= 8 && query.trim().length > 0) {
    return local.map(toLookup);
  }

  const provider = getMarketDataProvider();
  const external = await provider.searchAssets(query);
  return dedupeSearchResults([...local.map(toLookup), ...external]).slice(0, 30);
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
    await refreshAssetMetadata(existing.id, parsed);
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
      country: parsed.country || null,
      isin: parsed.isin || null,
      provider: parsed.provider || null,
      providerId: parsed.providerId || null,
      exchangeName: parsed.exchangeName || null,
      industry: parsed.industry || null,
      description: parsed.description || null,
      logoUrl: parsed.logoUrl || null,
      website: parsed.website || null,
      marketCap: parsed.marketCap == null ? null : new Prisma.Decimal(parsed.marketCap),
      lastSyncedAt: new Date()
    }
  });

  await backfillMockHistory({
    ...toLookup(created),
    id: created.id
  });

  return created;
}

export async function getAssetBySymbolForUserFacingPage(symbol: string) {
  const normalized = symbol.trim().toUpperCase();
  const existing = await prisma.asset.findFirst({
    where: { symbol: normalized },
    include: {
      prices: {
        orderBy: { timestamp: "desc" },
        take: 1
      }
    }
  });

  if (existing) {
    return existing;
  }

  const [first] = await searchAssets(normalized);
  if (!first) {
    return null;
  }

  return findOrCreateAsset(first);
}

export async function getAssetLiveView(input: {
  symbol: string;
  range?: PriceRange;
  days?: number;
}) {
  const asset = await getAssetBySymbolForUserFacingPage(input.symbol);
  if (!asset) {
    return null;
  }

  const lookup = toLookup(asset);
  const [quote, profile, history, news] = await Promise.all([
    getLatestPriceForAsset({ ...lookup, id: asset.id }),
    getAssetProfileFromMarket(lookup),
    getHistoricalPricesForAsset(
      { ...lookup, id: asset.id },
      input.days ?? 90,
      input.range
    ),
    getMarketNews({ asset: { ...lookup, id: asset.id }, limit: 8 })
  ]);

  const latestProfile = profile ?? lookup;

  if (profile) {
    await refreshAssetMetadata(asset.id, profile);
  }

  return {
    asset: {
      id: asset.id,
      ...latestProfile,
      symbol: latestProfile.symbol,
      name: latestProfile.name
    },
    quote,
    history,
    news
  };
}

export function toLookup(asset: {
  symbol: string;
  name: string;
  assetType: AssetLookupResult["assetType"];
  exchange: string | null;
  currency: string;
  sector: string | null;
  country: string | null;
  isin?: string | null;
  provider?: string | null;
  providerId?: string | null;
  exchangeName?: string | null;
  industry?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  website?: string | null;
  marketCap?: Prisma.Decimal | number | null;
}): AssetLookupResult {
  return {
    symbol: asset.symbol,
    name: asset.name,
    assetType: asset.assetType,
    exchange: asset.exchange,
    currency: asset.currency,
    sector: asset.sector,
    country: asset.country,
    isin: asset.isin,
    provider: asset.provider,
    providerId: asset.providerId,
    exchangeName: asset.exchangeName,
    industry: asset.industry,
    description: asset.description,
    logoUrl: asset.logoUrl,
    website: asset.website,
    marketCap:
      asset.marketCap instanceof Prisma.Decimal
        ? asset.marketCap.toNumber()
        : (asset.marketCap ?? null)
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

async function refreshAssetMetadata(assetId: string, asset: AssetLookupResult) {
  await prisma.asset.update({
    where: { id: assetId },
    data: {
      name: asset.name,
      assetType: asset.assetType,
      exchange: asset.exchange || null,
      currency: asset.currency,
      sector: asset.sector || null,
      country: asset.country || null,
      isin: asset.isin || null,
      provider: asset.provider || null,
      providerId: asset.providerId || null,
      exchangeName: asset.exchangeName || null,
      industry: asset.industry || null,
      description: asset.description || null,
      logoUrl: asset.logoUrl || null,
      website: asset.website || null,
      marketCap: asset.marketCap == null ? null : new Prisma.Decimal(asset.marketCap),
      lastSyncedAt: new Date()
    }
  });
}

function dedupeSearchResults(results: AssetLookupResult[]) {
  const map = new Map<string, AssetLookupResult>();
  for (const item of results) {
    const key = `${item.symbol}:${item.exchange ?? ""}:${item.currency}:${item.assetType}`;
    if (!map.has(key)) {
      map.set(key, item);
    }
  }
  return Array.from(map.values());
}
