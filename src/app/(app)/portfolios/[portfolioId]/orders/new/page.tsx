import { getPortfolioForUser } from "@/features/portfolios/service";
import { OrderForm } from "@/features/orders/order-form";
import { requireUser } from "@/server/security/sessions";

export default async function NewOrderPage({
  params
}: {
  params: Promise<{ portfolioId: string }>;
}) {
  const user = await requireUser();
  const { portfolioId } = await params;
  const portfolio = await getPortfolioForUser(portfolioId, user.id);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-normal text-muted-foreground">
          Ordre simule
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-normal">{portfolio.name}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Waren execute l'ordre dans le moteur de simulation uniquement. Aucun ordre reel
          n'est transmis.
        </p>
      </div>
      <OrderForm portfolioId={portfolio.id} defaultCurrency={portfolio.baseCurrency} />
    </div>
  );
}
