import { Briefcase, Landmark, LineChart, Plus, WalletCards } from "lucide-react";
import Link from "next/link";
import { AllocationChart } from "@/components/charts/allocation-chart";
import { PerformanceChart } from "@/components/charts/performance-chart";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getGlobalDashboard } from "@/features/analytics/service";
import { formatMoney, formatPercent } from "@/lib/format";
import { requireUser } from "@/server/security/sessions";

export default async function DashboardPage() {
  const user = await requireUser();
  const dashboard = await getGlobalDashboard(user.id);
  const firstPortfolio = dashboard.portfolios[0];

  if (dashboard.portfolios.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title="Aucun portefeuille"
        description="Creez un premier portefeuille fictif avec un capital de depart pour commencer a simuler."
        action={
          <Button asChild>
            <Link href="/portfolios/new">
              <Plus aria-hidden="true" />
              Nouveau portefeuille
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Vue globale
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal">Dashboard</h1>
        </div>
        <Button asChild>
          <Link href="/portfolios/new">
            <Plus aria-hidden="true" />
            Nouveau portefeuille
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Valeur totale"
          value={formatMoney(dashboard.totalValue, firstPortfolio?.portfolio.baseCurrency ?? "EUR")}
          icon={WalletCards}
        />
        <StatCard
          label="Cash"
          value={formatMoney(dashboard.cashValue, firstPortfolio?.portfolio.baseCurrency ?? "EUR")}
          icon={Landmark}
        />
        <StatCard
          label="Investi"
          value={formatMoney(dashboard.investedValue, firstPortfolio?.portfolio.baseCurrency ?? "EUR")}
          icon={Briefcase}
        />
        <StatCard
          label="Performance"
          value={formatPercent(dashboard.performancePercent)}
          icon={LineChart}
          tone={dashboard.performancePercent >= 0 ? "positive" : "negative"}
          detail={formatMoney(dashboard.totalPnl, firstPortfolio?.portfolio.baseCurrency ?? "EUR")}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Evolution principale</CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceChart
              data={firstPortfolio.chartData}
              currency={firstPortfolio.portfolio.baseCurrency}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <AllocationChart
              data={firstPortfolio.allocation}
              currency={firstPortfolio.portfolio.baseCurrency}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portefeuilles</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dashboard.portfolios.map((overview) => (
            <Link
              key={overview.portfolio.id}
              href={`/portfolios/${overview.portfolio.id}`}
              className="rounded-lg border bg-background p-4 transition hover:border-ring"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-semibold tracking-normal">{overview.portfolio.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {overview.positions.length} positions ouvertes
                  </p>
                </div>
                <p className="text-right font-semibold">
                  {formatMoney(overview.totalValue, overview.portfolio.baseCurrency)}
                </p>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Performance: {formatPercent(overview.performancePercent)}
              </p>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
