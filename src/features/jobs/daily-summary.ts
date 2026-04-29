import {
  ApplicationStatus,
  AuditAction,
  DailyEmailStatus,
  EmailCategory,
  EmailLogStatus,
  type UserPreferences
} from "@prisma/client";
import { getEnv } from "@/config/env";
import {
  getZonedDateParts,
  isValidTimeZone,
  startOfZonedDayAsUtcDate
} from "@/lib/dates";
import { getSafeErrorMessage } from "@/lib/errors";
import { prisma } from "@/server/db/prisma";
import { sendEmail, getConfiguredEmailProvider } from "@/server/email/mailer";
import { createEmailLog } from "@/server/email/logs";
import { dailySummaryEmailTemplate } from "@/server/email/templates/daily-summary-email";
import { writeAuditLog } from "@/server/security/audit";
import { responseStatuses } from "@/features/applications/constants";

export async function runDailySummaryJob(date = new Date()) {
  const env = getEnv();
  const users = await prisma.user.findMany({
    where: {
      emailVerified: true,
      preferences: {
        dailyEmailEnabled: true
      }
    },
    include: {
      preferences: true
    }
  });

  const results: Array<{
    userId: string;
    summaryScope: string;
    status: DailyEmailStatus;
    reason?: string;
  }> = [];

  for (const user of users) {
    const preferences = resolveDailySummaryPreferences(user.preferences, env);

    if (!isDailySummaryDueAt(date, preferences)) {
      results.push({
        userId: user.id,
        summaryScope: "applications",
        status: DailyEmailStatus.SKIPPED,
        reason: "NOT_DUE"
      });
      continue;
    }

    const periodDate = startOfZonedDayAsUtcDate(date, preferences.timezone);
    const existingLog = await prisma.dailyEmailLog.findFirst({
      where: {
        userId: user.id,
        periodDate
      }
    });

    if (existingLog?.status === DailyEmailStatus.SENT) {
      results.push({
        userId: user.id,
        summaryScope: "applications",
        status: DailyEmailStatus.SKIPPED
      });
      continue;
    }

    const [applications, upcomingFollowUps, recentApplications] = await Promise.all([
      prisma.jobApplication.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" }
      }),
      prisma.jobApplication.findMany({
        where: {
          userId: user.id,
          followUpDate: { not: null },
          status: {
            notIn: [ApplicationStatus.REJECTED, ApplicationStatus.ACCEPTED]
          }
        },
        orderBy: { followUpDate: "asc" },
        take: 5
      }),
      prisma.jobApplication.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
        take: 5
      })
    ]);

    if (applications.length === 0) {
      await upsertDailyEmailLog({
        existingLogId: existingLog?.id,
        userId: user.id,
        periodDate,
        status: DailyEmailStatus.SKIPPED,
        subject: "Waren - Rappel quotidien",
        error: null
      });

      results.push({
        userId: user.id,
        summaryScope: "applications",
        status: DailyEmailStatus.SKIPPED
      });
      continue;
    }

    const sentApplications = applications.filter(
      (application) => application.status !== ApplicationStatus.TO_APPLY
    ).length;
    const responsesCount = applications.filter((application) =>
      responseStatuses.has(application.status)
    ).length;
    const responseRate =
      sentApplications > 0 ? Math.round((responsesCount / sentApplications) * 100) : 0;

    const emailContent = dailySummaryEmailTemplate({
      totalApplications: applications.length,
      responseRate,
      upcomingFollowUps: upcomingFollowUps.map((application) => ({
        companyName: application.companyName,
        roleTitle: application.roleTitle,
        status: application.status,
        followUpDate: application.followUpDate ?? application.updatedAt
      })),
      recentApplications: recentApplications.map((application) => ({
        companyName: application.companyName,
        roleTitle: application.roleTitle,
        status: application.status,
        applicationDate: application.applicationDate ?? application.updatedAt
      })),
      dashboardUrl: `${env.APP_URL}/dashboard`
    });

    try {
      const delivery = await sendEmail({
        to: user.email,
        ...emailContent
      });

      await createEmailLog({
        userId: user.id,
        category: EmailCategory.DAILY_SUMMARY,
        provider: delivery.provider,
        status: EmailLogStatus.SENT,
        toEmail: user.email,
        fromEmail: delivery.from,
        subject: emailContent.subject,
        htmlBody: emailContent.html,
        textBody: emailContent.text,
        providerMessageId: delivery.messageId,
        sentAt: new Date()
      });

      await upsertDailyEmailLog({
        existingLogId: existingLog?.id,
        userId: user.id,
        periodDate,
        status: DailyEmailStatus.SENT,
        subject: emailContent.subject,
        error: null
      });

      await writeAuditLog({
        userId: user.id,
        action: AuditAction.DAILY_EMAIL_SENT,
        metadata: { category: "applications", periodDate: periodDate.toISOString() }
      });

      results.push({
        userId: user.id,
        summaryScope: "applications",
        status: DailyEmailStatus.SENT
      });
    } catch (error) {
      const message = getSafeErrorMessage(error, "Erreur lors de l'envoi quotidien.");

      await createEmailLog({
        userId: user.id,
        category: EmailCategory.DAILY_SUMMARY,
        provider: getConfiguredEmailProvider(),
        status: EmailLogStatus.FAILED,
        toEmail: user.email,
        fromEmail: env.SMTP_FROM,
        subject: emailContent.subject,
        htmlBody: emailContent.html,
        textBody: emailContent.text,
        errorMessage: message
      });

      await upsertDailyEmailLog({
        existingLogId: existingLog?.id,
        userId: user.id,
        periodDate,
        status: DailyEmailStatus.FAILED,
        subject: "Waren - Rappel quotidien",
        error: message
      });

      await writeAuditLog({
        userId: user.id,
        action: AuditAction.DAILY_EMAIL_FAILED,
        metadata: { category: "applications", error: message }
      });

      results.push({
        userId: user.id,
        summaryScope: "applications",
        status: DailyEmailStatus.FAILED
      });
    }
  }

  return {
    processedUsers: users.length,
    processedSummaries: results.length,
    results
  };
}

export function isDailySummaryDueAt(
  date: Date,
  preferences: Pick<UserPreferences, "timezone" | "dailyEmailHour">
) {
  const parts = getZonedDateParts(date, preferences.timezone);
  return parts.hour === preferences.dailyEmailHour;
}

function resolveDailySummaryPreferences(
  preferences: UserPreferences | null,
  env: ReturnType<typeof getEnv>
) {
  const fallbackTimezone = isValidTimeZone(env.DAILY_SUMMARY_DEFAULT_TIMEZONE)
    ? env.DAILY_SUMMARY_DEFAULT_TIMEZONE
    : "Europe/Paris";
  const timezone =
    preferences?.timezone && isValidTimeZone(preferences.timezone)
      ? preferences.timezone
      : fallbackTimezone;

  return {
    timezone,
    dailyEmailHour: preferences?.dailyEmailHour ?? 22
  };
}

async function upsertDailyEmailLog(input: {
  existingLogId?: string;
  userId: string;
  periodDate: Date;
  status: DailyEmailStatus;
  subject: string;
  error: string | null;
}) {
  if (input.existingLogId) {
    return prisma.dailyEmailLog.update({
      where: { id: input.existingLogId },
      data: {
        sentAt: new Date(),
        status: input.status,
        subject: input.subject,
        error: input.error
      }
    });
  }

  return prisma.dailyEmailLog.create({
    data: {
      userId: input.userId,
      periodDate: input.periodDate,
      status: input.status,
      subject: input.subject,
      error: input.error
    }
  });
}
