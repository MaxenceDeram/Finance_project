import {
  AuditAction,
  CashLedgerType,
  OrderSide,
  OrderStatus,
  OrderType,
  Prisma
} from "@prisma/client";
import { getEnv } from "@/config/env";
import { AppError } from "@/lib/errors";
import { prisma } from "@/server/db/prisma";
import { getLatestPriceForAsset } from "@/server/market-data/price-service";
import { writeAuditLog } from "@/server/security/audit";
import { placeMarketOrderSchema } from "@/validation/orders";
import { findOrCreateAsset, toLookup } from "@/features/assets/service";
import { assertPortfolioOwner, getPortfolioCash } from "@/features/portfolios/service";

export async function placeMarketOrder(input: {
  userId: string;
  values: unknown;
  ipHash?: string | null;
}) {
  const parsed = placeMarketOrderSchema.parse(input.values);
  const asset = await findOrCreateAsset(parsed.asset);
  const quote = await getLatestPriceForAsset({ ...toLookup(asset), id: asset.id });
  const env = getEnv();

  const order = await prisma.$transaction(async (tx) => {
    const portfolio = await assertPortfolioOwner(tx, parsed.portfolioId, input.userId);
    const quantity = new Prisma.Decimal(parsed.quantity);
    const executedPrice = new Prisma.Decimal(quote.price);
    const grossAmount = quantity.mul(executedPrice);
    const fees = grossAmount.mul(env.SIMULATED_FEE_BPS).div(10_000).toDecimalPlaces(4);
    const cash = await getPortfolioCash(tx, portfolio.id);

    if (parsed.side === OrderSide.BUY) {
      const requiredCash = grossAmount.plus(fees);

      if (cash.lt(requiredCash)) {
        throw new AppError("INSUFFICIENT_CASH", "Cash fictif insuffisant.", 400);
      }

      const createdOrder = await tx.order.create({
        data: {
          portfolioId: portfolio.id,
          assetId: asset.id,
          side: OrderSide.BUY,
          orderType: OrderType.MARKET,
          quantity,
          requestedPrice: null,
          status: OrderStatus.FILLED,
          executions: {
            create: {
              executedPrice,
              executedQuantity: quantity,
              fees,
              realizedPnl: new Prisma.Decimal(0)
            }
          }
        }
      });

      await tx.portfolioCashLedger.createMany({
        data: [
          {
            portfolioId: portfolio.id,
            type: CashLedgerType.TRADE_BUY,
            amount: grossAmount.negated(),
            currency: portfolio.baseCurrency,
            note: `Achat ${asset.symbol}`
          },
          {
            portfolioId: portfolio.id,
            type: CashLedgerType.FEE,
            amount: fees.negated(),
            currency: portfolio.baseCurrency,
            note: `Frais achat ${asset.symbol}`
          }
        ]
      });

      const existingPosition = await tx.position.findUnique({
        where: {
          portfolioId_assetId: {
            portfolioId: portfolio.id,
            assetId: asset.id
          }
        }
      });

      if (existingPosition) {
        const newQuantity = existingPosition.quantity.plus(quantity);
        const newAverageCost = existingPosition.quantity
          .mul(existingPosition.averageCost)
          .plus(quantity.mul(executedPrice))
          .div(newQuantity);

        await tx.position.update({
          where: { id: existingPosition.id },
          data: {
            quantity: newQuantity,
            averageCost: newAverageCost
          }
        });
      } else {
        await tx.position.create({
          data: {
            portfolioId: portfolio.id,
            assetId: asset.id,
            quantity,
            averageCost: executedPrice
          }
        });
      }

      return createdOrder;
    }

    const position = await tx.position.findUnique({
      where: {
        portfolioId_assetId: {
          portfolioId: portfolio.id,
          assetId: asset.id
        }
      }
    });

    if (!position || position.quantity.lt(quantity)) {
      throw new AppError("INSUFFICIENT_POSITION", "Quantite detenue insuffisante.", 400);
    }

    const realizedPnl = executedPrice.minus(position.averageCost).mul(quantity).minus(fees);

    const createdOrder = await tx.order.create({
      data: {
        portfolioId: portfolio.id,
        assetId: asset.id,
        side: OrderSide.SELL,
        orderType: OrderType.MARKET,
        quantity,
        requestedPrice: null,
        status: OrderStatus.FILLED,
        executions: {
          create: {
            executedPrice,
            executedQuantity: quantity,
            fees,
            realizedPnl
          }
        }
      }
    });

    await tx.portfolioCashLedger.createMany({
      data: [
        {
          portfolioId: portfolio.id,
          type: CashLedgerType.TRADE_SELL,
          amount: grossAmount,
          currency: portfolio.baseCurrency,
          note: `Vente ${asset.symbol}`
        },
        {
          portfolioId: portfolio.id,
          type: CashLedgerType.FEE,
          amount: fees.negated(),
          currency: portfolio.baseCurrency,
          note: `Frais vente ${asset.symbol}`
        }
      ]
    });

    const newQuantity = position.quantity.minus(quantity);
    if (newQuantity.lte(0)) {
      await tx.position.delete({ where: { id: position.id } });
    } else {
      await tx.position.update({
        where: { id: position.id },
        data: { quantity: newQuantity }
      });
    }

    return createdOrder;
  });

  await writeAuditLog({
    userId: input.userId,
    action: AuditAction.ORDER_PLACED,
    metadata: { orderId: order.id, side: parsed.side, asset: asset.symbol },
    ipHash: input.ipHash
  });

  return order;
}

export async function listOrdersForUser(userId: string, portfolioId?: string) {
  return prisma.order.findMany({
    where: {
      portfolio: {
        userId,
        id: portfolioId
      }
    },
    include: {
      asset: true,
      portfolio: true,
      executions: true
    },
    orderBy: { createdAt: "desc" },
    take: 100
  });
}
