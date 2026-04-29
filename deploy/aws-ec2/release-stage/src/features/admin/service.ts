import {
  ApplicationStatus,
  AuditAction,
  Prisma,
  UserRole,
  UserStatus
} from "@prisma/client";
import { AppError } from "@/lib/errors";
import { prisma } from "@/server/db/prisma";
import { sendConfirmationEmail } from "@/features/auth/service";
import { runDailySummaryJob } from "@/features/jobs/daily-summary";
import { writeAuditLog } from "@/server/security/audit";
import {
  adminUserIdSchema,
  updateUserRoleSchema,
  updateUserStatusSchema
} from "@/validation/admin";

type AdminActor = {
  id: string;
  role: UserRole;
};

export async function getAdminDashboardStats() {
  const [
    totalUsers,
    activeUsers,
    suspendedUsers,
    unverifiedUsers,
    totalApplications,
    activeInterviews,
    failedEmails
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
    prisma.user.count({ where: { status: UserStatus.SUSPENDED } }),
    prisma.user.count({ where: { emailVerified: false } }),
    prisma.jobApplication.count(),
    prisma.jobApplication.count({
      where: {
        status: {
          in: [
            ApplicationStatus.HR_INTERVIEW,
            ApplicationStatus.TECHNICAL_INTERVIEW,
            ApplicationStatus.CASE_STUDY
          ]
        }
      }
    }),
    prisma.dailyEmailLog.count({ where: { status: "FAILED" } })
  ]);

  return {
    totalUsers,
    activeUsers,
    suspendedUsers,
    unverifiedUsers,
    totalApplications,
    activeInterviews,
    failedEmails
  };
}

export async function listAdminUsers(query?: string) {
  const where: Prisma.UserWhereInput = query
    ? {
        email: {
          contains: query,
          mode: "insensitive"
        }
      }
    : {};

  return prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          jobApplications: true,
          sessions: true,
          dailyEmailLogs: true
        }
      }
    }
  });
}

export async function getAdminUserDetails(userId: string) {
  const parsed = adminUserIdSchema.parse({ userId });
  const user = await prisma.user.findUnique({
    where: { id: parsed.userId },
    include: {
      preferences: true,
      jobApplications: {
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          companyName: true,
          roleTitle: true,
          status: true,
          followUpDate: true,
          updatedAt: true
        }
      },
      sessions: {
        orderBy: { lastSeenAt: "desc" },
        take: 5,
        select: {
          id: true,
          createdAt: true,
          lastSeenAt: true,
          expiresAt: true,
          userAgent: true
        }
      },
      dailyEmailLogs: {
        orderBy: { sentAt: "desc" },
        take: 10
      },
      auditLogs: {
        orderBy: { createdAt: "desc" },
        take: 20
      }
    }
  });

  if (!user) {
    throw new AppError("NOT_FOUND", "Utilisateur introuvable.", 404);
  }

  return user;
}

export async function listAuditLogs() {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: {
        select: {
          email: true,
          role: true
        }
      }
    }
  });
}

export async function listDailyEmailLogs() {
  return prisma.dailyEmailLog.findMany({
    orderBy: { sentAt: "desc" },
    take: 200,
    include: {
      user: {
        select: {
          email: true
        }
      }
    }
  });
}

export async function resendUserConfirmationFromAdmin(input: {
  actor: AdminActor;
  values: unknown;
  ipHash?: string | null;
}) {
  const parsed = adminUserIdSchema.parse(input.values);
  const target = await prisma.user.findUnique({ where: { id: parsed.userId } });

  if (!target) {
    throw new AppError("NOT_FOUND", "Utilisateur introuvable.", 404);
  }

  if (target.emailVerified) {
    throw new AppError("BAD_REQUEST", "Cet email est deja confirme.", 400);
  }

  await sendConfirmationEmail(target.id, target.email);
  await writeAuditLog({
    userId: input.actor.id,
    action: AuditAction.ADMIN_CONFIRMATION_RESENT,
    metadata: { targetUserId: target.id },
    ipHash: input.ipHash
  });
}

export async function updateUserRoleFromAdmin(input: {
  actor: AdminActor;
  values: unknown;
  ipHash?: string | null;
}) {
  const parsed = updateUserRoleSchema.parse(input.values);
  assertOwner(input.actor);

  if (parsed.userId === input.actor.id) {
    throw new AppError("FORBIDDEN", "Vous ne pouvez pas modifier votre propre role.", 403);
  }

  const target = await prisma.user.findUnique({ where: { id: parsed.userId } });

  if (!target) {
    throw new AppError("NOT_FOUND", "Utilisateur introuvable.", 404);
  }

  if (target.role === UserRole.OWNER) {
    throw new AppError("FORBIDDEN", "Le role OWNER ne peut pas etre modifie ici.", 403);
  }

  const updated = await prisma.user.update({
    where: { id: target.id },
    data: { role: parsed.role }
  });

  await writeAuditLog({
    userId: input.actor.id,
    action: AuditAction.ADMIN_USER_ROLE_UPDATED,
    metadata: { targetUserId: updated.id, role: updated.role },
    ipHash: input.ipHash
  });

  return updated;
}

export async function updateUserStatusFromAdmin(input: {
  actor: AdminActor;
  values: unknown;
  ipHash?: string | null;
}) {
  const parsed = updateUserStatusSchema.parse(input.values);
  const target = await prisma.user.findUnique({ where: { id: parsed.userId } });

  if (!target) {
    throw new AppError("NOT_FOUND", "Utilisateur introuvable.", 404);
  }

  if (target.id === input.actor.id) {
    throw new AppError("FORBIDDEN", "Vous ne pouvez pas modifier votre propre statut.", 403);
  }

  if (target.role === UserRole.OWNER) {
    throw new AppError("FORBIDDEN", "Le compte OWNER ne peut pas etre suspendu ici.", 403);
  }

  if (input.actor.role === UserRole.ADMIN && target.role !== UserRole.USER) {
    throw new AppError("FORBIDDEN", "Un admin ne peut modifier que les utilisateurs standards.", 403);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: target.id },
      data: { status: parsed.status }
    });

    if (parsed.status !== UserStatus.ACTIVE) {
      await tx.session.deleteMany({ where: { userId: target.id } });
    }

    return user;
  });

  await writeAuditLog({
    userId: input.actor.id,
    action: AuditAction.ADMIN_USER_STATUS_UPDATED,
    metadata: { targetUserId: updated.id, status: updated.status },
    ipHash: input.ipHash
  });

  return updated;
}

export async function triggerDailySummaryFromAdmin(input: {
  actor: AdminActor;
  ipHash?: string | null;
}) {
  const result = await runDailySummaryJob();

  await writeAuditLog({
    userId: input.actor.id,
    action: AuditAction.ADMIN_DAILY_JOB_TRIGGERED,
    metadata: result,
    ipHash: input.ipHash
  });

  return result;
}

function assertOwner(actor: AdminActor) {
  if (actor.role !== UserRole.OWNER) {
    throw new AppError("FORBIDDEN", "Action reservee au proprietaire.", 403);
  }
}
