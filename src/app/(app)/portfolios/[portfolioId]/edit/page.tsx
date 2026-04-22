import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EditPortfolioForm } from "@/features/portfolios/edit-portfolio-form";
import { getPortfolioForUser } from "@/features/portfolios/service";
import { requireUser } from "@/server/security/sessions";

export default async function EditPortfolioPage({
  params
}: {
  params: Promise<{ portfolioId: string }>;
}) {
  const user = await requireUser();
  const { portfolioId } = await params;
  const portfolio = await getPortfolioForUser(portfolioId, user.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Edition
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal">{portfolio.name}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Le capital initial et la devise restent verrouilles pour préserver l'historique
            comptable du portefeuille.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/portfolios/${portfolio.id}`}>Retour</Link>
        </Button>
      </div>
      <EditPortfolioForm portfolio={portfolio} />
    </div>
  );
}
