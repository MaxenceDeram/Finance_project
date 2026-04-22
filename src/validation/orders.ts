import { OrderSide, OrderType } from "@prisma/client";
import { z } from "zod";
import { assetInputSchema } from "./assets";
import { idSchema, positiveQuantitySchema } from "./common";

export const placeMarketOrderSchema = z.object({
  portfolioId: idSchema,
  side: z.nativeEnum(OrderSide),
  orderType: z.literal(OrderType.MARKET),
  quantity: positiveQuantitySchema,
  asset: assetInputSchema
});
