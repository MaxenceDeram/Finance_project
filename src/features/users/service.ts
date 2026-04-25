import { AuditAction } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { normalizeEmail } from "@/lib/utils";
import { prisma } from "@/server/db/prisma";
import { sendConfirmationEmail } from "@/features/auth/service";
import { getAvatarUrl, removeAvatar } from "@/server/storage/avatar-storage";
import { writeAuditLog } from "@/server/security/audit";
import {
  hashPassword,
  validatePasswordPolicy,
  verifyPassword
} from "@/server/security/password";
import { updateEmailPreferencesSchema } from "@/validation/preferences";
import {
  changePasswordSchema,
  updateProfileEmailSchema,
  updateProfileIdentitySchema
} from "@/validation/profile";

export async function getUserPreferences(userId: string) {
  return prisma.userPreferences.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      dailyEmailEnabled: true,
      timezone: "Europe/Paris",
      dailyEmailHour: 22
    }
  });
}

export async function updateUserPreferences(userId: string, values: unknown) {
  const parsed = updateEmailPreferencesSchema.parse(values);

  return prisma.userPreferences.upsert({
    where: { userId },
    update: {
      dailyEmailEnabled: parsed.dailyEmailEnabled,
      timezone: parsed.timezone,
      dailyEmailHour: parsed.dailyEmailHour
    },
    create: {
      userId,
      dailyEmailEnabled: parsed.dailyEmailEnabled,
      timezone: parsed.timezone,
      dailyEmailHour: parsed.dailyEmailHour
    }
  });
}

export async function getUserPresentation(input: {
  id: string;
  email: string;
  displayName?: string | null;
  avatarStorageKey?: string | null;
}) {
  return {
    displayName: getPreferredUserName(input.displayName, input.email),
    avatarUrl: await getAvatarUrl(input.avatarStorageKey)
  };
}

export async function updateProfileIdentity(input: {
  userId: string;
  values: unknown;
}) {
  const parsed = updateProfileIdentitySchema.parse(input.values);

  return prisma.user.update({
    where: { id: input.userId },
    data: {
      displayName: parsed.displayName || null
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

export async function deleteUserAvatar(input: {
  userId: string;
  ipHash?: string | null;
}) {
  await removeAvatar(input.userId);

  await writeAuditLog({
    userId: input.userId,
    action: AuditAction.PROFILE_AVATAR_REMOVED,
    ipHash: input.ipHash
  });
}

export function getPreferredUserName(displayName: string | null | undefined, email: string) {
  const trimmed = displayName?.trim();

  if (trimmed) {
    return trimmed;
  }

  const localPart = email.split("@")[0] ?? email;
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}
