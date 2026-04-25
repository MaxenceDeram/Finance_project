import { AuditAction, UserStatus } from "@prisma/client";
import { getEnv } from "@/config/env";
import { AppError } from "@/lib/errors";
import { normalizeEmail } from "@/lib/utils";
import { prisma } from "@/server/db/prisma";
import { sendEmail } from "@/server/email/mailer";
import { confirmationEmailTemplate } from "@/server/email/templates/confirmation-email";
import { writeAuditLog } from "@/server/security/audit";
import { createRandomToken, hashToken } from "@/server/security/crypto";
import {
  hashPassword,
  validatePasswordPolicy,
  verifyPassword
} from "@/server/security/password";
import { createSession } from "@/server/security/sessions";

const EMAIL_TOKEN_TTL_MS = 1000 * 60 * 60 * 24;

export async function registerUser(input: {
  email: string;
  password: string;
  ipHash?: string | null;
}) {
  const env = getEnv();
  const email = normalizeEmail(input.email);
  const passwordErrors = validatePasswordPolicy(input.password);

  if (passwordErrors.length > 0) {
    throw new AppError("VALIDATION_ERROR", passwordErrors[0], 400);
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    if (!existing.emailVerified) {
      await sendConfirmationEmail(existing.id, existing.email);
    }

    await writeAuditLog({
      userId: existing.id,
      action: AuditAction.REGISTER,
      metadata: { duplicate: true },
      ipHash: input.ipHash
    });

    return;
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      preferences: {
        create: {
          timezone: env.DAILY_SUMMARY_DEFAULT_TIMEZONE,
          dailyEmailEnabled: true
        }
      }
    }
  });

  await sendConfirmationEmail(user.id, user.email);
  await writeAuditLog({
    userId: user.id,
    action: AuditAction.REGISTER,
    ipHash: input.ipHash
  });
}

export async function sendConfirmationEmail(userId: string, email: string) {
  const env = getEnv();
  await prisma.emailVerificationToken.updateMany({
    where: {
      userId,
      usedAt: null,
      expiresAt: { gt: new Date() }
    },
    data: { usedAt: new Date() }
  });

  const token = createRandomToken(48);
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + EMAIL_TOKEN_TTL_MS);

  await prisma.emailVerificationToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt
    }
  });

  const confirmationUrl = `${env.APP_URL}/auth/confirm-email?token=${encodeURIComponent(token)}`;
  const emailContent = confirmationEmailTemplate({ email, confirmationUrl });
  await sendEmail({ to: email, ...emailContent });
}

export async function resendConfirmationEmail(input: {
  email: string;
  ipHash?: string | null;
}) {
  const email = normalizeEmail(input.email);
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && !user.emailVerified) {
    await sendConfirmationEmail(user.id, user.email);
    await writeAuditLog({
      userId: user.id,
      action: AuditAction.EMAIL_CONFIRMATION_RESENT,
      ipHash: input.ipHash
    });
  }
}

export async function confirmEmailToken(token: string) {
  const tokenHash = hashToken(token);

  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    include: { user: true }
  });

  if (!record || record.usedAt || record.expiresAt <= new Date()) {
    throw new AppError("BAD_REQUEST", "Le lien est invalide ou expire.", 400);
  }

  await prisma.$transaction([
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() }
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date()
      }
    })
  ]);

  await writeAuditLog({
    userId: record.userId,
    action: AuditAction.EMAIL_CONFIRMED
  });
}

export async function loginUser(input: {
  email: string;
  password: string;
  userAgent?: string;
  ipHash?: string | null;
}) {
  const email = normalizeEmail(input.email);
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    await writeAuditLog({
      action: AuditAction.LOGIN_FAILURE,
      metadata: { reason: "not_found" },
      ipHash: input.ipHash
    });
    throw new AppError("UNAUTHORIZED", "Identifiants invalides.", 401);
  }

  const passwordOk = await verifyPassword(user.passwordHash, input.password);

  if (!passwordOk) {
    await writeAuditLog({
      userId: user.id,
      action: AuditAction.LOGIN_FAILURE,
      metadata: { reason: "bad_password" },
      ipHash: input.ipHash
    });
    throw new AppError("UNAUTHORIZED", "Identifiants invalides.", 401);
  }

  if (!user.emailVerified) {
    throw new AppError(
      "FORBIDDEN",
      "Confirmez votre email avant de vous connecter.",
      403
    );
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw new AppError("FORBIDDEN", "Compte indisponible.", 403);
  }

  await createSession({
    userId: user.id,
    userAgent: input.userAgent,
    ipHash: input.ipHash
  });

  await writeAuditLog({
    userId: user.id,
    action: AuditAction.LOGIN_SUCCESS,
    ipHash: input.ipHash
  });
}
