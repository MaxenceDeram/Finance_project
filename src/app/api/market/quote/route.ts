import { AssetType } from "@prisma/client";
import { NextResponse } from "next/server";
import { getLatestPriceForAsset } from "@/server/market-data/price-service";
import { getSafeErrorMessage } from "@/lib/errors";
import { assertRateLimit } from "@/server/security/rate-limit";
import { requireUser } from "@/server/security/sessions";

export async function GET(request: Request) {
  const user = await requireUser();

  try {
    const url = new URL(request.url);
    const symbol = (url.searchParams.get("symbol") ?? "").trim().toUpperCase();
    const name = url.searchParams.get("name") ?? symbol;
    const assetType = parseAssetType(url.searchParams.get("assetType"));

    assertRateLimit({
      key: `market-quote:${user.id}`,
      limit: 180,
      windowMs: 60 * 1000
    });

    if (!symbol) {
      return NextResponse.json({ message: "Symbole manquant." }, { status: 400 });
    }

    const quote = await getLatestPriceForAsset({
      symbol,
      name,
      assetType,
      exchange: url.searchParams.get("exchange"),
      currency: url.searchParams.get("currency") ?? "EUR",
      sector: url.searchParams.get("sector"),
      country: url.searchParams.get("country"),
      provider: url.searchParams.get("provider"),
      providerId: url.searchParams.get("providerId")
    });

    return NextResponse.json({ quote });
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
