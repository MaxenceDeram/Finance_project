import { AuditAction, DailyEmailStatus } from "@prisma/client";
import { getEnv } from "@/config/env";
import { startOfUtcDay } from "@/lib/dates";
import { getSafeErrorMessage } from "@/lib/errors";
import { prisma } from "@/server/db/prisma";
import { sendEmail } from "@/server/email/mailer";
import { dailySummaryEmailTemplate } from "@/server/email/templates/daily-summary-email";
import { writeAuditLog } from "@/server/security/audit";
import { createPortfolioSnapshot, getPortfolioOverview } from "@/features/analytics/service";

export async function runDailySummaryJob(date = new Date()) {
  const env = getEnv();
  const periodDate = startOfUtcDay(date);
  const users = await prisma.user.findMany({
    where: {
      emailVerified: true,
      preferences: {
        dailyEmailEnabled: true
      }
    },
    include: {
      preferences: true,
      portfolios: true
    }
  });

  const results: Array<{ userId: string; portfolioId: string; status: DailyEmailStatus }> = [];

  for (const user of users) {
    for (const portfolio of user.portfolios) {
      const existing = await prisma.dailyEmailLog.findUnique({
        where: {
          userId_portfolioId_periodDate: {
            userId: user.id,
            portfolioId: portfolio.id,
            periodDate
          }
        }
      });

      if (existing?.status === DailyEmailStatus.SENT) {
        results.push({ userId: user.id, portfolioId: portfolio.id, status: DailyEmailStatus.SKIPPED });
        continue;
      }

      try {
        await createPortfolioSnapshot({
          userId: user.id,
          portfolioId: portfolio.id,
          date
        });

        const overview = await getPortfolioOverview(user.id, portfolio.id);
        const emailContent = dailySummaryEmailTemplate({
          portfolioName: overview.portfolio.name,
          currency: overview.portfolio.baseCurrency,
          totalValue: overview.totalValue,
          dailyChangeAmount: overview.dailyChangeAmount,
          dailyChangePercent: overview.dailyChangePercent,
          totalPerformancePercent: overview.performancePercent,
          topMovers: overview.topGainers.map((position) => ({
            symbol: position.symbol,
            name: position.name,
            pnl: position.unrealizedPnl,
            pnlPercent: position.unrealizedPnlPercent
          })),
          positions: overview.positions.map((position) => ({
            symbol: position.symbol,
            name: position.name,
            value: position.value,
            weight: position.weight
          })),
          dashboardUrl: `${env.APP_URL}/portfolios/${portfolio.id}`
        });

        await sendEmail({
          to: user.email,
          ...emailContent
        });

        await prisma.dailyEmailLog.upsert({
          where: {
            userId_portfolioId_periodDate: {
              userId: user.id,
              portfolioId: portfolio.id,
              periodDate
            }
          },
          update: {
            sentAt: new Date(),
            status: DailyEmailStatus.SENT,
            subject: emailContent.subject,
            error: null
          },
          create: {
            userId: user.id,
            portfolioId: portfolio.id,
            periodDate,
            status: DailyEmailStatus.SENT,
            subject: emailContent.subject
          }
        });

        await writeAuditLog({
          userId: user.id,
          action: AuditAction.DAILY_EMAIL_SENT,
          metadata: { portfolioId: portfolio.id, periodDate: periodDate.toISOString() }
        });

        results.push({ userId: user.id, portfolioId: portfolio.id, status: DailyEmailStatus.SENT });
      } catch (error) {
        const message = getSafeErrorMessage(error, "Erreur lors de l'envoi quotidien.");

        await prisma.dailyEmailLog.upsert({
          where: {
            userId_portfolioId_periodDate: {
              userId: user.id,
              portfolioId: portfolio.id,
              periodDate
            }
          },
          update: {
            sentAt: new Date(),
            status: DailyEmailStatus.FAILED,
            subject: `Synthese quotidienne - ${portfolio.name}`,
            error: message
          },
          create: {
            userId: user.id,
            portfolioId: portfolio.id,
            periodDate,
            status: DailyEmailStatus.FAILED,
            subject: `Synthese quotidienne - ${portfolio.name}`,
            error: message
          }
        });

        await writeAuditLog({
          userId: user.id,
          action: AuditAction.DAILY_EMAIL_FAILED,
          metadata: { portfolioId: portfolio.id, error: message }
        });

        results.push({ userId: user.id, portfolioId: portfolio.id, status: DailyEmailStatus.FAILED });
      }
    }
  }

  return {
    processedUsers: users.length,
    processedPortfolios: results.length,
    results
  };
}
