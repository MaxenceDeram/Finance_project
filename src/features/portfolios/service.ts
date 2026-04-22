import { AuditAction, CashLedgerType, Prisma } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { prisma } from "@/server/db/prisma";
import { writeAuditLog } from "@/server/security/audit";
import { createPortfolioSchema } from "@/validation/portfolio";

export async function createPortfolio(input: { userId: string; values: unknown; ipHash?: string | null }) {
  const parsed = createPortfolioSchema.parse(input.values);

  const portfolio = await prisma.$transaction(async (tx) => {
    const created = await tx.portfolio.create({
      data: {
        userId: input.userId,
        name: parsed.name,
        baseCurrency: parsed.baseCurrency,
        initialCash: new Prisma.Decimal(parsed.initialCash),
        benchmarkSymbol: parsed.benchmarkSymbol || null,
        description: parsed.description || null,
        strategy: parsed.strategy || null
      }
    });

    await tx.portfolioCashLedger.create({
      data: {
        portfolioId: created.id,
        type: CashLedgerType.INITIAL_DEPOSIT,
        amount: new Prisma.Decimal(parsed.initialCash),
        currency: parsed.baseCurrency,
        note: "Capital fictif initial"
      }
    });

    return created;
  });

  await writeAuditLog({
    userId: input.userId,
    action: AuditAction.PORTFOLIO_CREATED,
    metadata: { portfolioId: portfolio.id },
    ipHash: input.ipHash
  });

  return portfolio;
}

export async function listUserPortfolios(userId: string) {
  return prisma.portfolio.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      positions: true,
      snapshots: {
        orderBy: { snapshotDate: "desc" },
        take: 1
      }
    }
  });
}

export async function getPortfolioForUser(portfolioId: string, userId: string) {
  const portfolio = await prisma.portfolio.findFirst({
    where: { id: portfolioId, userId },
    include: {
      user: true
    }
  });

  if (!portfolio) {
    throw new AppError("NOT_FOUND", "Portefeuille introuvable.", 404);
  }

  return portfolio;
}

export async function assertPortfolioOwner(
  tx: Prisma.TransactionClient,
  portfolioId: string,
  userId: string
) {
  const portfolio = await tx.portfolio.findFirst({
    where: { id: portfolioId, userId }
  });

  if (!portfolio) {
    throw new AppError("FORBIDDEN", "Acces refuse.", 403);
  }

  return portfolio;
}

export async function getPortfolioCash(
  tx: Prisma.TransactionClient | typeof prisma,
  portfolioId: string
) {
  const result = await tx.portfolioCashLedger.aggregate({
    where: { portfolioId },
    _sum: { amount: true }
  });

  return result._sum.amount ?? new Prisma.Decimal(0);
}
