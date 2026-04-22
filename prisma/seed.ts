import { AssetType, CashLedgerType, OrderSide, OrderStatus, OrderType, Prisma } from "@prisma/client";
import { prisma } from "../src/server/db/prisma";
import { startOfUtcDay, addDaysUtc } from "../src/lib/dates";
import { hashPassword } from "../src/server/security/password";

const passwordHash = await hashPassword("DemoPassword123!");

const user = await prisma.user.upsert({
  where: { email: "demo@example.com" },
  update: {},
  create: {
    email: "demo@example.com",
    passwordHash,
    emailVerified: true,
    emailVerifiedAt: new Date(),
    preferences: {
      create: {
        dailyEmailEnabled: true,
        timezone: "Europe/Paris",
        preferredCurrency: "EUR",
        dailyEmailHour: 22
      }
    }
  }
});

const portfolio = await prisma.portfolio.upsert({
  where: { id: "demo_portfolio_long_term" },
  update: {},
  create: {
    id: "demo_portfolio_long_term",
    userId: user.id,
    name: "Simulation long terme",
    baseCurrency: "EUR",
    initialCash: new Prisma.Decimal(50000),
    benchmarkSymbol: "CW8",
    description: "Portefeuille de demonstration pour tester le dashboard.",
    strategy: "ETF coeur, quelques actions satellites, reequilibrage mensuel simule."
  }
});

await prisma.portfolioCashLedger.upsert({
  where: { id: "demo_initial_deposit" },
  update: {},
  create: {
    id: "demo_initial_deposit",
    portfolioId: portfolio.id,
    type: CashLedgerType.INITIAL_DEPOSIT,
    amount: new Prisma.Decimal(50000),
    currency: "EUR",
    note: "Capital fictif initial"
  }
});

const assets = await Promise.all(
  [
    {
      symbol: "CW8",
      name: "Amundi MSCI World UCITS ETF",
      assetType: AssetType.ETF,
      exchange: "EPA",
      currency: "EUR",
      sector: "Broad Market",
      country: "France",
      quantity: 55,
      averageCost: 465,
      price: 492
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corporation",
      assetType: AssetType.STOCK,
      exchange: "NASDAQ",
      currency: "EUR",
      sector: "Technology",
      country: "United States",
      quantity: 25,
      averageCost: 330,
      price: 354
    }
  ].map(async (asset) => {
    const created = await prisma.asset.upsert({
      where: {
        symbol_exchange_currency: {
          symbol: asset.symbol,
          exchange: asset.exchange,
          currency: asset.currency
        }
      },
      update: {},
      create: {
        symbol: asset.symbol,
        name: asset.name,
        assetType: asset.assetType,
        exchange: asset.exchange,
        currency: asset.currency,
        sector: asset.sector,
        country: asset.country
      }
    });

    await prisma.position.upsert({
      where: {
        portfolioId_assetId: {
          portfolioId: portfolio.id,
          assetId: created.id
        }
      },
      update: {
        quantity: new Prisma.Decimal(asset.quantity),
        averageCost: new Prisma.Decimal(asset.averageCost)
      },
      create: {
        portfolioId: portfolio.id,
        assetId: created.id,
        quantity: new Prisma.Decimal(asset.quantity),
        averageCost: new Prisma.Decimal(asset.averageCost)
      }
    });

    await prisma.assetPrice.upsert({
      where: {
        assetId_timestamp: {
          assetId: created.id,
          timestamp: startOfUtcDay(new Date())
        }
      },
      update: {
        close: new Prisma.Decimal(asset.price)
      },
      create: {
        assetId: created.id,
        timestamp: startOfUtcDay(new Date()),
        close: new Prisma.Decimal(asset.price)
      }
    });

    return { ...asset, id: created.id };
  })
);

for (const asset of assets) {
  const quantity = new Prisma.Decimal(asset.quantity);
  const price = new Prisma.Decimal(asset.averageCost);
  const gross = quantity.mul(price);

  await prisma.order.upsert({
    where: { id: `demo_order_${asset.symbol}` },
    update: {},
    create: {
      id: `demo_order_${asset.symbol}`,
      portfolioId: portfolio.id,
      assetId: asset.id,
      side: OrderSide.BUY,
      orderType: OrderType.MARKET,
      quantity,
      status: OrderStatus.FILLED,
      executions: {
        create: {
          executedPrice: price,
          executedQuantity: quantity,
          fees: gross.mul(5).div(10000),
          realizedPnl: new Prisma.Decimal(0)
        }
      }
    }
  });
}

for (const asset of assets) {
  const gross = new Prisma.Decimal(asset.quantity).mul(asset.averageCost);
  await prisma.portfolioCashLedger.upsert({
    where: { id: `demo_cash_${asset.symbol}_buy` },
    update: {},
    create: {
      id: `demo_cash_${asset.symbol}_buy`,
      portfolioId: portfolio.id,
      type: CashLedgerType.TRADE_BUY,
      amount: gross.negated(),
      currency: "EUR",
      note: `Achat demo ${asset.symbol}`
    }
  });
  await prisma.portfolioCashLedger.upsert({
    where: { id: `demo_cash_${asset.symbol}_fee` },
    update: {},
    create: {
      id: `demo_cash_${asset.symbol}_fee`,
      portfolioId: portfolio.id,
      type: CashLedgerType.FEE,
      amount: gross.mul(5).div(10000).negated(),
      currency: "EUR",
      note: `Frais demo ${asset.symbol}`
    }
  });
}

const today = startOfUtcDay(new Date());
for (let index = 40; index >= 0; index -= 1) {
  const date = addDaysUtc(today, -index);
  const total = 50000 + (40 - index) * 180 + Math.sin(index / 3) * 1200;
  await prisma.portfolioSnapshot.upsert({
    where: {
      portfolioId_snapshotDate: {
        portfolioId: portfolio.id,
        snapshotDate: date
      }
    },
    update: {},
    create: {
      portfolioId: portfolio.id,
      snapshotDate: date,
      totalValue: new Prisma.Decimal(total),
      cashValue: new Prisma.Decimal(16000),
      investedValue: new Prisma.Decimal(total - 16000),
      unrealizedPnl: new Prisma.Decimal(total - 50000),
      realizedPnl: new Prisma.Decimal(0),
      dailyChangeAmount: new Prisma.Decimal(index === 40 ? 0 : 180),
      dailyChangePercent: new Prisma.Decimal(index === 40 ? 0 : 0.36)
    }
  });
}

console.log("Seed complete. Demo account: demo@example.com / DemoPassword123!");
