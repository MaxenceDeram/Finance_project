import { ArrowUpRight, ClipboardList, Landmark, LineChart, ShoppingCart, WalletCards } from "lucide-react";
import Link from "next/link";
import { AllocationChart } from "@/components/charts/allocation-chart";
import { PerformanceChart } from "@/components/charts/performance-chart";
import { PositionsTable } from "@/components/dashboard/positions-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPortfolioOverview } from "@/features/analytics/service";
import { listOrdersForUser } from "@/features/orders/service";
import { formatMoney, formatPercent } from "@/lib/format";
import { requireUser } from "@/server/security/sessions";
import { OrdersTable } from "@/components/dashboard/orders-table";

export default async function PortfolioDetailPage({
  params
}: {
  params: Promise<{ portfolioId: string }>;
}) {
  const user = await requireUser();
  const { portfolioId } = await params;
  const [overview, orders] = await Promise.all([
    getPortfolioOverview(user.id, portfolioId),
    listOrdersForUser(user.id, portfolioId)
  ]);
  const currency = overview.portfolio.baseCurrency;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Portefeuille
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal">{overview.portfolio.name}</h1>
          {overview.portfolio.description ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {overview.portfolio.description}
            </p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/orders">
              <ClipboardList aria-hidden="true" />
              Historique
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/portfolios/${portfolioId}/orders/new`}>
              <ShoppingCart aria-hidden="true" />
              Passer un ordre
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Valeur totale" value={formatMoney(overview.totalValue, currency)} icon={WalletCards} />
        <StatCard label="Cash disponible" value={formatMoney(overview.cashValue, currency)} icon={Landmark} />
        <StatCard label="P&L total" value={formatMoney(overview.totalPnl, currency)} icon={ArrowUpRight} tone={overview.totalPnl >= 0 ? "positive" : "negative"} />
        <StatCard label="Performance" value={formatPercent(overview.performancePercent)} icon={LineChart} tone={overview.performancePercent >= 0 ? "positive" : "negative"} detail={`Drawdown: ${formatPercent(overview.drawdownPercent)}`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Evolution</CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceChart data={overview.chartData} currency={currency} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Allocation par actif</CardTitle>
          </CardHeader>
          <CardContent>
            <AllocationChart data={overview.allocation} currency={currency} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Positions ouvertes</CardTitle>
        </CardHeader>
        <CardContent>
          {overview.positions.length > 0 ? (
            <PositionsTable positions={overview.positions} currency={currency} />
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aucune position ouverte.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Derniers ordres</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length > 0 ? (
            <OrdersTable orders={orders} />
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">Aucun ordre execute.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
