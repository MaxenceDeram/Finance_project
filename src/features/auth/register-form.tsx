"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction } from "@/features/auth/actions";
import { initialActionState } from "@/lib/errors";
import { SubmitButton } from "@/components/forms/submit-button";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const [state, action] = useActionState(registerAction, initialActionState);

  return (
    <Card>
      <CardContent className="p-6">
        <form action={action} className="space-y-4">
          {state.message ? <Alert>{state.message}</Alert> : null}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
            />
            {state.fieldErrors?.password?.[0] ? (
              <p className="text-xs text-destructive">{state.fieldErrors.password[0]}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmation</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
            />
          </div>
          <SubmitButton className="w-full">Creer mon compte Waren</SubmitButton>
        </form>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          Deja inscrit ?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
