import { prisma } from "@/server/db/prisma";
import { updateEmailPreferencesSchema } from "@/validation/preferences";

export async function getUserPreferences(userId: string) {
  return prisma.userPreferences.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      dailyEmailEnabled: true,
      timezone: "Europe/Paris",
      preferredCurrency: "EUR",
      dailyEmailHour: 22
    }
  });
}

export async function updateUserPreferences(userId: string, values: unknown) {
  const parsed = updateEmailPreferencesSchema.parse(values);

  return prisma.userPreferences.upsert({
    where: { userId },
    update: parsed,
    create: {
      userId,
      ...parsed
    }
  });
}
