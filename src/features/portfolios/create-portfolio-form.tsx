"use client";

import { useActionState } from "react";
import { createPortfolioAction } from "@/features/portfolios/actions";
import { initialActionState } from "@/lib/errors";
import { SubmitButton } from "@/components/forms/submit-button";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function CreatePortfolioForm() {
  const [state, action] = useActionState(createPortfolioAction, initialActionState);

  return (
    <Card>
      <CardContent className="p-6">
        <form action={action} className="grid gap-5">
          {state.message ? <Alert>{state.message}</Alert> : null}
          <div className="grid gap-2">
            <Label htmlFor="name">Nom</Label>
            <Input id="name" name="name" placeholder="Portefeuille long terme" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="baseCurrency">Devise</Label>
              <Select id="baseCurrency" name="baseCurrency" defaultValue="EUR">
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="initialCash">Capital fictif initial</Label>
              <Input id="initialCash" name="initialCash" type="number" min="1" step="0.01" defaultValue="10000" required />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="benchmarkSymbol">Benchmark optionnel</Label>
            <Input id="benchmarkSymbol" name="benchmarkSymbol" placeholder="SPY, CW8, VUSA..." />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="Objectif du portefeuille" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="strategy">Strategie</Label>
            <Textarea id="strategy" name="strategy" placeholder="Regles d'allocation, horizon, discipline..." />
          </div>
          <SubmitButton>Creer le portefeuille</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
