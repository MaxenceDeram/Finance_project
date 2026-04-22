import { CreatePortfolioForm } from "@/features/portfolios/create-portfolio-form";

export default function NewPortfolioPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Nouveau portefeuille
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-normal">Capital fictif</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Chaque portefeuille possede son propre cash, historique, benchmark et strategie.
        </p>
      </div>
      <CreatePortfolioForm />
    </div>
  );
}
