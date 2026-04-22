"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "@/features/auth/actions";
import { initialActionState } from "@/lib/errors";
import { SubmitButton } from "@/components/forms/submit-button";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(loginAction, initialActionState);

  return (
    <Card>
      <CardContent className="p-6">
        <form action={action} className="space-y-4">
          {state.message ? <Alert>{state.message}</Alert> : null}
          <input type="hidden" name="next" value={next ?? "/dashboard"} />
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          <SubmitButton className="w-full">Se connecter</SubmitButton>
        </form>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          Nouveau compte ?{" "}
          <Link href="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
            S'inscrire
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
