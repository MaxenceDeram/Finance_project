import { OrderForm } from "@/features/orders/order-form";
import { getPortfolioOverview } from "@/features/analytics/service";
import { searchAssets } from "@/features/assets/service";
import { requireUser } from "@/server/security/sessions";

export default async function NewOrderPage({
  params
}: {
  params: Promise<{ portfolioId: string }>;
}) {
  const user = await requireUser();
  const { portfolioId } = await params;
  const [overview, initialAssets] = await Promise.all([
    getPortfolioOverview(user.id, portfolioId),
    searchAssets("")
  ]);

  return (
    <OrderForm
      portfolioId={overview.portfolio.id}
      defaultCurrency={overview.portfolio.baseCurrency}
      cashValue={overview.cashValue}
      positions={overview.positions.map((position) => ({
        symbol: position.symbol,
        quantity: position.quantity,
        value: position.value,
        unrealizedPnl: position.unrealizedPnl
      }))}
      initialAssets={initialAssets}
    />
  );
}
