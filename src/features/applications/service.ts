import { ApplicationStatus, AuditAction } from "@prisma/client";
import { addDaysUtc, getZonedDayRange } from "@/lib/dates";
import { AppError } from "@/lib/errors";
import { prisma } from "@/server/db/prisma";
import { writeAuditLog } from "@/server/security/audit";
import {
  createApplicationSchema,
  deleteApplicationSchema,
  updateApplicationStatusSchema,
  updateApplicationSchema
} from "@/validation/applications";
import {
  applicationStatusOptions,
  interviewStatuses,
  responseStatuses,
  type ApplicationDateRange
} from "./constants";

export async function createJobApplication(input: {
  userId: string;
  values: unknown;
  ipHash?: string | null;
}) {
  const parsed = createApplicationSchema.parse(input.values);

  const application = await prisma.jobApplication.create({
    data: {
      userId: input.userId,
      companyName: parsed.companyName,
      roleTitle: parsed.roleTitle,
      contractType: parsed.contractType,
      location: emptyToNull(parsed.location),
      applicationDate: parsed.applicationDate ?? null,
      status: parsed.status,
      listingUrl: emptyToNull(parsed.listingUrl),
      hrContact: emptyToNull(parsed.hrContact),
      contactEmail: emptyToNull(parsed.contactEmail),
      compensation: emptyToNull(parsed.compensation),
      notes: emptyToNull(parsed.notes),
      followUpDate: parsed.followUpDate ?? null
    }
  });

  await writeAuditLog({
    userId: input.userId,
    action: AuditAction.APPLICATION_CREATED,
    metadata: { applicationId: application.id, companyName: application.companyName },
    ipHash: input.ipHash
  });

  return application;
}

export async function updateJobApplication(input: {
  userId: string;
  values: unknown;
  ipHash?: string | null;
}) {
  const parsed = updateApplicationSchema.parse(input.values);
  await assertApplicationOwner(parsed.applicationId, input.userId);

  const application = await prisma.jobApplication.update({
    where: { id: parsed.applicationId },
    data: {
      companyName: parsed.companyName,
      roleTitle: parsed.roleTitle,
      contractType: parsed.contractType,
      location: emptyToNull(parsed.location),
      applicationDate: parsed.applicationDate ?? null,
      status: parsed.status,
      listingUrl: emptyToNull(parsed.listingUrl),
      hrContact: emptyToNull(parsed.hrContact),
      contactEmail: emptyToNull(parsed.contactEmail),
      compensation: emptyToNull(parsed.compensation),
      notes: emptyToNull(parsed.notes),
      followUpDate: parsed.followUpDate ?? null
    }
  });

  await writeAuditLog({
    userId: input.userId,
    action: AuditAction.APPLICATION_UPDATED,
    metadata: { applicationId: application.id, status: application.status },
    ipHash: input.ipHash
  });

  return application;
}

export async function updateJobApplicationStatus(input: {
  userId: string;
  values: unknown;
  ipHash?: string | null;
}) {
  const parsed = updateApplicationStatusSchema.parse(input.values);
  await assertApplicationOwner(parsed.applicationId, input.userId);

  const application = await prisma.jobApplication.update({
    where: { id: parsed.applicationId },
    data: {
      status: parsed.status
    }
  });

  await writeAuditLog({
    userId: input.userId,
    action: AuditAction.APPLICATION_UPDATED,
    metadata: { applicationId: application.id, status: application.status },
    ipHash: input.ipHash
  });

  return application;
}

export async function deleteJobApplication(input: {
  userId: string;
  values: unknown;
  ipHash?: string | null;
}) {
  const parsed = deleteApplicationSchema.parse(input.values);
  const application = await assertApplicationOwner(parsed.applicationId, input.userId);

  await prisma.jobApplication.delete({
    where: { id: parsed.applicationId }
  });

  await writeAuditLog({
    userId: input.userId,
    action: AuditAction.APPLICATION_DELETED,
    metadata: { applicationId: application.id, companyName: application.companyName },
    ipHash: input.ipHash
  });
}

export async function listJobApplications(input: {
  userId: string;
  status?: ApplicationStatus | "ALL";
  query?: string;
  location?: string;
  dateRange?: ApplicationDateRange;
}) {
  const statusFilter =
    input.status && input.status !== "ALL" ? { status: input.status } : undefined;
  const query = input.query?.trim();
  const location = input.location?.trim();
  const dateRangeFilter = getDateRangeFilter(input.dateRange);

  return prisma.jobApplication.findMany({
    where: {
      userId: input.userId,
      ...statusFilter,
      ...(location
        ? {
            location: {
              contains: location,
              mode: "insensitive"
            }
          }
        : {}),
      ...(dateRangeFilter
        ? {
            applicationDate: dateRangeFilter
          }
        : {}),
      ...(query
        ? {
            OR: [
              { companyName: { contains: query, mode: "insensitive" } },
              { roleTitle: { contains: query, mode: "insensitive" } },
              { location: { contains: query, mode: "insensitive" } },
              { hrContact: { contains: query, mode: "insensitive" } },
              { contactEmail: { contains: query, mode: "insensitive" } }
            ]
          }
        : {})
    },
    orderBy: [{ followUpDate: "asc" }, { updatedAt: "desc" }]
  });
}

export async function getJobApplicationForUser(applicationId: string, userId: string) {
  return assertApplicationOwner(applicationId, userId);
}

export async function getApplicationDashboard(userId: string) {
  const applications = await prisma.jobApplication.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" }
  });

  const totalApplications = applications.length;
  const toApplyCount = applications.filter(
    (application) => application.status === ApplicationStatus.TO_APPLY
  ).length;
  const sentApplications = applications.filter(
    (application) => application.status !== ApplicationStatus.TO_APPLY
  ).length;
  const interviewsCount = applications.filter((application) =>
    interviewStatuses.has(application.status)
  ).length;
  const offersCount = applications.filter(
    (application) => application.status === ApplicationStatus.OFFER_RECEIVED
  ).length;
  const refusalsCount = applications.filter(
    (application) => application.status === ApplicationStatus.REJECTED
  ).length;
  const activePipelineCount = applications.filter(
    (application) =>
      application.status !== ApplicationStatus.REJECTED &&
      application.status !== ApplicationStatus.ACCEPTED
  ).length;
  const responsesCount = applications.filter((application) =>
    responseStatuses.has(application.status)
  ).length;
  const responseRate =
    sentApplications > 0 ? (responsesCount / sentApplications) * 100 : 0;
  const upcomingFollowUps = applications
    .filter(
      (application) =>
        application.followUpDate &&
        application.status !== ApplicationStatus.REJECTED &&
        application.status !== ApplicationStatus.ACCEPTED
    )
    .sort((a, b) => {
      const left = a.followUpDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const right = b.followUpDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return left - right;
    })
    .slice(0, 5);

  const recentApplications = applications.slice(0, 6);
  const recentActivity = applications.slice(0, 5);
  const statusBreakdown = applicationStatusOptions.map((option) => ({
    status: option.value,
    label: option.label,
    count: applications.filter((application) => application.status === option.value)
      .length
  }));

  return {
    totalApplications,
    toApplyCount,
    sentApplications,
    interviewsCount,
    offersCount,
    refusalsCount,
    activePipelineCount,
    responseRate,
    upcomingFollowUps,
    recentApplications,
    recentActivity,
    statusBreakdown
  };
}

export async function getTodayApplicationActions(input: {
  userId: string;
  now?: Date;
  timeZone?: string;
  staleAfterDays?: number;
}) {
  const now = input.now ?? new Date();
  const staleAfterDays = input.staleAfterDays ?? 14;
  const { start: todayStart, end: tomorrowStart } = getZonedDayRange(
    now,
    input.timeZone ?? "Europe/Paris"
  );
  const staleBefore = addDaysUtc(todayStart, -staleAfterDays);
  const terminalStatuses = [ApplicationStatus.REJECTED, ApplicationStatus.ACCEPTED];

  const [followUpsDue, withoutFollowUp, toApply, staleApplications] =
    await Promise.all([
      prisma.jobApplication.findMany({
        where: {
          userId: input.userId,
          followUpDate: { lt: tomorrowStart },
          status: { notIn: terminalStatuses }
        },
        orderBy: [{ followUpDate: "asc" }, { updatedAt: "desc" }],
        take: 10
      }),
      prisma.jobApplication.findMany({
        where: {
          userId: input.userId,
          followUpDate: null,
          status: {
            notIn: [
              ApplicationStatus.TO_APPLY,
              ApplicationStatus.REJECTED,
              ApplicationStatus.ACCEPTED
            ]
          }
        },
        orderBy: { updatedAt: "asc" },
        take: 10
      }),
      prisma.jobApplication.findMany({
        where: {
          userId: input.userId,
          status: ApplicationStatus.TO_APPLY
        },
        orderBy: { createdAt: "desc" },
        take: 10
      }),
      prisma.jobApplication.findMany({
        where: {
          userId: input.userId,
          updatedAt: { lt: staleBefore },
          status: {
            notIn: [
              ApplicationStatus.TO_APPLY,
              ApplicationStatus.REJECTED,
              ApplicationStatus.ACCEPTED
            ]
          }
        },
        orderBy: { updatedAt: "asc" },
        take: 10
      })
    ]);

  return {
    todayStart,
    tomorrowStart,
    staleAfterDays,
    followUpsDue,
    withoutFollowUp,
    toApply,
    staleApplications,
    totalActions:
      followUpsDue.length +
      withoutFollowUp.length +
      toApply.length +
      staleApplications.length
  };
}

async function assertApplicationOwner(applicationId: string, userId: string) {
  const application = await prisma.jobApplication.findFirst({
    where: { id: applicationId, userId },
    include: {
      documents: {
        orderBy: [{ documentType: "asc" }, { createdAt: "desc" }]
      },
      emailLogs: {
        where: {
          category: "APPLICATION_FOLLOW_UP"
        },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          template: {
            select: {
              name: true
            }
          }
        }
      }
    }
  });

  if (!application) {
    throw new AppError("NOT_FOUND", "Candidature introuvable.", 404);
  }

  return application;
}

function emptyToNull(value?: string) {
  return value && value.trim().length > 0 ? value : null;
}

function getDateRangeFilter(dateRange?: ApplicationDateRange) {
  const now = new Date();

  switch (dateRange) {
    case "LAST_7_DAYS": {
      const from = new Date(now);
      from.setDate(from.getDate() - 7);
      return { gte: from };
    }
    case "LAST_30_DAYS": {
      const from = new Date(now);
      from.setDate(from.getDate() - 30);
      return { gte: from };
    }
    case "LAST_90_DAYS": {
      const from = new Date(now);
      from.setDate(from.getDate() - 90);
      return { gte: from };
    }
    case "THIS_YEAR":
      return { gte: new Date(now.getFullYear(), 0, 1) };
    default:
      return undefined;
  }
}
