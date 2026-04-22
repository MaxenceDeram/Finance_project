import { AuditAction } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { normalizeEmail } from "@/lib/utils";
import { prisma } from "@/server/db/prisma";
import { sendConfirmationEmail } from "@/features/auth/service";
import { writeAuditLog } from "@/server/security/audit";
import { hashPassword, validatePasswordPolicy, verifyPassword } from "@/server/security/password";
import { updateEmailPreferencesSchema } from "@/validation/preferences";
import { changePasswordSchema, updateProfileEmailSchema } from "@/validation/profile";

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

export async function updateProfileEmail(input: {
  userId: string;
  values: unknown;
  ipHash?: string | null;
}) {
  const parsed = updateProfileEmailSchema.parse(input.values);
  const nextEmail = normalizeEmail(parsed.email);
  const user = await prisma.user.findUnique({ where: { id: input.userId } });

  if (!user) {
    throw new AppError("NOT_FOUND", "Compte introuvable.", 404);
  }

  const passwordOk = await verifyPassword(user.passwordHash, parsed.currentPassword);

  if (!passwordOk) {
    throw new AppError("UNAUTHORIZED", "Mot de passe actuel invalide.", 401);
  }

  if (nextEmail === user.email) {
    return { email: user.email, changed: false };
  }

  const existing = await prisma.user.findUnique({ where: { email: nextEmail } });

  if (existing) {
    throw new AppError("CONFLICT", "Cette adresse email est deja utilisee.", 409);
  }

  const updated = await prisma.user.update({
    where: { id: input.userId },
    data: {
      email: nextEmail,
      emailVerified: false,
      emailVerifiedAt: null
    }
  });

  await sendConfirmationEmail(updated.id, updated.email);
  await writeAuditLog({
    userId: updated.id,
    action: AuditAction.PROFILE_EMAIL_CHANGE_REQUESTED,
    metadata: { email: updated.email },
    ipHash: input.ipHash
  });

  return { email: updated.email, changed: true };
}

export async function changeUserPassword(input: {
  userId: string;
  values: unknown;
  ipHash?: string | null;
}) {
  const parsed = changePasswordSchema.parse(input.values);
  const policyErrors = validatePasswordPolicy(parsed.newPassword);

  if (policyErrors.length > 0) {
    throw new AppError("VALIDATION_ERROR", policyErrors[0], 400);
  }

  const user = await prisma.user.findUnique({ where: { id: input.userId } });

  if (!user) {
    throw new AppError("NOT_FOUND", "Compte introuvable.", 404);
  }

  const passwordOk = await verifyPassword(user.passwordHash, parsed.currentPassword);

  if (!passwordOk) {
    throw new AppError("UNAUTHORIZED", "Mot de passe actuel invalide.", 401);
  }

  const passwordHash = await hashPassword(parsed.newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: input.userId },
      data: { passwordHash }
    }),
    prisma.session.deleteMany({
      where: { userId: input.userId }
    })
  ]);

  await writeAuditLog({
    userId: input.userId,
    action: AuditAction.PROFILE_PASSWORD_CHANGED,
    ipHash: input.ipHash
  });
}
