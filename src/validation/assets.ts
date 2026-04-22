import { AssetType } from "@prisma/client";
import { z } from "zod";
import { currencySchema } from "./common";

export const assetInputSchema = z.object({
  symbol: z
    .string()
    .trim()
    .min(1)
    .max(24)
    .regex(/^[A-Za-z0-9._-]+$/)
    .transform((value) => value.toUpperCase()),
  name: z.string().trim().min(1).max(120),
  assetType: z.nativeEnum(AssetType).default(AssetType.STOCK),
  exchange: z.string().trim().max(40).optional().or(z.literal("")),
  currency: currencySchema.default("EUR"),
  sector: z.string().trim().max(80).optional().or(z.literal("")),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  isin: z.string().trim().max(24).optional().or(z.literal("")),
  provider: z.string().trim().max(40).optional().or(z.literal("")),
  providerId: z.string().trim().max(120).optional().or(z.literal("")),
  exchangeName: z.string().trim().max(120).optional().or(z.literal("")),
  industry: z.string().trim().max(120).optional().or(z.literal("")),
  description: z.string().trim().max(3000).optional().or(z.literal("")),
  logoUrl: z.string().trim().url().optional().or(z.literal("")),
  website: z.string().trim().url().optional().or(z.literal("")),
  marketCap: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().nonnegative().optional()
  )
});

export const assetSearchSchema = z.object({
  query: z.string().trim().min(1).max(40)
});
