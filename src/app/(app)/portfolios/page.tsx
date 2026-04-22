import { Briefcase, Plus } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listUserPortfolios } from "@/features/portfolios/service";
import { formatDateOnly } from "@/lib/dates";
import { formatMoney } from "@/lib/format";
import { requireUser } from "@/server/security/sessions";

export default async function PortfoliosPage() {
  const user = await requireUser();
  const portfolios = await listUserPortfolios(user.id);

  if (portfolios.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title="Aucun portefeuille"
        description="Ajoutez un portefeuille fictif Waren pour suivre chaque strategie separement."
        action={
          <Button asChild>
            <Link href="/portfolios/new">
              <Plus aria-hidden="true" />
              Creer
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
          <p className="text-sm font-semibold uppercase tracking-normal text-muted-foreground">
            Simulation
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal">Portefeuilles</h1>
        </div>
        <Button asChild>
          <Link href="/portfolios/new">
            <Plus aria-hidden="true" />
            Nouveau
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {portfolios.map((portfolio) => (
          <Card key={portfolio.id} className="transition hover:border-ring">
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold tracking-normal">{portfolio.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Cree le {formatDateOnly(portfolio.createdAt)}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border/70 pt-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Capital initial</p>
                  <p className="font-semibold tabular-nums">
                    {formatMoney(Number(portfolio.initialCash), portfolio.baseCurrency)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Positions</p>
                  <p className="font-semibold tabular-nums">
                    {portfolio.positions.length}
                  </p>
                </div>
              </div>
              <Button asChild className="mt-5 w-full" variant="outline">
                <Link href={`/portfolios/${portfolio.id}`}>Ouvrir</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
