import { z } from "zod";
import { currencySchema, positiveMoneySchema } from "./common";

export const createPortfolioSchema = z.object({
  name: z.string().trim().min(2).max(80),
  baseCurrency: currencySchema.default("EUR"),
  initialCash: positiveMoneySchema,
  benchmarkSymbol: z.string().trim().max(20).optional().or(z.literal("")),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  strategy: z.string().trim().max(1000).optional().or(z.literal(""))
});

export const updatePortfolioSchema = z.object({
  name: z.string().trim().min(2).max(80),
  benchmarkSymbol: z.string().trim().max(20).optional().or(z.literal("")),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  strategy: z.string().trim().max(1000).optional().or(z.literal(""))
});

export const deletePortfolioSchema = z.object({
  portfolioId: z.string().cuid(),
  confirmationName: z.string().trim().min(1).max(80)
});
