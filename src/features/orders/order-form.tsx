"use client";

import { ArrowDownLeft, ArrowUpRight, ShieldCheck } from "lucide-react";
import { useActionState } from "react";
import { SubmitButton } from "@/components/forms/submit-button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { placeMarketOrderAction } from "@/features/orders/actions";
import { initialActionState } from "@/lib/errors";

export function OrderForm({
  portfolioId,
  defaultCurrency
}: {
  portfolioId: string;
  defaultCurrency: string;
}) {
  const [state, action] = useActionState(placeMarketOrderAction, initialActionState);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/80 bg-card">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <CardTitle>Passer un ordre simule</CardTitle>
            <CardDescription>
              Execution au marche avec controle du cash et des quantites disponibles.
            </CardDescription>
          </div>
          <Badge variant="secondary">Argent fictif</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <form action={action} className="grid lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-6 p-6">
            {state.message ? <Alert>{state.message}</Alert> : null}
            <input type="hidden" name="portfolioId" value={portfolioId} />

            <section className="grid gap-3">
              <Label>Sens de l'ordre</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-[color:var(--surface)] p-4 transition hover:border-ring has-[:checked]:border-ring has-[:checked]:bg-[color:var(--positive-soft)]">
                  <input
                    type="radio"
                    name="side"
                    value="BUY"
                    defaultChecked
                    className="size-4 accent-[color:var(--positive)]"
                  />
                  <span className="flex size-9 items-center justify-center rounded-md bg-card text-[color:var(--positive)]">
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">Achat au marche</span>
                    <span className="block text-xs text-muted-foreground">
                      Debite le cash fictif disponible.
                    </span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-[color:var(--surface)] p-4 transition hover:border-ring has-[:checked]:border-ring has-[:checked]:bg-[color:var(--negative-soft)]">
                  <input
                    type="radio"
                    name="side"
                    value="SELL"
                    className="size-4 accent-[color:var(--negative)]"
                  />
                  <span className="flex size-9 items-center justify-center rounded-md bg-card text-[color:var(--negative)]">
                    <ArrowDownLeft className="size-4" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">Vente au marche</span>
                    <span className="block text-xs text-muted-foreground">
                      Controle la quantite detenue.
                    </span>
                  </span>
                </label>
              </div>
            </section>

            <section className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-[0.8fr_1.2fr]">
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantite</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="0.00000001"
                    step="0.00000001"
                    placeholder="10"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="assetType">Classe d'actif</Label>
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
            </section>
          </div>

          <aside className="border-t border-border/80 bg-[color:var(--surface)] p-6 lg:border-l lg:border-t-0">
            <div className="grid gap-5">
              <div>
                <p className="text-sm font-semibold">Details de marche</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Waren utilise le provider de donnees configure pour simuler le prix
                  d'execution.
                </p>
              </div>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="exchange">Exchange</Label>
                  <Input id="exchange" name="exchange" placeholder="NASDAQ" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="currency">Devise</Label>
                  <Input
                    id="currency"
                    name="currency"
                    defaultValue={defaultCurrency}
                    maxLength={3}
                    required
                  />
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
              <div className="rounded-md border border-border bg-card p-4 text-sm leading-6 text-muted-foreground">
                <div className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                  <ShieldCheck className="size-4" aria-hidden="true" />
                  Controle automatique
                </div>
                Cash suffisant a l'achat, quantite detenue a la vente, frais simules,
                ledger cash et position moyenne sont recalcules cote serveur.
              </div>
              <SubmitButton className="w-full">Executer l'ordre marche</SubmitButton>
            </div>
          </aside>
        </form>
      </CardContent>
    </Card>
  );
}
