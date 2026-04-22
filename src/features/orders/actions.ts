"use server";

import { OrderSide, OrderType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSafeErrorMessage, type ActionState } from "@/lib/errors";
import { assertRateLimit } from "@/server/security/rate-limit";
import { assertSameOrigin, getRequestMetadata } from "@/server/security/request";
import { requireUser } from "@/server/security/sessions";
import { createPortfolioSnapshot } from "@/features/analytics/service";
import { placeMarketOrderSchema } from "@/validation/orders";
import { placeMarketOrder } from "./service";

export async function placeMarketOrderAction(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  let redirectTo: string | null = null;

  try {
    await assertSameOrigin();
    const request = await getRequestMetadata();
    assertRateLimit({
      key: `order:${user.id}`,
      limit: 60,
      windowMs: 60 * 60 * 1000
    });

    const raw = {
      portfolioId: formData.get("portfolioId"),
      side: formData.get("side") === "SELL" ? OrderSide.SELL : OrderSide.BUY,
      orderType: OrderType.MARKET,
      quantity: formData.get("quantity"),
      asset: {
        symbol: formData.get("symbol"),
        name: formData.get("name"),
        assetType: formData.get("assetType"),
        exchange: formData.get("exchange"),
        currency: formData.get("currency"),
        sector: formData.get("sector"),
        country: formData.get("country"),
        isin: formData.get("isin"),
        provider: formData.get("provider"),
        providerId: formData.get("providerId"),
        exchangeName: formData.get("exchangeName"),
        industry: formData.get("industry"),
        description: formData.get("description"),
        logoUrl: formData.get("logoUrl"),
        website: formData.get("website"),
        marketCap: formData.get("marketCap")
      }
    };

    const parsed = placeMarketOrderSchema.safeParse(raw);

    if (!parsed.success) {
      return {
        ok: false,
        message: "Ordre invalide.",
        fieldErrors: parsed.error.flatten().fieldErrors
      };
    }

    const order = await placeMarketOrder({
      userId: user.id,
      values: parsed.data,
      ipHash: request.ipHash
    });

    await createPortfolioSnapshot({
      userId: user.id,
      portfolioId: parsed.data.portfolioId
    });

    revalidatePath(`/portfolios/${parsed.data.portfolioId}`);
    revalidatePath("/orders");
    redirectTo = `/portfolios/${parsed.data.portfolioId}?order=${order.id}`;
  } catch (error) {
    return { ok: false, message: getSafeErrorMessage(error) };
  }

  redirect(redirectTo ?? "/dashboard");
}
