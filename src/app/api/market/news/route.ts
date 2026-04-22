import { NextResponse } from "next/server";
import { getMarketNews } from "@/server/market-data/price-service";
import { getSafeErrorMessage } from "@/lib/errors";
import { assertRateLimit } from "@/server/security/rate-limit";
import { requireUser } from "@/server/security/sessions";

export async function GET() {
  const user = await requireUser();

  try {
    assertRateLimit({
      key: `market-news:${user.id}`,
      limit: 60,
      windowMs: 60 * 1000
    });

    const news = await getMarketNews({ limit: 16 });
    return NextResponse.json({ news });
  } catch (error) {
    return NextResponse.json({ message: getSafeErrorMessage(error) }, { status: 400 });
  }
}
