"use client";

import { Trash2 } from "lucide-react";
import { useActionState } from "react";
import { deletePortfolioAction } from "@/features/portfolios/actions";
import { initialActionState } from "@/lib/errors";
import { SubmitButton } from "@/components/forms/submit-button";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DeletePortfolioForm({
  portfolioId,
  portfolioName
}: {
  portfolioId: string;
  portfolioName: string;
}) {
  const [state, action] = useActionState(deletePortfolioAction, initialActionState);

  return (
    <Card className="border-[#efcdc8]">
      <CardHeader>
        <CardTitle className="text-[color:var(--negative)]">Zone sensible</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4">
          {state.message ? <Alert>{state.message}</Alert> : null}
          <input type="hidden" name="portfolioId" value={portfolioId} />
          <p className="text-sm leading-6 text-muted-foreground">
            La suppression efface le portefeuille, ses positions, ordres, executions,
            mouvements de cash, snapshots et logs emails associes. Cette action ne peut
            pas etre annulee.
          </p>
          <div className="grid gap-2">
            <Label htmlFor="confirmationName">
              Saisir exactement:{" "}
              <span className="font-semibold text-foreground">{portfolioName}</span>
            </Label>
            <Input
              id="confirmationName"
              name="confirmationName"
              autoComplete="off"
              required
            />
          </div>
          <SubmitButton variant="destructive">
            <Trash2 aria-hidden="true" />
            Supprimer le portefeuille
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
