import { z } from "zod";
import { currencySchema } from "./common";

export const updateEmailPreferencesSchema = z.object({
  dailyEmailEnabled: z.boolean(),
  timezone: z.string().trim().min(1).max(80),
  preferredCurrency: currencySchema,
  dailyEmailHour: z.coerce.number().int().min(0).max(23)
});
