"use client";

import { useActionState } from "react";
import { updateEmailPreferencesAction } from "@/features/users/actions";
import { initialActionState } from "@/lib/errors";
import { SubmitButton } from "@/components/forms/submit-button";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type Preferences = {
  dailyEmailEnabled: boolean;
  timezone: string;
  preferredCurrency: string;
  dailyEmailHour: number;
};

export function EmailPreferencesForm({ preferences }: { preferences: Preferences }) {
  const [state, action] = useActionState(
    updateEmailPreferencesAction,
    initialActionState
  );

  return (
    <Card>
      <CardContent className="p-6">
        <form action={action} className="grid gap-5">
          {state.message ? <Alert>{state.message}</Alert> : null}
          <label className="flex items-center gap-3 rounded-md border border-border bg-[color:var(--surface)] p-4">
            <input
              type="checkbox"
              name="dailyEmailEnabled"
              defaultChecked={preferences.dailyEmailEnabled}
              className="size-4"
            />
            <span>
              <span className="block text-sm font-semibold">
                Recevoir les emails Waren quotidiens
              </span>
              <span className="block text-sm text-muted-foreground">
                Synthese apres la fermeture du marche.
              </span>
            </span>
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="timezone">Fuseau horaire</Label>
              <Input
                id="timezone"
                name="timezone"
                defaultValue={preferences.timezone}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="preferredCurrency">Devise preferee</Label>
              <Select
                id="preferredCurrency"
                name="preferredCurrency"
                defaultValue={preferences.preferredCurrency}
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dailyEmailHour">Heure approximative</Label>
              <Input
                id="dailyEmailHour"
                name="dailyEmailHour"
                type="number"
                min="0"
                max="23"
                defaultValue={preferences.dailyEmailHour}
                required
              />
            </div>
          </div>
          <SubmitButton>Enregistrer</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
