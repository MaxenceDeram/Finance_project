import { Prisma } from "@prisma/client";
import { startOfUtcDay } from "@/lib/dates";
import { calculateDrawdown, calculatePercentChange, calculateWeight } from "@/lib/financial";
import { toNumber } from "@/lib/utils";
import { prisma } from "@/server/db/prisma";
import { getLatestPriceForAsset } from "@/server/market-data/price-service";
import { toLookup } from "@/features/assets/service";
import { getPortfolioCash, getPortfolioForUser } from "@/features/portfolios/service";

export type PositionOverview = {
  id: string;
  assetId: string;
  symbol: string;
  name: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  value: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  weight: number;
  sector?: string | null;
};

export type PortfolioOverview = {
  portfolio: {
    id: string;
    name: string;
    baseCurrency: string;
    initialCash: number;
    benchmarkSymbol?: string | null;
    description?: string | null;
    strategy?: string | null;
  };
  cashValue: number;
  investedValue: number;
  totalValue: number;
  unrealizedPnl: number;
  realizedPnl: number;
  totalPnl: number;
  performancePercent: number;
  dailyChangeAmount: number;
  dailyChangePercent: number;
  drawdownPercent: number;
  positions: PositionOverview[];
  topGainers: PositionOverview[];
  topLosers: PositionOverview[];
  allocation: Array<{ label: string; value: number; weight: number }>;
  sectorAllocation: Array<{ label: string; value: number; weight: number }>;
  chartData: Array<{ date: string; totalValue: number; benchmark?: number }>;
};

export async function getPortfolioOverview(
  userId: string,
  portfolioId: string
): Promise<PortfolioOverview> {
  const portfolio = await getPortfolioForUser(portfolioId, userId);

  const [positions, cash, realized, snapshots] = await Promise.all([
    prisma.position.findMany({
      where: { portfolioId },
      include: { asset: true },
      orderBy: { updatedAt: "desc" }
    }),
    getPortfolioCash(prisma, portfolioId),
    prisma.execution.aggregate({
      where: {
        order: {
          portfolioId
        }
      },
      _sum: {
        realizedPnl: true
      }
    }),
    prisma.portfolioSnapshot.findMany({
      where: { portfolioId },
      orderBy: { snapshotDate: "asc" },
      take: 120
    })
  ]);

  const enrichedPositions: PositionOverview[] = [];

  for (const position of positions) {
    const quote = await getLatestPriceForAsset({
      ...toLookup(position.asset),
      id: position.assetId
    });
    const quantity = toNumber(position.quantity);
    const averageCost = toNumber(position.averageCost);
    const currentPrice = quote.price;
    const value = quantity * currentPrice;
    const costBasis = quantity * averageCost;
    const unrealizedPnl = value - costBasis;

    enrichedPositions.push({
      id: position.id,
      assetId: position.assetId,
      symbol: position.asset.symbol,
      name: position.asset.name,
      quantity,
      averageCost,
      currentPrice,
      value,
      unrealizedPnl,
      unrealizedPnlPercent: calculatePercentChange(value, costBasis),
      weight: 0,
      sector: position.asset.sector
    });
  }

  const cashValue = toNumber(cash);
  const investedValue = enrichedPositions.reduce((sum, position) => sum + position.value, 0);
  const totalValue = cashValue + investedValue;
  const unrealizedPnl = enrichedPositions.reduce((sum, position) => sum + position.unrealizedPnl, 0);
  const realizedPnl = toNumber(realized._sum.realizedPnl ?? 0);
  const initialCash = toNumber(portfolio.initialCash);
  const totalPnl = totalValue - initialCash;
  const performancePercent = calculatePercentChange(totalValue, initialCash);

  const positionsWithWeights = enrichedPositions.map((position) => ({
    ...position,
    weight: calculateWeight(position.value, totalValue)
  }));

  const latestSnapshot = snapshots.at(-1);
  const previousSnapshot = snapshots.at(-2);
  const dailyChangeAmount =
    latestSnapshot && previousSnapshot
      ? toNumber(latestSnapshot.totalValue) - toNumber(previousSnapshot.totalValue)
      : 0;
  const dailyChangePercent =
    latestSnapshot && previousSnapshot
      ? calculatePercentChange(
          toNumber(latestSnapshot.totalValue),
          toNumber(previousSnapshot.totalValue)
        )
      : 0;

  const allocation = positionsWithWeights.map((position) => ({
    label: position.symbol,
    value: position.value,
    weight: position.weight
  }));

  const sectorMap = new Map<string, number>();
  for (const position of positionsWithWeights) {
    const label = position.sector || "Non classe";
    sectorMap.set(label, (sectorMap.get(label) ?? 0) + position.value);
  }

  const sectorAllocation = Array.from(sectorMap.entries()).map(([label, value]) => ({
    label,
    value,
    weight: calculateWeight(value, totalValue)
  }));

  return {
    portfolio: {
      id: portfolio.id,
      name: portfolio.name,
      baseCurrency: portfolio.baseCurrency,
      initialCash,
      benchmarkSymbol: portfolio.benchmarkSymbol,
      description: portfolio.description,
      strategy: portfolio.strategy
    },
    cashValue,
    investedValue,
    totalValue,
    unrealizedPnl,
    realizedPnl,
    totalPnl,
    performancePercent,
    dailyChangeAmount,
    dailyChangePercent,
    drawdownPercent: calculateDrawdown(snapshots.map((snapshot) => toNumber(snapshot.totalValue))),
    positions: positionsWithWeights,
    topGainers: [...positionsWithWeights]
      .sort((a, b) => b.unrealizedPnlPercent - a.unrealizedPnlPercent)
      .slice(0, 5),
    topLosers: [...positionsWithWeights]
      .sort((a, b) => a.unrealizedPnlPercent - b.unrealizedPnlPercent)
      .slice(0, 5),
    allocation,
    sectorAllocation,
    chartData:
      snapshots.length > 0
        ? snapshots.map((snapshot) => ({
            date: snapshot.snapshotDate.toISOString().slice(0, 10),
            totalValue: toNumber(snapshot.totalValue),
            benchmark: portfolio.benchmarkSymbol
              ? initialCash * (1 + snapshots.indexOf(snapshot) * 0.0015)
              : undefined
          }))
        : [
            {
              date: new Date().toISOString().slice(0, 10),
              totalValue,
              benchmark: portfolio.benchmarkSymbol ? initialCash : undefined
            }
          ]
  };
}

export async function createPortfolioSnapshot(input: {
  userId: string;
  portfolioId: string;
  date?: Date;
}) {
  const snapshotDate = startOfUtcDay(input.date ?? new Date());
  const overview = await getPortfolioOverview(input.userId, input.portfolioId);
  const previous = await prisma.portfolioSnapshot.findFirst({
    where: {
      portfolioId: input.portfolioId,
      snapshotDate: {
        lt: snapshotDate
      }
    },
    orderBy: { snapshotDate: "desc" }
  });

  const dailyChangeAmount = previous
    ? overview.totalValue - toNumber(previous.totalValue)
    : overview.dailyChangeAmount;
  const dailyChangePercent = previous
    ? calculatePercentChange(overview.totalValue, toNumber(previous.totalValue))
    : overview.dailyChangePercent;

  return prisma.portfolioSnapshot.upsert({
    where: {
      portfolioId_snapshotDate: {
        portfolioId: input.portfolioId,
        snapshotDate
      }
    },
    update: {
      totalValue: new Prisma.Decimal(overview.totalValue),
      cashValue: new Prisma.Decimal(overview.cashValue),
      investedValue: new Prisma.Decimal(overview.investedValue),
      unrealizedPnl: new Prisma.Decimal(overview.unrealizedPnl),
      realizedPnl: new Prisma.Decimal(overview.realizedPnl),
      dailyChangeAmount: new Prisma.Decimal(dailyChangeAmount),
      dailyChangePercent: new Prisma.Decimal(dailyChangePercent)
    },
    create: {
      portfolioId: input.portfolioId,
      snapshotDate,
      totalValue: new Prisma.Decimal(overview.totalValue),
      cashValue: new Prisma.Decimal(overview.cashValue),
      investedValue: new Prisma.Decimal(overview.investedValue),
      unrealizedPnl: new Prisma.Decimal(overview.unrealizedPnl),
      realizedPnl: new Prisma.Decimal(overview.realizedPnl),
      dailyChangeAmount: new Prisma.Decimal(dailyChangeAmount),
      dailyChangePercent: new Prisma.Decimal(dailyChangePercent)
    }
  });
}

export async function getGlobalDashboard(userId: string) {
  const portfolios = await prisma.portfolio.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });

  const overviews = [];

  for (const portfolio of portfolios) {
    overviews.push(await getPortfolioOverview(userId, portfolio.id));
  }

  const totalValue = overviews.reduce((sum, item) => sum + item.totalValue, 0);
  const cashValue = overviews.reduce((sum, item) => sum + item.cashValue, 0);
  const investedValue = overviews.reduce((sum, item) => sum + item.investedValue, 0);
  const totalPnl = overviews.reduce((sum, item) => sum + item.totalPnl, 0);
  const initialCash = overviews.reduce((sum, item) => sum + item.portfolio.initialCash, 0);

  return {
    portfolios: overviews,
    totalValue,
    cashValue,
    investedValue,
    totalPnl,
    performancePercent: calculatePercentChange(totalValue, initialCash)
  };
}
