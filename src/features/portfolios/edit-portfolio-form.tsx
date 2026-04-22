"use client";

import { useActionState } from "react";
import { updatePortfolioAction } from "@/features/portfolios/actions";
import { initialActionState } from "@/lib/errors";
import { SubmitButton } from "@/components/forms/submit-button";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type EditablePortfolio = {
  id: string;
  name: string;
  benchmarkSymbol: string | null;
  description: string | null;
  strategy: string | null;
};

export function EditPortfolioForm({ portfolio }: { portfolio: EditablePortfolio }) {
  const [state, action] = useActionState(updatePortfolioAction, initialActionState);

  return (
    <Card>
      <CardContent className="p-6">
        <form action={action} className="grid gap-5">
          {state.message ? <Alert>{state.message}</Alert> : null}
          <input type="hidden" name="portfolioId" value={portfolio.id} />
          <div className="grid gap-2">
            <Label htmlFor="name">Nom</Label>
            <Input id="name" name="name" defaultValue={portfolio.name} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="benchmarkSymbol">Benchmark</Label>
            <Input
              id="benchmarkSymbol"
              name="benchmarkSymbol"
              defaultValue={portfolio.benchmarkSymbol ?? ""}
              placeholder="SPY, CW8, VUSA..."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={portfolio.description ?? ""}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="strategy">Strategie</Label>
            <Textarea id="strategy" name="strategy" defaultValue={portfolio.strategy ?? ""} />
          </div>
          <SubmitButton>Enregistrer</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
