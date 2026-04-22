"use client";

import { useActionState } from "react";
import { placeMarketOrderAction } from "@/features/orders/actions";
import { initialActionState } from "@/lib/errors";
import { SubmitButton } from "@/components/forms/submit-button";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export function OrderForm({
  portfolioId,
  defaultCurrency
}: {
  portfolioId: string;
  defaultCurrency: string;
}) {
  const [state, action] = useActionState(placeMarketOrderAction, initialActionState);

  return (
    <Card>
      <CardContent className="p-6">
        <form action={action} className="grid gap-5">
          {state.message ? <Alert>{state.message}</Alert> : null}
          <input type="hidden" name="portfolioId" value={portfolioId} />
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="side">Sens</Label>
              <Select id="side" name="side" defaultValue="BUY">
                <option value="BUY">Achat</option>
                <option value="SELL">Vente</option>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantite</Label>
              <Input id="quantity" name="quantity" type="number" min="0.00000001" step="0.00000001" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="assetType">Type</Label>
              <Select id="assetType" name="assetType" defaultValue="STOCK">
                <option value="STOCK">Action</option>
                <option value="ETF">ETF</option>
                <option value="CRYPTO">Crypto</option>
                <option value="INDEX">Indice</option>
                <option value="OTHER">Autre</option>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="symbol">Symbole</Label>
              <Input id="symbol" name="symbol" placeholder="AAPL" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Nom de l'actif</Label>
              <Input id="name" name="name" placeholder="Apple Inc." required />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="grid gap-2">
              <Label htmlFor="exchange">Exchange</Label>
              <Input id="exchange" name="exchange" placeholder="NASDAQ" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="currency">Devise</Label>
              <Input id="currency" name="currency" defaultValue={defaultCurrency} maxLength={3} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sector">Secteur</Label>
              <Input id="sector" name="sector" placeholder="Technology" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="country">Pays</Label>
              <Input id="country" name="country" placeholder="United States" />
            </div>
          </div>
          <SubmitButton>Executer l'ordre marche</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
