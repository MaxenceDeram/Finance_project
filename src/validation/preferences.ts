import { z } from "zod";
import { isValidTimeZone } from "@/lib/dates";

export const updateEmailPreferencesSchema = z.object({
  dailyEmailEnabled: z.boolean(),
  timezone: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .refine(isValidTimeZone, "Fuseau horaire invalide."),
  dailyEmailHour: z.coerce.number().int().min(0).max(23)
});
