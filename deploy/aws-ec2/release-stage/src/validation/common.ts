import { z } from "zod";

export const emailSchema = z.string().trim().email().max(254).toLowerCase();

export const currencySchema = z
  .string()
  .trim()
  .length(3)
  .regex(/^[A-Z]{3}$/);

export const idSchema = z.string().cuid();

export const positiveMoneySchema = z.coerce
  .number()
  .positive()
  .max(1_000_000_000);

export const positiveQuantitySchema = z.coerce
  .number()
  .positive()
  .max(1_000_000_000);
