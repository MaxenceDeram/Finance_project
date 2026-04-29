"use client";

import { Link2, WandSparkles } from "lucide-react";
import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { initialActionState } from "@/lib/errors";
import { importJobOfferFromUrlAction } from "./actions";

export function JobOfferImportForm() {
  const [state, action] = useActionState(
    importJobOfferFromUrlAction,
    initialActionState
  );

  return (
    <Card>
      <CardHeader>
        <div className="inline-flex size-10 items-center justify-center rounded-2xl border border-border bg-[#f8faff] text-muted-foreground">
          <WandSparkles className="size-4" aria-hidden="true" />
        </div>
        <CardTitle className="mt-4">Importer depuis une offre</CardTitle>
        <CardDescription>
          Collez une URL: Waren tente de pre-remplir entreprise, poste, lieu et type de
          contrat.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="relative">
            <Link2
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              name="listingUrl"
              type="url"
              placeholder="https://jobs.ashbyhq.com/..."
              className="pl-11"
              required
            />
          </div>
          <Button type="submit">
            <WandSparkles aria-hidden="true" />
            Importer
          </Button>
          {state.message ? (
            <div className="md:col-span-2">
              <Alert>{state.message}</Alert>
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
