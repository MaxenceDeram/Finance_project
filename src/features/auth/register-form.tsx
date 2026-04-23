"use client";

import Link from "next/link";
import { KeyRound, Mail, MoveRight } from "lucide-react";
import { useActionState } from "react";
import { registerAction } from "@/features/auth/actions";
import { initialActionState } from "@/lib/errors";
import { SubmitButton } from "@/components/forms/submit-button";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const [state, action] = useActionState(registerAction, initialActionState);

  return (
    <form action={action} className="space-y-5">
      {state.message ? <Alert>{state.message}</Alert> : null}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="pl-11"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <div className="relative">
          <KeyRound
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className="pl-11"
          />
        </div>
        {state.fieldErrors?.password?.[0] ? (
          <p className="text-xs text-[color:var(--negative)]">
            {state.fieldErrors.password[0]}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Choisissez un mot de passe robuste. La confirmation email est requise avant
            acces.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmation</Label>
        <div className="relative">
          <KeyRound
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            className="pl-11"
          />
        </div>
      </div>

      <SubmitButton className="w-full">
        Creer mon espace
        <MoveRight aria-hidden="true" />
      </SubmitButton>

      <p className="text-center text-sm text-muted-foreground">
        Deja inscrit ?{" "}
        <Link
          href="/login"
          className="font-semibold text-foreground underline-offset-4 hover:underline"
        >
          Se connecter
        </Link>
      </p>
    </form>
  );
}
