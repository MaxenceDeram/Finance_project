import { AssetType } from "@prisma/client";
import { NextResponse } from "next/server";
import { getHistoricalPricesForAsset } from "@/server/market-data/price-service";
import { getSafeErrorMessage } from "@/lib/errors";
import { assertRateLimit } from "@/server/security/rate-limit";
import { requireUser } from "@/server/security/sessions";
import type { PriceRange } from "@/server/market-data/types";

export async function GET(request: Request) {
  const user = await requireUser();

  try {
    const url = new URL(request.url);
    const symbol = (url.searchParams.get("symbol") ?? "").trim().toUpperCase();
    const range = parseRange(url.searchParams.get("range"));

    assertRateLimit({
      key: `market-history:${user.id}`,
      limit: 90,
      windowMs: 60 * 1000
    });

    if (!symbol) {
      return NextResponse.json({ message: "Symbole manquant." }, { status: 400 });
    }

    const history = await getHistoricalPricesForAsset(
      {
        symbol,
        name: url.searchParams.get("name") ?? symbol,
        assetType: parseAssetType(url.searchParams.get("assetType")),
        exchange: url.searchParams.get("exchange"),
        currency: url.searchParams.get("currency") ?? "EUR",
        sector: url.searchParams.get("sector"),
        country: url.searchParams.get("country"),
        provider: url.searchParams.get("provider"),
        providerId: url.searchParams.get("providerId")
      },
      daysForRange(range),
      range
    );

    return NextResponse.json({ history });
  } catch (error) {
    return NextResponse.json({ message: getSafeErrorMessage(error) }, { status: 400 });
  }
}

function parseAssetType(value: string | null) {
  if (value && value in AssetType) {
    return value as AssetType;
  }

  return AssetType.STOCK;
}

function parseRange(value: string | null): PriceRange {
  const allowed: PriceRange[] = ["1D", "1W", "1M", "6M", "1Y", "5Y", "MAX"];
  return allowed.includes(value as PriceRange) ? (value as PriceRange) : "1M";
}

function daysForRange(range: PriceRange) {
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
      return 3650;
  }
}
