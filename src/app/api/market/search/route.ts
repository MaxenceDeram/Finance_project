import { NextResponse } from "next/server";
import { searchAssets } from "@/features/assets/service";
import { getSafeErrorMessage } from "@/lib/errors";
import { assertRateLimit } from "@/server/security/rate-limit";
import { requireUser } from "@/server/security/sessions";

export async function GET(request: Request) {
  const user = await requireUser();

  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("q") ?? "";

    assertRateLimit({
      key: `market-search:${user.id}`,
      limit: 120,
      windowMs: 60 * 1000
    });

    const assets = await searchAssets(query);
    return NextResponse.json({ assets });
  } catch (error) {
    return NextResponse.json({ message: getSafeErrorMessage(error) }, { status: 400 });
  }
}
