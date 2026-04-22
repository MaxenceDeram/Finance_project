import { Briefcase, Landmark, LineChart, Plus, WalletCards } from "lucide-react";
import Link from "next/link";
import { AllocationChart } from "@/components/charts/allocation-chart";
import { PerformanceChart } from "@/components/charts/performance-chart";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
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
        description="Creez votre premier portefeuille Waren avec un capital fictif pour commencer a simuler."
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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal text-muted-foreground">
            Vue Waren
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal">Tableau de bord</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Suivez la valeur fictive, le cash, l'allocation et la performance globale de
            vos simulations.
          </p>
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
          value={formatMoney(
            dashboard.totalValue,
            firstPortfolio?.portfolio.baseCurrency ?? "EUR"
          )}
          icon={WalletCards}
        />
        <StatCard
          label="Cash"
          value={formatMoney(
            dashboard.cashValue,
            firstPortfolio?.portfolio.baseCurrency ?? "EUR"
          )}
          icon={Landmark}
        />
        <StatCard
          label="Investi"
          value={formatMoney(
            dashboard.investedValue,
            firstPortfolio?.portfolio.baseCurrency ?? "EUR"
          )}
          icon={Briefcase}
        />
        <StatCard
          label="Performance"
          value={formatPercent(dashboard.performancePercent)}
          icon={LineChart}
          tone={dashboard.performancePercent >= 0 ? "positive" : "negative"}
          detail={formatMoney(
            dashboard.totalPnl,
            firstPortfolio?.portfolio.baseCurrency ?? "EUR"
          )}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Evolution principale</CardTitle>
            <CardDescription>
              Snapshots de valeur et benchmark si configure.
            </CardDescription>
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
            <CardDescription>Repartition par actif ouvert.</CardDescription>
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
          <CardTitle>Portefeuilles Waren</CardTitle>
          <CardDescription>
            Chaque portefeuille conserve son propre cash et historique.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dashboard.portfolios.map((overview) => (
            <Link
              key={overview.portfolio.id}
              href={`/portfolios/${overview.portfolio.id}`}
              className="rounded-md border border-border/80 bg-[color:var(--surface)] p-5 transition hover:border-ring hover:bg-card"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-semibold tracking-normal">
                    {overview.portfolio.name}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {overview.positions.length} positions ouvertes
                  </p>
                </div>
                <p className="text-right font-semibold tabular-nums">
                  {formatMoney(overview.totalValue, overview.portfolio.baseCurrency)}
                </p>
              </div>
              <p className="mt-5 border-t border-border/70 pt-4 text-sm text-muted-foreground">
                Performance: {formatPercent(overview.performancePercent)}
              </p>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
